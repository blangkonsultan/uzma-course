import { randomBytes } from "node:crypto";

function getPassword(passwordSource, guru) {
  if (typeof passwordSource === "string") return passwordSource;
  if (passwordSource && typeof passwordSource.password === "string") {
    return passwordSource.password;
  }
  if (passwordSource && typeof passwordSource.getPassword === "function") {
    return passwordSource.getPassword(guru);
  }
  return `Demo-${randomBytes(18).toString("base64url")}`;
}

export async function deleteCreatedUsers(adminClient, userIds) {
  for (const userId of userIds) {
    const result = await adminClient.auth.admin.deleteUser(userId);
    if (result?.error) {
      throw new Error(`Gagal membersihkan akun guru dummy: ${result.error.message}`);
    }
  }
}

export async function createGuruUsers(adminClient, guruFixtures, passwordSource) {
  const createdUsers = [];

  try {
    for (const guru of guruFixtures) {
      const password = getPassword(passwordSource, guru);
      const result = await adminClient.auth.admin.createUser({
        email: guru.email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: guru.fullName,
          role: "guru",
        },
      });

      if (result?.error || !result?.data?.user?.id) {
        throw new Error(
          `Gagal membuat akun guru ${guru.email}: ${result?.error?.message || "user tidak dikembalikan."}`
        );
      }

      createdUsers.push({
        id: result.data.user.id,
        email: guru.email,
        fullName: guru.fullName,
        password,
      });
    }

    return createdUsers;
  } catch (error) {
    if (createdUsers.length > 0) {
      try {
        await deleteCreatedUsers(
          adminClient,
          createdUsers.map((user) => user.id)
        );
      } catch (cleanupError) {
        const cleanupMessage = cleanupError instanceof Error ? cleanupError.message : String(cleanupError);
        const originalMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`${originalMessage} Cleanup juga gagal: ${cleanupMessage}`);
      }
    }
    throw error;
  }
}
