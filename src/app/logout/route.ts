import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function GET() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  // Hard redirect to clear any client-side caches/router state
  return redirect("/login");
}
