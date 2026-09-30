import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl shadow-md border border-slate-100">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
