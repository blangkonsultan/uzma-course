import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Gift, Calendar, User, GraduationCap } from "lucide-react";

interface BirthdayPerson {
  id: string;
  name: string;
  role: "guru" | "murid";
  branch_name?: string;
  birthDate: Date;
  daysDiff: number;
  ageTurn: number;
}

function getBirthdayData(birthDateStr: string | null): { daysDiff: number; ageTurn: number } | null {
  if (!birthDateStr) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bdate = new Date(birthDateStr);
  if (isNaN(bdate.getTime())) return null;

  const bdayThisYear = new Date(today.getFullYear(), bdate.getMonth(), bdate.getDate());
  
  const diffTime = bdayThisYear.getTime() - today.getTime();
  let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < -180) {
    bdayThisYear.setFullYear(today.getFullYear() + 1);
    diffDays = Math.ceil((bdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  } else if (diffDays > 180) {
    bdayThisYear.setFullYear(today.getFullYear() - 1);
    diffDays = Math.ceil((bdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  if (diffDays >= -7 && diffDays <= 7) {
    const ageTurn = bdayThisYear.getFullYear() - bdate.getFullYear();
    return { daysDiff: diffDays, ageTurn };
  }

  return null;
}

export async function BirthdayDashboard({ branchId, isAdmin }: { branchId?: string, isAdmin: boolean }) {
  const supabase = await createClient();

  let guruQuery = supabase.from("profiles").select("id, full_name, birth_date, role, branches(name)").eq("is_active", true).not("birth_date", "is", null);
  let muridQuery = supabase.from("students").select("id, full_name, birth_date, branches(name)").eq("is_active", true).not("birth_date", "is", null);

  if (!isAdmin && branchId) {
    guruQuery = guruQuery.eq("branch_id", branchId);
    muridQuery = muridQuery.eq("branch_id", branchId);
  }

  const [{ data: gurus }, { data: murids }] = await Promise.all([guruQuery, muridQuery]);

  const upcomingBirthdays: BirthdayPerson[] = [];

  if (gurus) {
    gurus.forEach(g => {
      const bData = getBirthdayData(g.birth_date);
      if (bData) {
        upcomingBirthdays.push({
          id: g.id,
          name: g.full_name,
          role: "guru",
          branch_name: (g.branches as { name?: string } | null)?.name || "Pusat",
          birthDate: new Date(g.birth_date!),
          daysDiff: bData.daysDiff,
          ageTurn: bData.ageTurn
        });
      }
    });
  }

  if (murids) {
    murids.forEach(m => {
      const bData = getBirthdayData(m.birth_date);
      if (bData) {
        upcomingBirthdays.push({
          id: m.id,
          name: m.full_name,
          role: "murid",
          branch_name: (m.branches as { name?: string } | null)?.name || "Pusat",
          birthDate: new Date(m.birth_date!),
          daysDiff: bData.daysDiff,
          ageTurn: bData.ageTurn
        });
      }
    });
  }

  upcomingBirthdays.sort((a, b) => a.daysDiff - b.daysDiff);

  if (upcomingBirthdays.length === 0) {
    return null;
  }

  return (
    <Card className="border-pink-100 bg-pink-50/30 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Gift className="w-32 h-32 text-pink-900" />
      </div>
      <CardHeader className="border-b border-pink-100/50 pb-3 bg-white/50">
        <h3 className="font-semibold text-pink-900 flex items-center gap-2">
          <Gift className="w-4 h-4 text-pink-500" />
          Ulang Tahun (H-7 s/d H+7)
        </h3>
      </CardHeader>
      <CardBody className="p-0">
        <div className="divide-y divide-pink-100/50">
          {upcomingBirthdays.map((person) => {
            const isToday = person.daysDiff === 0;
            const isPast = person.daysDiff < 0;
            
            return (
              <div key={`${person.role}-${person.id}`} className={`p-4 flex items-start gap-4 transition-colors ${isToday ? 'bg-pink-100/50' : 'hover:bg-white/50'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isToday ? 'bg-pink-500 text-white shadow-sm shadow-pink-200' : person.role === 'guru' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                  {person.role === 'guru' ? <User className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-medium truncate ${isToday ? 'text-pink-900 font-bold' : 'text-slate-900'}`}>
                      {person.name}
                    </p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                      isToday ? 'bg-pink-500 text-white animate-pulse' :
                      isPast ? 'bg-slate-100 text-slate-500' :
                      'bg-pink-100 text-pink-700'
                    }`}>
                      {isToday ? 'Hari Ini!' : isPast ? `${Math.abs(person.daysDiff)} hari lalu` : `H-${person.daysDiff}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {person.birthDate.toLocaleDateString("id-ID", { day: "numeric", month: "long" })}
                    </span>
                    <span className="flex items-center gap-1 text-slate-300">|</span>
                    <span className="capitalize">{person.role} • {person.branch_name}</span>
                    <span className="flex items-center gap-1 text-slate-300">|</span>
                    <span className="font-medium text-pink-600">Ke-{person.ageTurn}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
