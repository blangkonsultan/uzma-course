import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";
import type { Json } from "@/types/database";
import { createAdminClient } from "@/lib/supabase/admin";

export type ProfileWithPrograms = Profile & {
  profile_programs?: { program_id: string }[];
  profile_branches?: { branch_id: string; is_primary: boolean }[];
};

export interface GetPaginatedGurusParams {
  search: string;
  branch: string;
  status: string;
  page: number;
  pageSize: number;
}

export async function getPaginatedGurus(params: GetPaginatedGurusParams) {
  const supabase = await createClient();
  const { search, branch, status, page, pageSize } = params;

  let query = supabase
    .from("profiles")
    .select("*, profile_programs(program_id)", { count: "exact" })
    .eq("role", "guru");
  if (branch !== "all") {
    query = query.eq("branch_id", branch);
  }

  if (status === "active") {
    query = query.eq("is_active", true);
  } else if (status === "inactive") {
    query = query.eq("is_active", false);
  }

  if (search) {
    query = query.ilike("full_name", `%${search}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);
  const profileBranchesMap: Record<string, { branch_id: string; is_primary: boolean }[]> = {};
  try {
    const profileIds = (data || []).map((p) => p.id);
    if (profileIds.length > 0) {
      const { data: pbData } = await supabase
        .from("profile_branches")
        .select("profile_id, branch_id, is_primary")
        .in("profile_id", profileIds);
      if (pbData) {
        pbData.forEach((pb) => {
          if (!profileBranchesMap[pb.profile_id]) {
            profileBranchesMap[pb.profile_id] = [];
          }
          profileBranchesMap[pb.profile_id].push({
            branch_id: pb.branch_id,
            is_primary: pb.is_primary,
          });
        });
      }
    }
  } catch {
    // Graceful fallback if profile_branches table does not exist
  }

  const enrichedData = (data || []).map((guru) => ({
    ...guru,
    profile_branches:
      profileBranchesMap[guru.id] && profileBranchesMap[guru.id].length > 0
        ? profileBranchesMap[guru.id]
        : guru.branch_id
        ? [{ branch_id: guru.branch_id, is_primary: true }]
        : [],
  })) as ProfileWithPrograms[];

  return { data: enrichedData, count: count || 0 };
}

export async function getGuruById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*, profile_programs(program_id)")
    .eq("id", id)
    .eq("role", "guru")
    .single();

  if (!data) return null;

  let profileBranches: { branch_id: string; is_primary: boolean }[] = [];
  try {
    const { data: pbData } = await supabase
      .from("profile_branches")
      .select("branch_id, is_primary")
      .eq("profile_id", id);
    if (pbData && pbData.length > 0) {
      profileBranches = pbData;
    }
  } catch {
    // Graceful fallback if profile_branches table does not exist
  }

  if (profileBranches.length === 0 && data.branch_id) {
    profileBranches = [{ branch_id: data.branch_id, is_primary: true }];
  }

  return {
    ...data,
    profile_branches: profileBranches,
  } as ProfileWithPrograms;
}

export interface CreateGuruProfileData {
  email?: string;
  password?: string;
  fullName: string;
  phone?: string | null;
  birthDate?: string | null;
  branchId?: string | null;
  branchIds?: string[];
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountHolder?: string | null;
  allowances?: Json[];
  minimumIncome?: number | null;
  programs?: string[];
}

export async function insertGuruProfile(data: CreateGuruProfileData) {
  const adminClient = createAdminClient();

  const {
    email,
    password,
    fullName,
    phone,
    birthDate,
    branchId,
    branchIds,
    bankName,
    bankAccountNumber,
    bankAccountHolder,
    allowances,
    minimumIncome,
    programs,
  } = data;

  const effectivePrimaryBranch = branchId || (branchIds && branchIds.length > 0 ? branchIds[0] : null);
  const effectiveBranchIds = branchIds && branchIds.length > 0 ? branchIds : (branchId ? [branchId] : []);

  // 1. Create auth user with service role
  const { data: userData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: "guru",
    },
  });

  if (authError || !userData.user) {
    const msg = authError?.message || "";
    if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("exists")) {
      throw new Error("Email ini sudah terdaftar sebagai pengguna.");
    }
    throw new Error(msg || "Gagal membuat akun autentikasi guru.");
  }

  const newUserId = userData.user.id;

  // 2. Update the profile row
  const { error: profileError } = await adminClient.from("profiles").upsert({
    id: newUserId,
    full_name: fullName,
    phone,
    birth_date: birthDate,
    role: "guru",
    branch_id: effectivePrimaryBranch,
    is_active: true,
    bank_name: bankName,
    bank_account_number: bankAccountNumber,
    bank_account_holder: bankAccountHolder,
    allowances: allowances as Json[] | undefined,
    minimum_income: minimumIncome,
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    throw new Error(`Akun dibuat tetapi gagal mengisi data profil: ${profileError.message}`);
  }

  // 3. Assign profile_branches junction
  if (effectiveBranchIds.length > 0) {
    const { error: branchJunctionError } = await adminClient
      .from("profile_branches")
      .insert(
        effectiveBranchIds.map((bId) => ({
          profile_id: newUserId,
          branch_id: bId,
          is_primary: bId === effectivePrimaryBranch,
        }))
      );

    if (branchJunctionError) {
      console.error("Notice: profile_branches insert error:", branchJunctionError);
    }
  }

  // 4. Assign profile_programs junction
  if (programs && programs.length > 0) {
    const { error: junctionError } = await adminClient
      .from("profile_programs")
      .insert(
        programs.map((pid: string) => ({
          profile_id: newUserId,
          program_id: pid,
        }))
      );

    if (junctionError) {
      throw new Error(`Akun dibuat tetapi gagal menugaskan program: ${junctionError.message}`);
    }
  }

  return newUserId;
}

export interface UpdateGuruProfileData {
  fullName: string;
  phone?: string | null;
  birthDate?: string | null;
  branchId?: string | null;
  branchIds?: string[];
  isActive: boolean;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountHolder?: string | null;
  allowances?: Json[];
  minimumIncome?: number | null;
  programs?: string[];
}

export async function updateGuruProfile(id: string, data: UpdateGuruProfileData) {
  const supabase = await createClient();
  const {
    fullName,
    phone,
    birthDate,
    branchId,
    branchIds,
    isActive,
    bankName,
    bankAccountNumber,
    bankAccountHolder,
    allowances,
    minimumIncome,
    programs,
  } = data;

  const effectivePrimaryBranch = branchId || (branchIds && branchIds.length > 0 ? branchIds[0] : null);
  const effectiveBranchIds = branchIds && branchIds.length > 0 ? branchIds : (branchId ? [branchId] : []);

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
      birth_date: birthDate,
      branch_id: effectivePrimaryBranch,
      is_active: isActive,
      bank_name: bankName,
      bank_account_number: bankAccountNumber,
      bank_account_holder: bankAccountHolder,
      allowances: allowances as Json[] | undefined,
      minimum_income: minimumIncome,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("role", "guru");

  if (error) {
    throw new Error(error.message);
  }

  // Update profile_branches junction with graceful fallback
  try {
    await supabase.from("profile_branches").delete().eq("profile_id", id);

    if (effectiveBranchIds.length > 0) {
      await supabase.from("profile_branches").insert(
        effectiveBranchIds.map((bId) => ({
          profile_id: id,
          branch_id: bId,
          is_primary: bId === effectivePrimaryBranch,
        }))
      );
    }
  } catch (pbErr) {
    console.error("Notice: profile_branches update error:", pbErr);
  }

  // Delete existing profile_programs and re-insert
  const { error: deleteError } = await supabase
    .from("profile_programs")
    .delete()
    .eq("profile_id", id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (programs && programs.length > 0) {
    const { error: junctionError } = await supabase
      .from("profile_programs")
      .insert(
        programs.map((pid: string) => ({
          profile_id: id,
          program_id: pid,
        }))
      );

    if (junctionError) {
      throw new Error(junctionError.message);
    }
  }
}

export async function toggleGuruStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      is_active: !currentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("role", "guru");

  if (error) {
    throw new Error(error.message);
  }
}
