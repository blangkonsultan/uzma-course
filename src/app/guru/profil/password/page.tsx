import { requireGuruPage } from "@/lib/auth";
import { PasswordForm } from "@/components/guru/password-form";

export const metadata = {
  title: "Ganti Kata Sandi | Uzma Course",
};

export default async function ChangePasswordPage() {
  await requireGuruPage();

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto">
      <PasswordForm />
    </div>
  );
}
