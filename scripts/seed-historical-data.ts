// Seed script — ajoute 2 années académiques complètes à la base existante
// Exécution : npx tsx scripts/seed-historical-data.ts

import Database from "better-sqlite3";

const dbPath = process.cwd() + "/edumali_db/data.db";
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("synchronous = OFF");
sqlite.pragma("foreign_keys = OFF");

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randf(min: number, max: number) { return Math.round((Math.random() * (max - min) + min) * 10) / 10; }
function pick<T>(a: T[]): T { return a[rand(0, a.length - 1)]; }
function esc(s: string | number | null | undefined): string {
  if (s === null || s === undefined) return "NULL";
  return "'" + String(s).replace(/'/g, "''") + "'";
}

// ── Check if already seeded ──
console.log("🔍 Vérification...");
const existingYears = sqlite.prepare("SELECT id, name FROM academic_years ORDER BY id").all() as { id: number; name: string }[];
if (existingYears.length >= 3) {
  console.log("✅ Déjà fait.");
  sqlite.close();
  process.exit(0);
}
console.log(`   Années existantes : ${existingYears.map(y => y.name).join(", ")}`);

// ── Load references ──
const classes = sqlite.prepare("SELECT id, name, level, total_fee FROM classes ORDER BY id").all() as { id: number; name: string; level: number; total_fee: number }[];
const students = sqlite.prepare("SELECT id, first_name, last_name, class_id FROM students WHERE status='Actif' ORDER BY id").all() as { id: number; first_name: string; last_name: string; class_id: number }[];
const subjects = sqlite.prepare("SELECT id, name FROM subjects ORDER BY id").all() as { id: number; name: string }[];
const teachers = sqlite.prepare("SELECT id FROM teachers ORDER BY id").all() as { id: number }[];
const csRows = sqlite.prepare("SELECT class_id, subject_id, coefficient FROM class_subjects ORDER BY class_id, subject_id").all() as { class_id: number; subject_id: number; coefficient: number }[];
const feeTypes = sqlite.prepare("SELECT id, amount FROM fee_types").all() as { id: number; amount: number }[];

// Grouper matières par classe
const subjByClass: Record<number, { subject_id: number; coeff: number }[]> = {};
for (const cs of csRows) {
  if (!subjByClass[cs.class_id]) subjByClass[cs.class_id] = [];
  subjByClass[cs.class_id].push({ subject_id: cs.subject_id, coeff: cs.coefficient });
}

// Map des matières
const subjMap = new Map(subjects.map(s => [s.id, s.name]));

// ── Fix unique index ──
console.log("🔧 Correction index unique evaluations...");
try {
  sqlite.exec("DROP INDEX eval_unique_period");
  sqlite.exec("CREATE UNIQUE INDEX eval_unique_period ON evaluations (class_id, subject_id, trimester, type, academic_year_id)");
  console.log("   OK");
} catch { console.log("   Déjà fait"); }

// ── 1. Academic years ──
console.log("📅 Années académiques...");
sqlite.exec("INSERT OR IGNORE INTO academic_years (id, name, start_date, end_date, is_current) VALUES (2, '2023-2024', '2023-09-15', '2024-06-30', 0)");
sqlite.exec("INSERT OR IGNORE INTO academic_years (id, name, start_date, end_date, is_current) VALUES (3, '2024-2025', '2024-09-15', '2025-06-30', 0)");
console.log("   2023-2024, 2024-2025");

// ── 2. Enrollments ──
console.log("📋 Inscriptions historiques...");
// Pour chaque élève de classe X en 2025-2026 → X-1 en 2024-2025, X-2 en 2023-2024
const studentYearMap: Record<number, Record<number, { class_id: number }>> = {};
let enrCount = 0;
for (const s of students) {
  const prev1 = classes.find(c => c.id === s.class_id - 1);
  if (prev1) {
    studentYearMap[s.id] = studentYearMap[s.id] || {};
    studentYearMap[s.id][3] = { class_id: prev1.id };
    enrCount++;
  }
  const prev2 = classes.find(c => c.id === s.class_id - 2);
  if (prev2) {
    studentYearMap[s.id] = studentYearMap[s.id] || {};
    studentYearMap[s.id][2] = { class_id: prev2.id };
    enrCount++;
  }
}
const enrBatch: string[] = [];
for (const [sidStr, years] of Object.entries(studentYearMap)) {
  for (const [yearId, info] of Object.entries(years)) {
    const yr = yearId === "2" ? 2023 : 2024;
    enrBatch.push(`(${sidStr}, ${info.class_id}, ${yearId}, '${yr}-09-15', 'réinscrit')`);
  }
}
for (let i = 0; i < enrBatch.length; i += 500) {
  sqlite.exec(`INSERT OR IGNORE INTO enrollments (student_id, class_id, academic_year_id, enrollment_date, status) VALUES ${enrBatch.slice(i, i + 500).join(",\n")}`);
}
console.log(`   ${enrCount} inscriptions`);

// ── Helper : générer dates scolaires ──
function schoolDates(year: number) {
  const trimesters: { id: number; devoirBase: string; trimBase: string; dates: string[] }[] = [];
  const periods = [
    { id: 1, start: [year, 8, 15], end: [year, 11, 31], devoir: [year, 10, 15], trim: [year, 12, 5] },
    { id: 2, start: [year + 1, 0, 2], end: [year + 1, 2, 31], devoir: [year + 1, 2, 10], trim: [year + 1, 3, 20] },
    { id: 3, start: [year + 1, 3, 1], end: [year + 1, 5, 30], devoir: [year + 1, 5, 10], trim: [year + 1, 6, 5] },
  ];
  for (const p of periods) {
    const dates: string[] = [];
    const d = new Date(p.start[0], p.start[1], p.start[2]);
    const end = new Date(p.end[0], p.end[1], p.end[2]);
    while (d <= end) {
      if (d.getDay() !== 0 && d.getDay() !== 6) dates.push(d.toISOString().split("T")[0]);
      d.setDate(d.getDate() + 1);
    }
    trimesters.push({
      id: p.id,
      devoirBase: `${p.devoir[0]}-${String(p.devoir[1]).padStart(2, "0")}-${String(rand(10, p.devoir[2])).padStart(2, "0")}`,
      trimBase: `${p.trim[0]}-${String(p.trim[1]).padStart(2, "0")}-${String(rand(1, p.trim[2])).padStart(2, "0")}`,
      dates,
    });
  }
  return trimesters;
}

const currT2T3 = (() => {
  const t2dates: string[] = [];
  const d2 = new Date(2026, 0, 2);
  while (d2 <= new Date(2026, 2, 31)) { if (d2.getDay() !== 0 && d2.getDay() !== 6) t2dates.push(d2.toISOString().split("T")[0]); d2.setDate(d2.getDate() + 1); }
  const t3dates: string[] = [];
  const d3 = new Date(2026, 3, 1);
  while (d3 <= new Date(2026, 5, 30)) { if (d3.getDay() !== 0 && d3.getDay() !== 6) t3dates.push(d3.toISOString().split("T")[0]); d3.setDate(d3.getDate() + 1); }
  return [
    { id: 2, devoirBase: "2026-02-10", trimBase: "2026-03-20", dates: t2dates },
    { id: 3, devoirBase: "2026-05-10", trimBase: "2026-06-05", dates: t3dates },
  ];
})();

const year2Data = schoolDates(2023);
const year3Data = schoolDates(2024);

// ── 3. Evaluations + Grades ──
console.log("📝 Évaluations et notes...");
let evalId = (sqlite.prepare("SELECT COALESCE(MAX(id),0) FROM evaluations").get() as any)["COALESCE(MAX(id),0)"];
let gradeId = (sqlite.prepare("SELECT COALESCE(MAX(id),0) FROM grades").get() as any)["COALESCE(MAX(id),0)"];

// On génère tout en une seule passe : pour chaque (année, classe, trimestre, matière)
// on crée 1 devoir + 1 trimestrielle avec les notes
const evalBatches: string[] = [];
const gradeBatches: string[] = [];

interface YearTrimesterSet {
  yearId: number;
  trimesters: { id: number; devoirBase: string; trimBase: string }[];
}

const yearSets: YearTrimesterSet[] = [
  { yearId: 1, trimesters: currT2T3 },
  { yearId: 2, trimesters: year2Data },
  { yearId: 3, trimesters: year3Data },
];

for (const ys of yearSets) {
  for (const td of ys.trimesters) {
    for (const cls of classes) {
      const subjs = subjByClass[cls.id] || [];
      for (const cs of subjs) {
        const subjName = subjMap.get(cs.subject_id) || "Inconnue";

        // Déterminer les élèves de cette classe pour cette année
        let classStudents: typeof students;
        if (ys.yearId === 1) {
          classStudents = students.filter(s => s.class_id === cls.id);
        } else {
          classStudents = students.filter(s => studentYearMap[s.id]?.[ys.yearId]?.class_id === cls.id);
        }

        // Devoir
        evalId++;
        evalBatches.push(`(${evalId}, ${esc("Devoir - " + subjName)}, 'devoir', ${cls.id}, ${cs.subject_id}, ${td.id}, ${ys.yearId}, ${esc(td.devoirBase)}, 'published')`);

        for (const s of classStudents) {
          gradeId++;
          const absent = Math.random() < 0.03;
          gradeBatches.push(`(${gradeId}, ${evalId}, ${s.id}, ${absent ? 0 : randf(6, 19)}, ${absent ? 1 : 0})`);
        }

        // Trimestrielle
        evalId++;
        evalBatches.push(`(${evalId}, ${esc("Composition - " + subjName)}, 'trimestrielle', ${cls.id}, ${cs.subject_id}, ${td.id}, ${ys.yearId}, ${esc(td.trimBase)}, 'published')`);

        for (const s of classStudents) {
          gradeId++;
          const absent = Math.random() < 0.03;
          gradeBatches.push(`(${gradeId}, ${evalId}, ${s.id}, ${absent ? 0 : randf(6, 19)}, ${absent ? 1 : 0})`);
        }
      }
    }
  }
}

for (let i = 0; i < evalBatches.length; i += 500) {
  sqlite.exec(`INSERT OR IGNORE INTO evaluations (id, name, type, class_id, subject_id, trimester, academic_year_id, date, status) VALUES ${evalBatches.slice(i, i + 500).join(",\n")}`);
}
console.log(`   ${evalBatches.length} évaluations`);

for (let i = 0; i < gradeBatches.length; i += 5000) {
  sqlite.exec(`INSERT OR IGNORE INTO grades (id, evaluation_id, student_id, score, is_absent) VALUES ${gradeBatches.slice(i, i + 5000).join(",\n")}`);
}
console.log(`   ${gradeBatches.length} notes`);

// ── 4. Payments ──
console.log("💳 Paiements...");
let payId = (sqlite.prepare("SELECT COALESCE(MAX(id),0) FROM payments").get() as any)["COALESCE(MAX(id),0)"];
const payBatches: string[] = [];
const methods = ["espèces", "mobile_money", "virement", "chèque"];

function genPayments(yearId: number, yearNum: number, enrolledStudents: typeof students) {
  for (const s of enrolledStudents) {
    for (let m = 9; m <= 12; m++) {
      payId++;
      const ft = pick(feeTypes);
      payBatches.push(`(${payId}, ${s.id}, ${ft.id}, ${ft.amount}, ${esc(pick(methods))}, ${esc("PAY-" + s.id + "-" + rand(1000, 9999))}, ${esc(`${yearNum}-${String(m).padStart(2, "0")}-${String(rand(1, 28)).padStart(2, "0")}`)}, 'payé')`);
    }
    for (let m = 1; m <= 6; m++) {
      payId++;
      const ft = pick(feeTypes);
      payBatches.push(`(${payId}, ${s.id}, ${ft.id}, ${ft.amount}, ${esc(pick(methods))}, ${esc("PAY-" + s.id + "-" + rand(1000, 9999))}, ${esc(`${yearNum + 1}-${String(m).padStart(2, "0")}-${String(rand(1, 28)).padStart(2, "0")}`)}, 'payé')`);
    }
  }
}

// Année 2023-2024
genPayments(2, 2023, students.filter(s => studentYearMap[s.id]?.[2]));
// Année 2024-2025
genPayments(3, 2024, students.filter(s => studentYearMap[s.id]?.[3]));
// Compléter 2025-2026 (jan-juin)
for (const s of students) {
  for (let m = 1; m <= 6; m++) {
    payId++;
    const ft = pick(feeTypes);
    payBatches.push(`(${payId}, ${s.id}, ${ft.id}, ${ft.amount}, ${esc(pick(methods))}, ${esc("PAY-" + s.id + "-" + rand(1000, 9999))}, ${esc(`2026-${String(m).padStart(2, "0")}-${String(rand(1, 28)).padStart(2, "0")}`)}, 'payé')`);
  }
}

for (let i = 0; i < payBatches.length; i += 2000) {
  sqlite.exec(`INSERT OR IGNORE INTO payments (id, student_id, fee_type_id, amount, method, reference, date, status) VALUES ${payBatches.slice(i, i + 2000).join(",\n")}`);
}
console.log(`   ${payBatches.length} paiements`);

// ── 5. Attendance ──
console.log("📅 Présences élèves...");
let attId = (sqlite.prepare("SELECT COALESCE(MAX(id),0) FROM attendance").get() as any)["COALESCE(MAX(id),0)"];
const attBatches: string[] = [];
const attStatuses = ["présent", "absent", "retard", "congé"];
const attWeights = [0.85, 0.05, 0.05, 0.05];

function genAttendance(yearId: number, trimesterData: { id: number; dates: string[] }[], enrolledStudents: typeof students) {
  for (const td of trimesterData) {
    for (const date of td.dates) {
      for (const s of enrolledStudents) {
        attId++;
        const rnd = Math.random();
        let cumul = 0;
        let chosen = attStatuses[0];
        for (let i = 0; i < attStatuses.length; i++) { cumul += attWeights[i]; if (rnd < cumul) { chosen = attStatuses[i]; break; } }
        const cid = yearId === 1 ? s.class_id : studentYearMap[s.id]![yearId].class_id;
        attBatches.push(`(${attId}, ${s.id}, ${cid}, ${esc(date)}, ${esc(chosen)})`);
      }
    }
  }
}

genAttendance(1, currT2T3, students);
genAttendance(2, year2Data, students.filter(s => studentYearMap[s.id]?.[2]));
genAttendance(3, year3Data, students.filter(s => studentYearMap[s.id]?.[3]));

for (let i = 0; i < attBatches.length; i += 5000) {
  sqlite.exec(`INSERT OR IGNORE INTO attendance (id, student_id, class_id, date, status) VALUES ${attBatches.slice(i, i + 5000).join(",\n")}`);
}
console.log(`   ${attBatches.length} présences`);

// ── 6. Expenses ──
console.log("💰 Dépenses...");
let expId = (sqlite.prepare("SELECT COALESCE(MAX(id),0) FROM expenses").get() as any)["COALESCE(MAX(id),0)"];
const expBatches: string[] = [];
const monthNames = ["", "janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

const expenseTemplates: [string, [number, number], string][] = [
  ["Électricité", [65000, 95000], "electricite"],
  ["Eau", [25000, 45000], "eau"],
  ["Fournitures bureau", [20000, 60000], "fournitures"],
  ["Craie et tableaux", [10000, 20000], "fournitures"],
  ["Produits entretien", [15000, 35000], "entretien"],
  ["Transport", [15000, 40000], "transport"],
  ["Personnel entretien", [50000, 70000], "autres"],
];

function genExpenses(yearId: number, yearNum: number) {
  for (let m = 9; m <= 12; m++) {
    for (const et of expenseTemplates) {
      expId++;
      expBatches.push(`(${expId}, ${esc(et[0] + " " + monthNames[m] + " " + yearNum)}, ${rand(et[1][0], et[1][1])}, ${esc(et[2])}, ${esc(`${yearNum}-${String(m).padStart(2, "0")}-${String(rand(1, 28)).padStart(2, "0")}`)}, ${yearId})`);
    }
  }
  for (let m = 1; m <= 6; m++) {
    for (const et of expenseTemplates) {
      expId++;
      expBatches.push(`(${expId}, ${esc(et[0] + " " + monthNames[m] + " " + (yearNum + 1))}, ${rand(et[1][0], et[1][1])}, ${esc(et[2])}, ${esc(`${yearNum + 1}-${String(m).padStart(2, "0")}-${String(rand(1, 28)).padStart(2, "0")}`)}, ${yearId})`);
    }
  }
}

genExpenses(2, 2023);
genExpenses(3, 2024);
// Compléter 2025-2026 (déc + jan-juin)
for (let m = 12; m <= 12; m++) {
  for (const et of expenseTemplates) {
    expId++;
    expBatches.push(`(${expId}, ${esc(et[0] + " décembre 2025")}, ${rand(et[1][0], et[1][1])}, ${esc(et[2])}, ${esc(`2025-12-${String(rand(1, 28)).padStart(2, "0")}`)}, 1)`);
  }
}
for (let m = 1; m <= 6; m++) {
  for (const et of expenseTemplates) {
    expId++;
    expBatches.push(`(${expId}, ${esc(et[0] + " " + monthNames[m] + " 2026")}, ${rand(et[1][0], et[1][1])}, ${esc(et[2])}, ${esc(`2026-${String(m).padStart(2, "0")}-${String(rand(1, 28)).padStart(2, "0")}`)}, 1)`);
  }
}

for (let i = 0; i < expBatches.length; i += 500) {
  sqlite.exec(`INSERT OR IGNORE INTO expenses (id, description, amount, category, date, academic_year_id) VALUES ${expBatches.slice(i, i + 500).join(",\n")}`);
}
console.log(`   ${expBatches.length} dépenses`);

// ── 7. Teacher attendance ──
console.log("📅 Présences enseignants...");
let taId = (sqlite.prepare("SELECT COALESCE(MAX(id),0) FROM teacher_attendance").get() as any)["COALESCE(MAX(id),0)"];
const taBatches: string[] = [];
const taStatuses = ["present", "absent", "retard", "excused"];
const taWeights = [0.90, 0.03, 0.04, 0.03];

function genTeacherAtt(trimesterData: { dates: string[] }[]) {
  for (const td of trimesterData) {
    for (const date of td.dates) {
      for (const t of teachers) {
        taId++;
        const rnd = Math.random();
        let cumul = 0;
        let chosen = taStatuses[0];
        for (let i = 0; i < taStatuses.length; i++) { cumul += taWeights[i]; if (rnd < cumul) { chosen = taStatuses[i]; break; } }
        taBatches.push(`(${taId}, ${t.id}, ${esc(date)}, ${esc(chosen)})`);
      }
    }
  }
}

genTeacherAtt(currT2T3);
genTeacherAtt(year2Data);
genTeacherAtt(year3Data);

for (let i = 0; i < taBatches.length; i += 5000) {
  sqlite.exec(`INSERT OR IGNORE INTO teacher_attendance (id, teacher_id, date, status) VALUES ${taBatches.slice(i, i + 5000).join(",\n")}`);
}
console.log(`   ${taBatches.length} présences enseignants`);

// ── 8. Payroll ──
console.log("💰 Paie...");
let prId = (sqlite.prepare("SELECT COALESCE(MAX(id),0) FROM payroll").get() as any)["COALESCE(MAX(id),0)"];
const prBatches: string[] = [];

function genPayroll(yearId: number, yearNum: number, teacherIds: typeof teachers) {
  for (const t of teacherIds) {
    const tRow = sqlite.prepare("SELECT salary FROM teachers WHERE id = ?").get(t.id) as { salary: number };
    const base = tRow.salary || rand(120000, 250000);
    for (let m = 9; m <= 12; m++) {
      prId++;
      const bonus = Math.random() < 0.3 ? rand(5000, 25000) : 0;
      prBatches.push(`(${prId}, ${t.id}, ${m}, ${yearNum}, ${base}, ${bonus}, 0, ${esc(`${yearNum}-${String(m).padStart(2, "0")}-${rand(25, 28)}`)})`);
    }
    for (let m = 1; m <= 6; m++) {
      prId++;
      const bonus = Math.random() < 0.3 ? rand(5000, 25000) : 0;
      prBatches.push(`(${prId}, ${t.id}, ${m}, ${yearNum + 1}, ${base}, ${bonus}, 0, ${esc(`${yearNum + 1}-${String(m).padStart(2, "0")}-${rand(25, 28)}`)})`);
    }
  }
}

genPayroll(2, 2023, teachers);
genPayroll(3, 2024, teachers);
// Compléter 2025-2026 (déc + jan-juin)
for (const t of teachers) {
  const tRow = sqlite.prepare("SELECT salary FROM teachers WHERE id = ?").get(t.id) as { salary: number };
  const base = tRow.salary || rand(120000, 250000);
  prId++;
  prBatches.push(`(${prId}, ${t.id}, 12, 2025, ${base}, 0, 0, '2025-12-${rand(25, 28)}')`);
  for (let m = 1; m <= 6; m++) {
    prId++;
    const bonus = Math.random() < 0.3 ? rand(5000, 25000) : 0;
    prBatches.push(`(${prId}, ${t.id}, ${m}, 2026, ${base}, ${bonus}, 0, ${esc(`2026-${String(m).padStart(2, "0")}-${rand(25, 28)}`)})`);
  }
}

for (let i = 0; i < prBatches.length; i += 500) {
  sqlite.exec(`INSERT OR IGNORE INTO payroll (id, teacher_id, month, year, amount, bonus, deductions, paid_at) VALUES ${prBatches.slice(i, i + 500).join(",\n")}`);
}
console.log(`   ${prBatches.length} fiches de paie`);

// ── Final stats ──
console.log("\n📊 Stats :");
const st = sqlite.prepare(`
  SELECT
    (SELECT COUNT(*) FROM academic_years) AS years,
    (SELECT COUNT(*) FROM enrollments) AS enrollments,
    (SELECT COUNT(*) FROM evaluations) AS evals,
    (SELECT COUNT(*) FROM grades) AS grades,
    (SELECT COUNT(*) FROM payments) AS payments,
    (SELECT COUNT(*) FROM attendance) AS attendance,
    (SELECT COUNT(*) FROM expenses) AS expenses,
    (SELECT COUNT(*) FROM teacher_attendance) AS ta,
    (SELECT COUNT(*) FROM payroll) AS payroll
`).get() as any;
for (const [k, v] of Object.entries(st)) console.log(`   ${k} : ${v}`);

sqlite.pragma("foreign_keys = ON");
sqlite.close();
console.log("\n✅ Terminé !");
