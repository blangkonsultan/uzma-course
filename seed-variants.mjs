import { createClient } from "@supabase/supabase-js";


// Load from environment or fallback to prompt variables if set locally
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Menghapus data junction murid dan guru lama...");
  await supabase.from("student_programs").delete().neq("student_id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("profile_programs").delete().neq("profile_id", "00000000-0000-0000-0000-000000000000");

  console.log("Menghapus data program lama...");
  await supabase.from("program_variants").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("programs").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  console.log("Menyiapkan master program baru...");
  const programsData = [
    {
      id: crypto.randomUUID(),
      initials: "AHE",
      name: "Les Baca AHE",
      tagline: "Anak Hebat",
      description: "Bimbingan belajar membaca dengan metode yang menyenangkan, tanpa tekanan, dan ramah anak.",
      age_range: "4-7 tahun",
      icon: "BookOpen",
      type: "franchise",
      license_provider: "AHE Pusat",
      frequency: 3,
      features: ["Modul Lengkap", "Sertifikat", "Metode Ramah Anak"],
      sort_order: 1,
      is_active: true
    },
    {
      id: crypto.randomUUID(),
      initials: "ASE",
      name: "Les Hitung ASE",
      tagline: "Ala Sekolah",
      description: "Bimbingan belajar berhitung dasar hingga lanjutan untuk anak usia SD dengan metode yang mudah dipahami.",
      age_range: "SD (Kelas 1-6)",
      icon: "Calculator",
      type: "franchise",
      license_provider: "AHE Pusat",
      frequency: 3,
      features: ["Modul Latihan", "Pemecahan Masalah"],
      sort_order: 2,
      is_active: true
    },
    {
      id: crypto.randomUUID(),
      initials: "BEE",
      name: "Brainy English Education",
      tagline: "BEE English",
      description: "Kursus bahasa Inggris interaktif yang melatih kepercayaan diri anak dalam berbicara dan memahami bahasa.",
      age_range: "TK - SD",
      icon: "MessageCircle",
      type: "franchise",
      license_provider: "BEE Indonesia",
      frequency: 2,
      features: ["Native Speaker Audio", "Flashcards", "Speaking Practice"],
      sort_order: 3,
      is_active: true
    },
    {
      id: crypto.randomUUID(),
      initials: "MAPEL",
      name: "Bimbel Mata Pelajaran",
      tagline: "Pendampingan Belajar SD",
      description: "Bimbingan belajar mata pelajaran sekolah secara privat untuk memaksimalkan potensi akademik anak.",
      age_range: "SD (Kelas 1-6)",
      icon: "GraduationCap",
      type: "original",
      license_provider: null,
      frequency: 3,
      features: ["Bantuan PR", "Persiapan Ujian", "Privat 1-on-1"],
      sort_order: 4,
      is_active: true
    }
  ];

  const { data: insertedPrograms, error: progErr } = await supabase.from("programs").insert(programsData).select();
  if (progErr) {
    console.error("Gagal memasukkan program:", progErr.message);
    return;
  }
  
  console.log("Program utama berhasil dimasukkan.");

  const variantsData = [];

  insertedPrograms.forEach(p => {
    if (p.initials === "AHE") {
      variantsData.push({
        program_id: p.id,
        name: "AHE Reguler",
        duration: 30,
        system: 2,
        teacher_fee: 3000,
        default_spp: 150000,
        sort_order: 1
      });
    } else if (p.initials === "ASE") {
      variantsData.push({
        program_id: p.id,
        name: "ASE Reguler",
        duration: 30,
        system: 2,
        teacher_fee: 3000,
        default_spp: 150000,
        sort_order: 1
      });
    } else if (p.initials === "BEE") {
      variantsData.push({
        program_id: p.id,
        name: "BEE 30 Menit",
        duration: 30,
        system: 2,
        teacher_fee: 3000,
        default_spp: 150000,
        sort_order: 1
      });
      variantsData.push({
        program_id: p.id,
        name: "BEE 45 Menit",
        duration: 45,
        system: 2,
        teacher_fee: 4000,
        default_spp: 200000,
        sort_order: 2
      });
      variantsData.push({
        program_id: p.id,
        name: "BEE 60 Menit",
        duration: 60,
        system: 2,
        teacher_fee: 5000,
        default_spp: 250000,
        sort_order: 3
      });
    } else if (p.initials === "MAPEL") {
      variantsData.push({
        program_id: p.id,
        name: "Mapel 60 Menit",
        duration: 60,
        system: 1,
        teacher_fee: 5000,
        default_spp: 150000,
        sort_order: 1
      });
      variantsData.push({
        program_id: p.id,
        name: "Mapel 90 Menit",
        duration: 90,
        system: 1,
        teacher_fee: 7500,
        default_spp: 200000,
        sort_order: 2
      });
    }
  });

  const { error: varErr } = await supabase.from("program_variants").insert(variantsData);
  if (varErr) {
    console.error("Gagal memasukkan varian program:", varErr.message);
  } else {
    console.log("Semua varian program berhasil di-generate! Data sudah sinkron.");
  }
}

seed();
