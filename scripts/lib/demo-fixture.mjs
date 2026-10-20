import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const FIXTURE_BRANCHES = ["sumokembangsri", "junwangi"];

export const ADMIN_FIXTURE = {
  key: "admin-local",
  email: "admin@uzmacourse.com",
  fullName: "Admin Uzma Course",
};
export const FIXTURE_PROGRAMS = ["AHE", "ASE", "BEE", "MAPEL"];

const PROGRAM_SPP = {
  AHE: 150000,
  ASE: 175000,
  BEE: 200000,
  MAPEL: 250000,
};

const allowance = (name, amount) => ({ name, amount });

export const GURU_FIXTURES = [
  {
    key: "guru-01",
    email: "guru.demo.01@uzmacourse.test",
    fullName: "Guru Demo 01",
    phone: "08120000001",
    primaryBranchId: "sumokembangsri",
    branchIds: ["sumokembangsri"],
    programInitials: ["AHE", "MAPEL"],
    isActive: true,
    minimumIncome: 1500000,
    allowances: [allowance("Tunjangan Transportasi", 250000), allowance("Tunjangan Kehadiran", 150000)],
  },
  {
    key: "guru-02",
    email: "guru.demo.02@uzmacourse.test",
    fullName: "Guru Demo 02",
    phone: "08120000002",
    primaryBranchId: "junwangi",
    branchIds: ["junwangi"],
    programInitials: ["ASE"],
    isActive: true,
    minimumIncome: 1200000,
    allowances: [],
  },
  {
    key: "guru-03",
    email: "guru.demo.03@uzmacourse.test",
    fullName: "Guru Demo 03",
    phone: "08120000003",
    primaryBranchId: "sumokembangsri",
    branchIds: ["sumokembangsri", "junwangi"],
    programInitials: ["BEE", "MAPEL"],
    isActive: true,
    minimumIncome: 2000000,
    allowances: [allowance("Tunjangan Pendidikan", 300000), allowance("Tunjangan Transportasi", 200000)],
  },
  {
    key: "guru-04",
    email: "guru.demo.04@uzmacourse.test",
    fullName: "Guru Demo 04",
    phone: "08120000004",
    primaryBranchId: "sumokembangsri",
    branchIds: ["sumokembangsri"],
    programInitials: ["AHE"],
    isActive: false,
    minimumIncome: 1000000,
    allowances: [allowance("Tunjangan Kehadiran", 100000)],
  },
  {
    key: "guru-05",
    email: "guru.demo.05@uzmacourse.test",
    fullName: "Guru Demo 05",
    phone: "08120000005",
    primaryBranchId: "junwangi",
    branchIds: ["junwangi"],
    programInitials: ["ASE"],
    isActive: false,
    minimumIncome: 1300000,
    allowances: [allowance("Tunjangan Transportasi", 125000)],
  },
  {
    key: "guru-06",
    email: "guru.demo.06@uzmacourse.test",
    fullName: "Guru Demo 06",
    phone: "08120000006",
    primaryBranchId: "junwangi",
    branchIds: ["junwangi"],
    programInitials: ["BEE", "MAPEL"],
    isActive: true,
    minimumIncome: 2500000,
    allowances: [
      allowance("Tunjangan Transportasi", 300000),
      allowance("Tunjangan Kehadiran", 200000),
      allowance("Tunjangan Kreativitas", 175000),
      allowance("Tunjangan Pendidikan", 350000),
    ],
  },
  {
    key: "guru-07",
    email: "guru.demo.07@uzmacourse.test",
    fullName: "Guru Demo 07",
    phone: "08120000007",
    primaryBranchId: "sumokembangsri",
    branchIds: ["sumokembangsri"],
    programInitials: ["AHE", "BEE"],
    isActive: true,
    minimumIncome: null,
    allowances: [allowance("Tunjangan Transportasi", 100000)],
  },
];

export const STUDENT_FIXTURES = Array.from({ length: 24 }, (_, index) => {
  const number = index + 1;
  const isActive = number !== 23 && number !== 24;
  const lifecycleStatus =
    number <= 18 ? "active" : number <= 20 ? "cuti" : number <= 22 ? "lulus" : "keluar";

  return {
    key: `student-${String(number).padStart(2, "0")}`,
    studentNumber: `DM-${String(number).padStart(3, "0")}`,
    fullName: `Murid Demo ${String(number).padStart(2, "0")}`,
    birthDate: `201${number % 8}-${String((number % 12) + 1).padStart(2, "0")}-${String((number % 24) + 1).padStart(2, "0")}`,
    parentName: `Orang Tua Demo ${String(number).padStart(2, "0")}`,
    parentPhone: `0812999${String(number).padStart(4, "0")}`,
    parentEmail: `ortu.demo.${String(number).padStart(2, "0")}@uzmacourse.test`,
    branchId: number % 2 === 0 ? "junwangi" : "sumokembangsri",
    isActive,
    lifecycleStatus,
  };
});

const ACTIVE_PROGRAMS = [
  ["AHE", "BEE", "MAPEL"],
  ["AHE", "ASE"],
  ["AHE", "MAPEL"],
  ["ASE", "BEE"],
  ["BEE", "MAPEL"],
  ["AHE", "ASE"],
  ["BEE", "MAPEL"],
  ["ASE", "MAPEL"],
  ["AHE"],
  ["ASE"],
  ["BEE"],
  ["MAPEL"],
  ["AHE"],
  ["ASE"],
  ["BEE"],
  ["MAPEL"],
  ["AHE"],
  ["MAPEL"],
];

