import type { Database } from "./database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Student = Database["public"]["Tables"]["students"]["Row"];
export type StudentInsert = Database["public"]["Tables"]["students"]["Insert"];
export type StudentUpdate = Database["public"]["Tables"]["students"]["Update"];

export type Branch = Database["public"]["Tables"]["branches"]["Row"];
export type BranchInsert = Database["public"]["Tables"]["branches"]["Insert"];
export type BranchUpdate = Database["public"]["Tables"]["branches"]["Update"];

export type Program = Database["public"]["Tables"]["programs"]["Row"] & { program_variants?: ProgramVariant[] };
export type ProgramInsert = Database["public"]["Tables"]["programs"]["Insert"];
export type ProgramVariant = Database["public"]["Tables"]["program_variants"]["Row"];
export type ProgramVariantInsert = Database["public"]["Tables"]["program_variants"]["Insert"];
export type ProgramVariantUpdate = Database["public"]["Tables"]["program_variants"]["Update"];

export type BranchShift = Database["public"]["Tables"]["branch_shifts"]["Row"];
export type BranchShiftInsert = Database["public"]["Tables"]["branch_shifts"]["Insert"];
export type BranchShiftUpdate = Database["public"]["Tables"]["branch_shifts"]["Update"];

export type ProgramUpdate = Database["public"]["Tables"]["programs"]["Update"];

export type StudentProgram = Database["public"]["Tables"]["student_programs"]["Row"];
export type StudentProgramInsert = Database["public"]["Tables"]["student_programs"]["Insert"];
export type StudentProgramUpdate = Database["public"]["Tables"]["student_programs"]["Update"];

export type ProfileProgram = Database["public"]["Tables"]["profile_programs"]["Row"];
export type ProfileProgramInsert = Database["public"]["Tables"]["profile_programs"]["Insert"];
export type ProfileProgramUpdate = Database["public"]["Tables"]["profile_programs"]["Update"];

export type LandingContent = Database["public"]["Tables"]["landing_content"]["Row"];

export type UserRole = "admin" | "guru";

export type { Database } from "./database";