const NON_ACTIVE_PROGRAMS = [
  ["AHE", "cuti"],
  ["BEE", "cuti"],
  ["ASE", "lulus"],
  ["MAPEL", "lulus"],
  ["AHE", "keluar"],
  ["BEE", "keluar"],
];

export const ENROLLMENT_FIXTURES = [
  ...ACTIVE_PROGRAMS.flatMap((programs, studentIndex) =>
    programs.map((programInitials, programIndex) => ({
      studentKey: `student-${String(studentIndex + 1).padStart(2, "0")}`,
      programInitials,
      status: "active",
      sppAmount: PROGRAM_SPP[programInitials],
      discountType: ["none", "nominal", "percentage"][(studentIndex + programIndex) % 3],
      discountValue:
        (studentIndex + programIndex) % 3 === 0
          ? 0
          : (studentIndex + programIndex) % 3 === 1
            ? studentIndex % 2 === 0
              ? 50000
              : 75000
            : [10, 15, 20][studentIndex % 3],
    }))
  ),
  ...NON_ACTIVE_PROGRAMS.map(([programInitials, status], index) => ({
    studentKey: `student-${String(index + 19).padStart(2, "0")}`,
    programInitials,
    status,
    sppAmount: PROGRAM_SPP[programInitials],
    discountType: ["none", "nominal", "percentage"][index % 3],
    discountValue:
      index % 3 === 0 ? 0 : index % 3 === 1 ? 50000 : [10, 15, 20][index % 3],
  })),
];

export const FIXTURE_EXPECTATIONS = {
  guruCount: 7,
  studentCount: 24,
  payrollPeriodCount: 3,
  minimumIncomeNullGuruCount: 1,
  multiProgramStudentMinimum: 8,
  discountEnrollmentMinimum: 6,
};

function assert(condition, message) {
  if (!condition) throw new Error(`Fixture definition invalid: ${message}`);
}

export function validateFixtureDefinition() {
  assert(GURU_FIXTURES.length === FIXTURE_EXPECTATIONS.guruCount, "guru count mismatch");
  assert(STUDENT_FIXTURES.length === FIXTURE_EXPECTATIONS.studentCount, "student count mismatch");
  assert(
    GURU_FIXTURES.filter((guru) => guru.minimumIncome === null).length ===
      FIXTURE_EXPECTATIONS.minimumIncomeNullGuruCount,
    "nullable minimum income count mismatch"
  );
  assert(
    new Set(GURU_FIXTURES.map((guru) => guru.key)).size === GURU_FIXTURES.length,
    "guru keys must be unique"
  );
  assert(
    new Set(STUDENT_FIXTURES.map((student) => student.key)).size === STUDENT_FIXTURES.length,
    "student keys must be unique"
  );

  for (const guru of GURU_FIXTURES) {
    assert(FIXTURE_BRANCHES.includes(guru.primaryBranchId), `${guru.key} primary branch is invalid`);
    assert(guru.branchIds.includes(guru.primaryBranchId), `${guru.key} primary branch is not assigned`);
    for (const branchId of guru.branchIds) {
      assert(FIXTURE_BRANCHES.includes(branchId), `${guru.key} branch assignment is invalid`);
    }
    for (const programInitials of guru.programInitials) {
      assert(FIXTURE_PROGRAMS.includes(programInitials), `${guru.key} program assignment is invalid`);
    }
  }

  const studentKeys = new Set(STUDENT_FIXTURES.map((student) => student.key));
  const countsByStudent = new Map();
  const discountCounts = { none: 0, nominal: 0, percentage: 0 };
  for (const enrollment of ENROLLMENT_FIXTURES) {
    assert(studentKeys.has(enrollment.studentKey), `${enrollment.studentKey} does not exist`);
    assert(FIXTURE_PROGRAMS.includes(enrollment.programInitials), `${enrollment.programInitials} is invalid`);
    assert(Object.hasOwn(discountCounts, enrollment.discountType), `discount type is invalid`);
    countsByStudent.set(enrollment.studentKey, (countsByStudent.get(enrollment.studentKey) || 0) + 1);
    discountCounts[enrollment.discountType] += 1;
  }

  assert(
    [...countsByStudent.values()].filter((count) => count >= 2).length >=
      FIXTURE_EXPECTATIONS.multiProgramStudentMinimum,
    "multi-program student minimum is not met"
  );
  assert(Math.max(...countsByStudent.values()) >= 3, "three-program student is missing");
  for (const discountType of Object.keys(discountCounts)) {
    assert(
      discountCounts[discountType] >= FIXTURE_EXPECTATIONS.discountEnrollmentMinimum,
      `${discountType} discount minimum is not met`
    );
  }

  return true;
}

function sqlJsonLiteral(value) {
  return `'${JSON.stringify(value).replaceAll("'", "''")}'`;
}

export function renderFixtureSql() {
  const sqlPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../sql/local-demo-fixture.sql");
  let sql = readFileSync(sqlPath, "utf8");
  const replacements = {
    __GURU_FIXTURES_JSON__: sqlJsonLiteral(GURU_FIXTURES),
    __STUDENT_FIXTURES_JSON__: sqlJsonLiteral(STUDENT_FIXTURES),
    __ENROLLMENT_FIXTURES_JSON__: sqlJsonLiteral(ENROLLMENT_FIXTURES),
  };

  for (const [token, value] of Object.entries(replacements)) {
    sql = sql.replaceAll(token, value);
  }

  if (sql.includes("__GURU_FIXTURES_JSON__") || sql.includes("__STUDENT_FIXTURES_JSON__") || sql.includes("__ENROLLMENT_FIXTURES_JSON__")) {
    throw new Error("Fixture SQL contains unresolved data tokens.");
  }

  return sql;
}

validateFixtureDefinition();
