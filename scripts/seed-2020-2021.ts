// Seed script — Insère uniquement l'année 2020-2021 avec données réalistes maliennes
// Toutes les tables sont chargées, 3 trimestres complets, année scolaire intégrale
// Exécution : npx tsx scripts/seed-2020-2021.ts

import Database from "better-sqlite3";

const dbPath = process.cwd() + "/edumali_db/data.db";
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("synchronous = OFF");
sqlite.pragma("foreign_keys = OFF");

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randf(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}
function pick<T>(a: T[]): T {
  return a[rand(0, a.length - 1)];
}
function esc(s: string | number | null | undefined): string {
  if (s === null || s === undefined) return "NULL";
  return "'" + String(s).replace(/'/g, "''") + "'";
}
function fmt(d: Date) {
  return d.toISOString().split("T")[0];
}
function sql(v: string) {
  sqlite.exec(v);
}

// ── Data pools ──
const LN = [
  "Traoré", "Coulibaly", "Diarra", "Dembélé", "Diallo", "Koné", "Keïta",
  "Sidibé", "Touré", "Doumbia", "Diakité", "Cissé", "Maïga", "Konaté",
  "Samaké", "Sangaré", "Sissoko", "Sanogo", "Camara", "Guindo", "Fofana",
  "Sacko", "Bagayoko", "Sylla", "Diawara", "Berthe", "Togo", "Diabaté",
  "Kanté", "Tangara", "Dao", "Togola", "Dicko", "Goïta", "Haidara",
  "Ouattara", "Ballo", "Sow", "Kane", "Tounkara", "Mariko", "Doucouré",
  "Mallé", "Daou", "Fomba", "Bouaré", "Fané", "Kouyaté", "Diaby",
];

const MN = [
  "Mamadou", "Modibo", "Seydou", "Adama", "Ousmane", "Drissa", "Cheick",
  "Moussa", "Ibrahim", "Souleymane", "Abdoulaye", "Boubacar", "Amadou",
  "Issa", "Youssouf", "Mahamadou", "Lassana", "Hamed", "Makan", "Salif",
  "Bakary", "Karamoko", "Tidiane", "Mamoutou", "Samba", "Massambou",
];

const FN = [
  "Fatoumata", "Mariam", "Aminata", "Kadiatou", "Aïssata", "Rokia",
  "Djeneba", "Oumou", "Hawa", "Bintou", "Assitan", "Ramatoulaye",
  "Safiatou", "Maimouna", "Salimata", "Fanta", "Assetou", "Nana",
  "Mariama", "Korotoumou", "Adiaratou", "Sitan", "Kadidia", "Djénéba",
  "Habibatou", "Balkissa", "Assa", "Awa",
];

const PN = [
  "Mamadou", "Modibo", "Seydou", "Adama", "Ousmane", "Drissa", "Moussa",
  "Ibrahim", "Souleymane", "Abdoulaye", "Boubacar", "Amadou", "Issa",
  "Youssouf", "Mahamadou", "Lassana", "Fatoumata", "Mariam", "Aminata",
  "Kadiatou", "Aïssata", "Rokia", "Djeneba", "Oumou", "Hawa", "Bintou",
];

const CT = [
  "Bamako", "Ségou", "Sikasso", "Koulikoro", "Kayes", "Mopti", "Gao",
  "Tombouctou",
];

const BT = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const PROFS = [
  "Fonctionnaire", "Commerçant", "Enseignant", "Agriculteur", "Chauffeur",
  "Menuisier", "Maçon", "Militaire", "Infirmier", "Agent commercial",
];
const MERE_PROFS = [
  "Ménagère", "Commerçante", "Enseignante", "Infirmière", "Coiffeuse",
  "Tailleuse", "Secrétaire",
];

// ── Teachers (18) ──
const TD: [string, string, string, string][] = [
  ["Mamadou", "Traoré", "Masculin", "mamadou.traore@ecole.ml"],
  ["Fatoumata", "Diallo", "Féminin", "fatoumata.diallo@ecole.ml"],
  ["Modibo", "Keïta", "Masculin", "modibo.keita@ecole.ml"],
  ["Aminata", "Coulibaly", "Féminin", "aminata.coulibaly@ecole.ml"],
  ["Seydou", "Koné", "Masculin", "seydou.kone@ecole.ml"],
  ["Mariam", "Sissoko", "Féminin", "mariam.sissoko@ecole.ml"],
  ["Adama", "Diarra", "Masculin", "adama.diarra@ecole.ml"],
  ["Djeneba", "Samaké", "Féminin", "djeneba.samake@ecole.ml"],
  ["Ousmane", "Touré", "Masculin", "ousmane.toure@ecole.ml"],
  ["Kadiatou", "Sangaré", "Féminin", "kadiatou.sangare@ecole.ml"],
  ["Drissa", "Camara", "Masculin", "drissa.camara@ecole.ml"],
  ["Rokia", "Doumbia", "Féminin", "rokia.doumbia@ecole.ml"],
  ["Moussa", "Diakité", "Masculin", "moussa.diakite@ecole.ml"],
  ["Oumou", "Sacko", "Féminin", "oumou.sacko@ecole.ml"],
  ["Ibrahim", "Cissé", "Masculin", "ibrahim.cisse@ecole.ml"],
  ["Aïssata", "Maïga", "Féminin", "aissata.maiga@ecole.ml"],
  ["Souleymane", "Konaté", "Masculin", "souleymane.konate@ecole.ml"],
  ["Cheick", "Sylla", "Masculin", "cheick.sylla@ecole.ml"],
];

// ── Classes (9) ──
const CL: [number, string, number, string][] = [
  [1, "CI (Cours d'Initiation)", 1, "#4f46e5"],
  [2, "CP (Cours Préparatoire)", 2, "#0891b2"],
  [3, "CE1 (Cours Élémentaire 1)", 3, "#059669"],
  [4, "CE2 (Cours Élémentaire 2)", 4, "#d97706"],
  [5, "CM1 (Cours Moyen 1)", 5, "#dc2626"],
  [6, "CM2 (Cours Moyen 2)", 6, "#7c3aed"],
  [7, "5ème (1er cycle)", 7, "#db2777"],
  [8, "4ème", 8, "#2563eb"],
  [9, "3ème (classe du DEF)", 9, "#ca8a04"],
];

// ── Subjects (13) ──
const SJ: [string, string, number, number, number, number][] = [
  ["Français", "FR", 5, 8, 1, 1],
  ["Mathématiques", "MA", 5, 6, 1, 1],
  ["Histoire-Géographie", "HG", 2, 2, 1, 0],
  ["Sciences d'Observation", "SO", 3, 2, 1, 0],
  ["Anglais", "AN", 2, 2, 1, 1],
  ["EMC", "EMC", 1, 1, 1, 1],
  ["EPS", "EPS", 1, 2, 1, 1],
  ["Arts", "AR", 1, 1, 1, 0],
  ["Histoire", "HI", 2, 2, 0, 1],
  ["Géographie", "GE", 2, 2, 0, 1],
  ["Physique-Chimie", "PC", 3, 2, 0, 1],
  ["SVT", "SV", 3, 2, 0, 1],
  ["Arabe", "ARB", 2, 2, 0, 1],
];
const SC = [
  "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899",
  "#06b6d4", "#84cc16", "#6366f1", "#d946ef", "#14b8a6", "#f97316",
];

// ── Fee types ──
const FD: [string, number, string][] = [
  ["Frais d'inscription", 10000, "unique"],
  ["Scolarité trimestre 1", 25000, "trimestriel"],
  ["Scolarité trimestre 2", 25000, "trimestriel"],
  ["Scolarité trimestre 3", 25000, "trimestriel"],
  ["Kit scolaire", 15000, "annuel"],
  ["APE", 5000, "annuel"],
  ["Assurance scolaire", 3000, "annuel"],
];

// ── Expense templates ──
const EXPENSE_TEMPLATES: [string, [number, number], string][] = [
  ["Électricité", [65000, 95000], "electricite"],
  ["Eau", [25000, 45000], "eau"],
  ["Fournitures bureau", [20000, 60000], "fournitures"],
  ["Craie et tableaux", [10000, 20000], "fournitures"],
  ["Produits entretien", [15000, 35000], "entretien"],
  ["Transport", [15000, 40000], "transport"],
  ["Personnel entretien", [50000, 70000], "autres"],
];

function ph() {
  return `+223 ${rand(70, 79)}${String(rand(10, 99))}${String(rand(10, 99))}${String(rand(10, 99))}`;
}
function ad() {
  return `${rand(1, 999)} ${pick(CT)}`;
}

const MONTH_NAMES = [
  "", "janvier", "février", "mars", "avril", "mai", "juin", "juillet",
  "août", "septembre", "octobre", "novembre", "décembre",
];

// ── Generate school dates for 2020-2021 ──
function generateSchoolDates() {
  const trimesters: {
    id: number;
    dates: string[];
    devoirDate: string;
    trimDate: string;
  }[] = [];
  const periods: { id: number; start: [number, number, number]; end: [number, number, number]; devoir: [number, number, number]; trim: [number, number, number] }[] = [
    { id: 1, start: [2020, 8, 15], end: [2020, 11, 18], devoir: [2020, 10, 15], trim: [2020, 12, 10] },
    { id: 2, start: [2021, 0, 4], end: [2021, 2, 26], devoir: [2021, 2, 5], trim: [2021, 3, 22] },
    { id: 3, start: [2021, 3, 6], end: [2021, 5, 25], devoir: [2021, 5, 10], trim: [2021, 6, 5] },
  ];
  for (const p of periods) {
    const dates: string[] = [];
    const d = new Date(p.start[0], p.start[1], p.start[2]);
    const end = new Date(p.end[0], p.end[1], p.end[2]);
    while (d <= end) {
      if (d.getDay() !== 0 && d.getDay() !== 6) dates.push(fmt(d));
      d.setDate(d.getDate() + 1);
    }
    trimesters.push({
      id: p.id,
      dates,
      devoirDate: `${p.devoir[0]}-${String(p.devoir[1]).padStart(2, "0")}-${String(rand(10, p.devoir[2])).padStart(2, "0")}`,
      trimDate: `${p.trim[0]}-${String(p.trim[1]).padStart(2, "0")}-${String(rand(1, p.trim[2])).padStart(2, "0")}`,
    });
  }
  return trimesters;
}

const TRIMESTERS = generateSchoolDates();

// ══════════════════════════════════════════
console.log("🧹 Nettoyage...");
const ALL_TABLES = [
  "user_preferences", "schedules", "exams", "grades", "evaluations",
  "class_subjects", "teacher_subjects", "teacher_attendance", "payroll",
  "medical_infos", "family_infos", "academic_histories", "attendance",
  "payments", "enrollments", "expenses", "students", "teachers",
  "subjects", "classes", "academic_years", "fee_types", "school_info",
  "closed_periods", "audit_log", "users",
];
for (const t of ALL_TABLES) {
  try { sql(`DELETE FROM "${t}"`); } catch { /* table may not exist */ }
}
try { sql("DELETE FROM sqlite_sequence"); } catch {}
console.log("  OK");

// ═══ 1. School info ═══
console.log("🏛️ École...");
sql(`INSERT INTO school_info (id,name,address,phone,email,website,director,founded_year) VALUES (1,'École Fondamentale de Démonstration','Avenue de l''Indépendance, Bamako','+223 20 22 33 44','contact@efd-demonstration.ml','https://efd-demonstration.ml','Dr. Mamadou Traoré',1995)`);

// ═══ 2. Academic year ═══
console.log("📅 Année 2020-2021...");
sql("INSERT INTO academic_years (id,name,start_date,end_date,is_current) VALUES (1,'2020-2021','2020-09-15','2021-06-30',1)");

// ═══ 3. Classes ═══
console.log("🏫 Classes...");
for (const c of CL) {
  sql(`INSERT INTO classes (id,name,level,capacity,total_fee,color,status) VALUES (${c[0]},${esc(c[1])},${c[2]},40,75000,${esc(c[3])},'active')`);
}

// ═══ 4. Subjects ═══
console.log("📚 Matières...");
SJ.forEach((s, i) => {
  sql(`INSERT INTO subjects (id,name,code,coefficient,hours_per_week,color,status) VALUES (${i+1},${esc(s[0])},${esc(s[1])},${s[2]},${s[3]},${esc(SC[i])},'Actif')`);
});

// ═══ 5. Teachers ═══
console.log("👨‍🏫 Professeurs...");
let ti = 0;
for (const t of TD) {
  ti++;
  sql(`INSERT INTO teachers (id,first_name,last_name,email,phone,address,gender,hire_date,salary,contrat,status) VALUES (${ti},${esc(t[0])},${esc(t[1])},${esc(t[3])},${esc(ph())},${esc(ad())},${esc(t[2])},'2020-${String(rand(1,9)).padStart(2,"0")}-${String(rand(1,28)).padStart(2,"0")}',${rand(120000,250000)},'mensuel','active')`);
}
console.log(`  ${ti} enseignants`);

// ═══ 6. Students (35/classe) ═══
console.log("👨‍🎓 Élèves...");
let sid = 0;
const studentRows: { id: number; cid: number }[] = [];
const studentBatch: string[] = [];
for (const c of CL) {
  for (let i = 0; i < 35; i++) {
    sid++;
    const g = i % 2 === 0 ? "Masculin" : "Féminin";
    const fn = g === "Masculin" ? pick(MN) : pick(FN);
    const ln = pick(LN);
    const yr = 2020 - c[2] - rand(5, 8);
    const pn = pick(PN);
    studentBatch.push(`(${sid},${esc(fn)},${esc(ln)},${esc(g)},${esc(`${yr}-${String(rand(1,12)).padStart(2,"0")}-${String(rand(1,28)).padStart(2,"0")}`)},'Malienne',NULL,${esc(pn+" "+ln)},${esc(ph())},${esc(ad())},${c[0]},'2020-09-15','Actif')`);
    studentRows.push({ id: sid, cid: c[0] });
  }
}
for (let i = 0; i < studentBatch.length; i += 500) {
  sql(`INSERT INTO students (id,first_name,last_name,gender,birth_date,nationality,photo,parent_name,parent_phone,address,class_id,registration_date,status) VALUES ${studentBatch.slice(i, i+500).join(",\n")}`);
}
console.log(`  ${sid} élèves`);

// ═══ 7. Class subjects ═══
console.log("🔗 Classe ↔ Matières...");
let csi = 0;
const classSubjectBatch: string[] = [];
for (const c of CL) {
  const prim = c[2] <= 6;
  SJ.forEach((s, i) => {
    if ((prim && !s[4]) || (!prim && !s[5])) return;
    csi++;
    classSubjectBatch.push(`(${csi},${c[0]},${i+1},${s[2]})`);
  });
}
sql(`INSERT INTO class_subjects (id,class_id,subject_id,coefficient) VALUES ${classSubjectBatch.join(",\n")}`);
console.log(`  ${csi} associations`);

// ═══ 8. Teacher subjects ═══
console.log("🔗 Professeur ↔ Matières...");
let tsi = 0;
for (let t = 1; t <= ti; t++) {
  const n = rand(1, 3);
  const shuffled = [...Array(13).keys()].map(i => i + 1).sort(() => Math.random() - 0.5);
  for (let i = 0; i < n; i++) {
    tsi++;
    sql(`INSERT INTO teacher_subjects (id,teacher_id,subject_id) VALUES (${tsi},${t},${shuffled[i]})`);
  }
}
console.log(`  ${tsi} associations`);

// ═══ 9. Enrollments ═══
console.log("📋 Inscriptions...");
sql("INSERT INTO enrollments (id,student_id,class_id,academic_year_id,enrollment_date,status) SELECT id,id,class_id,1,'2020-09-15','inscrit' FROM students");

// ═══ 10. Fee types ═══
console.log("💰 Types de frais...");
FD.forEach((f, i) => {
  sql(`INSERT INTO fee_types (id,name,amount,period) VALUES (${i+1},${esc(f[0])},${f[1]},${esc(f[2])})`);
});

// ═══ 11. Payments (répartis sur l'année) ═══
console.log("💳 Paiements...");
let pi = 0;
const paymentMethods = ["espèces", "mobile_money", "virement", "chèque"];
for (const r of studentRows) {
  if (Math.random() < 0.4) continue;
  const numPaiements = rand(1, 4);
  for (let p = 0; p < numPaiements; p++) {
    pi++;
    const m = rand(9, 12) > 12 ? rand(9, 12) : (() => { const v = rand(1, 12); return v < 9 ? v + 8 : v; })();
    // Spread from Sept 2020 to June 2021
    const payMonth = pick([9, 10, 11, 12, 1, 2, 3, 4, 5, 6]);
    const payYear = payMonth >= 9 ? 2020 : 2021;
    const ft = pick(FD);
    sql(`INSERT INTO payments (id,student_id,fee_type_id,amount,method,reference,date,status) VALUES (${pi},${r.id},${Math.floor(Math.random() * FD.length) + 1},${ft[1]},${esc(pick(paymentMethods))},${esc("PAY-"+r.id+"-"+rand(1000,9999))},${esc(`${payYear}-${String(payMonth).padStart(2,"0")}-${String(rand(1,28)).padStart(2,"0")}`)},'payé')`);
  }
}
console.log(`  ${pi} paiements`);

// ═══ 12. Expenses (mensuelles sept-juin) ═══
console.log("💰 Dépenses...");
let ei = 0;
for (let m = 9; m <= 12; m++) {
  for (const et of EXPENSE_TEMPLATES) {
    ei++;
    sql(`INSERT INTO expenses (id,description,amount,category,date,academic_year_id) VALUES (${ei},${esc(et[0]+" "+MONTH_NAMES[m]+" 2020")},${rand(et[1][0],et[1][1])},${esc(et[2])},${esc(`2020-${String(m).padStart(2,"0")}-${String(rand(1,28)).padStart(2,"0")}`)},1)`);
  }
}
for (let m = 1; m <= 6; m++) {
  for (const et of EXPENSE_TEMPLATES) {
    ei++;
    sql(`INSERT INTO expenses (id,description,amount,category,date,academic_year_id) VALUES (${ei},${esc(et[0]+" "+MONTH_NAMES[m]+" 2021")},${rand(et[1][0],et[1][1])},${esc(et[2])},${esc(`2021-${String(m).padStart(2,"0")}-${String(rand(1,28)).padStart(2,"0")}`)},1)`);
  }
}
console.log(`  ${ei} dépenses`);

// ═══ 13. Student attendance (année complète) ═══
console.log("📅 Présences élèves...");
const STATUSES = ["présent", "absent", "retard", "congé"];
const WEIGHTS = [0.85, 0.05, 0.05, 0.05];
let ai = 0;
const attBatch: string[] = [];
for (const r of studentRows) {
  for (const t of TRIMESTERS) {
    for (const date of t.dates) {
      ai++;
      let cumul = 0;
      const rnd = Math.random();
      let chosen = STATUSES[0];
      for (let i = 0; i < STATUSES.length; i++) {
        cumul += WEIGHTS[i];
        if (rnd < cumul) { chosen = STATUSES[i]; break; }
      }
      attBatch.push(`(${ai},${r.id},${r.cid},${esc(date)},${esc(chosen)})`);
    }
  }
}
for (let i = 0; i < attBatch.length; i += 5000) {
  sql(`INSERT INTO attendance (id,student_id,class_id,date,status) VALUES ${attBatch.slice(i, i+5000).join(",\n")}`);
}
console.log(`  ${ai} présences élèves`);

// ═══ 14. Teacher attendance (année complète) ═══
console.log("📅 Présences enseignants...");
let tai = 0;
const taStatuses = ["present", "absent", "retard", "excused"];
const taWeights = [0.90, 0.03, 0.04, 0.03];
const taBatch: string[] = [];
for (let t = 1; t <= ti; t++) {
  for (const tr of TRIMESTERS) {
    for (const date of tr.dates) {
      tai++;
      let cumul = 0;
      const rnd = Math.random();
      let chosen = taStatuses[0];
      for (let i = 0; i < taStatuses.length; i++) {
        cumul += taWeights[i];
        if (rnd < cumul) { chosen = taStatuses[i]; break; }
      }
      taBatch.push(`(${tai},${t},${esc(date)},${esc(chosen)})`);
    }
  }
}
for (let i = 0; i < taBatch.length; i += 5000) {
  sql(`INSERT INTO teacher_attendance (id,teacher_id,date,status) VALUES ${taBatch.slice(i, i+5000).join(",\n")}`);
}
console.log(`  ${tai} présences enseignants`);

// ═══ 15. Evaluations + Grades (3 trimestres complets) ═══
console.log("📝 Évaluations & notes...");
let evalId = 0;
let gradeId = 0;
const evalBatch: string[] = [];
const gradeBatch: string[] = [];

for (const c of CL) {
  const prim = c[2] <= 6;
  const classStudents = studentRows.filter(r => r.cid === c[0]);
  SJ.forEach((s, si) => {
    if ((prim && !s[4]) || (!prim && !s[5])) return;
    for (const tr of TRIMESTERS) {
      // Devoir
      evalId++;
      evalBatch.push(`(${evalId},${esc("Devoir - "+s[0])},'devoir',${c[0]},${si+1},${tr.id},1,${esc(tr.devoirDate)},'published')`);
      for (const r of classStudents) {
        gradeId++;
        const abs = Math.random() < 0.04;
        gradeBatch.push(`(${gradeId},${evalId},${r.id},${abs ? 0 : rand(5,18)},${abs ? 1 : 0})`);
      }
      // Trimestrielle
      evalId++;
      evalBatch.push(`(${evalId},${esc("Composition - "+s[0])},'trimestrielle',${c[0]},${si+1},${tr.id},1,${esc(tr.trimDate)},'published')`);
      for (const r of classStudents) {
        gradeId++;
        const abs = Math.random() < 0.04;
        gradeBatch.push(`(${gradeId},${evalId},${r.id},${abs ? 0 : rand(5,18)},${abs ? 1 : 0})`);
      }
    }
  });
}
for (let i = 0; i < evalBatch.length; i += 500) {
  sql(`INSERT OR IGNORE INTO evaluations (id,name,type,class_id,subject_id,trimester,academic_year_id,date,status) VALUES ${evalBatch.slice(i, i+500).join(",\n")}`);
}
for (let i = 0; i < gradeBatch.length; i += 5000) {
  sql(`INSERT INTO grades (id,evaluation_id,student_id,score,is_absent) VALUES ${gradeBatch.slice(i, i+5000).join(",\n")}`);
}
console.log(`  ${evalId} évaluations, ${gradeId} notes`);

// ═══ 16. Medical infos ═══
console.log("🏥 Fiches médicales...");
let mi = 0;
for (const r of studentRows) {
  if (Math.random() < 0.3) continue;
  mi++;
  sql(`INSERT INTO medical_infos (id,student_id,blood_type,allergies,medications,vaccination_status,emergency_contact,emergency_phone) VALUES (${mi},${r.id},${esc(pick(BT))},${esc(Math.random()<0.2?pick(["Arachides","Poussière","Aspirine","Pénicilline"]):null)},NULL,${esc(Math.random()<0.85?"À jour":"Non vacciné")},${esc(pick(PN)+" "+pick(LN))},${esc(ph())})`);
}
console.log(`  ${mi} fiches`);

// ═══ 17. Family infos ═══
console.log("👪 Infos familiales...");
let fi = 0;
for (const r of studentRows) {
  if (Math.random() < 0.2) continue;
  fi++;
  const fln = pick(LN);
  sql(`INSERT INTO family_infos (id,student_id,father_name,father_phone,father_profession,mother_name,mother_phone,mother_profession) VALUES (${fi},${r.id},${esc(pick(MN)+" "+fln)},${esc(ph())},${esc(pick(PROFS))},${esc(pick(FN)+" "+fln)},${esc(ph())},${esc(pick(MERE_PROFS))})`);
}
console.log(`  ${fi} fiches`);

// ═══ 18. Academic histories ═══
console.log("📜 Historiques académiques...");
let hi = 0;
for (const r of studentRows) {
  if (Math.random() < 0.8) continue;
  const cls = CL.find(c => c[0] === r.cid);
  if (!cls || (cls[2] - 1) < 1) continue;
  const prev = CL.find(c => c[2] === cls[2] - 1) || CL[0];
  hi++;
  sql(`INSERT INTO academic_histories (id,student_id,school_name,class_name,academic_year,reason) VALUES (${hi},${r.id},'École Fondamentale de Démonstration',${esc(prev[1])},'2019-2020','Passage en classe supérieure')`);
}
console.log(`  ${hi} historiques`);

// ═══ 19. Payroll (sept-juin) ═══
console.log("💰 Paie...");
let pri = 0;
for (let t = 1; t <= ti; t++) {
  const tRow = sqlite.prepare("SELECT salary FROM teachers WHERE id = ?").get(t) as { salary: number };
  const base = tRow?.salary ?? rand(120000, 250000);
  for (let m = 9; m <= 12; m++) {
    pri++;
    const bonus = Math.random() < 0.2 ? rand(5000, 20000) : 0;
    sql(`INSERT INTO payroll (id,teacher_id,month,year,amount,bonus,deductions,paid_at) VALUES (${pri},${t},${m},2020,${base},${bonus},0,${esc(`2020-${String(m).padStart(2,"0")}-${rand(25,28)}`)})`);
  }
  for (let m = 1; m <= 6; m++) {
    pri++;
    const bonus = Math.random() < 0.2 ? rand(5000, 20000) : 0;
    sql(`INSERT INTO payroll (id,teacher_id,month,year,amount,bonus,deductions,paid_at) VALUES (${pri},${t},${m},2021,${base},${bonus},0,${esc(`2021-${String(m).padStart(2,"0")}-${rand(25,28)}`)})`);
  }
}
console.log(`  ${pri} fiches de paie`);

// ═══ 20. Schedules (emplois du temps hebdomadaires) ═══
console.log("📅 Emplois du temps...");
let schi = 0;
const periods = [
  { start: "07:30", end: "08:25" },
  { start: "08:25", end: "09:20" },
  { start: "09:20", end: "10:15" },
  { start: "10:45", end: "11:40" },
  { start: "11:40", end: "12:35" },
  { start: "12:35", end: "13:30" },
];
const days = [1, 2, 3, 4, 5]; // Mon-Fri
for (const c of CL) {
  const prim = c[2] <= 6;
  const classSubjects = SJ.map((s, i) => ({ idx: i + 1, ...s }))
    .filter(s => (prim && s[4]) || (!prim && s[5]));
  // Distribute subjects across week
  for (const day of days) {
    const numPeriods = day <= 5 ? (prim ? 5 : 6) : 0;
    for (let p = 0; p < numPeriods; p++) {
      const subj = pick(classSubjects);
      const teacherId = rand(1, ti);
      schi++;
      sql(`INSERT INTO schedules (id,class_id,academic_year_id,day,start_time,end_time,subject_id,teacher_id) VALUES (${schi},${c[0]},1,${day},${esc(periods[p]?.start ?? "07:30")},${esc(periods[p]?.end ?? "08:25")},${subj.idx},${teacherId})`);
    }
  }
}
console.log(`  ${schi} créneaux`);

// ═══ 21. Exams (calendrier) ═══
console.log("📝 Calendrier d'examens...");
let exi = 0;
// Generate a few exam days per trimester
function generateExams() {
  for (const c of CL) {
    const prim = c[2] <= 6;
    const classSubjects = SJ.map((s, i) => ({ idx: i + 1, ...s }))
      .filter(s => (prim && s[4]) || (!prim && s[5]));
    for (const tr of TRIMESTERS) {
      // Pick 2-3 random subjects per class per trimester for exams
      const numExams = Math.min(rand(2, 4), classSubjects.length);
      const shuffled = [...classSubjects].sort(() => Math.random() - 0.5);
      for (let e = 0; e < numExams; e++) {
        exi++;
        const subj = shuffled[e];
        const teacherId = rand(1, ti);
        const examDate = tr.dates[rand(0, tr.dates.length - 1)];
        sql(`INSERT INTO exams (id,class_id,academic_year_id,subject_id,teacher_id,trimester,date,start_time,end_time,room,status) VALUES (${exi},${c[0]},1,${subj.idx},${teacherId},${tr.id},${esc(examDate)},${esc("07:30")},${esc("10:30")},${esc("Salle "+rand(1,12))},'confirmed')`);
      }
    }
  }
}
generateExams();
console.log(`  ${exi} examens`);

// ═══ 22. Closed periods ═══
console.log("🔒 Périodes clôturées...");
for (let m = 9; m <= 12; m++) {
  sql(`INSERT INTO closed_periods (id,month,year,closed_at) VALUES (${m-8},${m},2020,${esc("2020-"+String(m).padStart(2,"0")+"-28")})`);
}
for (let m = 1; m <= 6; m++) {
  sql(`INSERT INTO closed_periods (id,month,year,closed_at) VALUES (${m+4},${m},2021,${esc("2021-"+String(m).padStart(2,"0")+"-28")})`);
}
console.log("  10 périodes");

// ═══ 23. User par défaut + preferences ═══
console.log("👤 Utilisateur admin...");
sql(`INSERT INTO users (id,email,full_name,password_hash) VALUES (1,'admin@ecole.ml','Administrateur','admin')`);
sql(`INSERT OR IGNORE INTO user_preferences (id,user_id) VALUES (1,1)`);

// ═══ DONE ═══
sqlite.pragma("foreign_keys = ON");
sqlite.close();

console.log("");
console.log("═════════════════════════════════════════");
console.log("✅ Seed 2020-2021 terminé !");
console.log(`   ${CL.length} classes`);
console.log(`   ${SJ.length} matières`);
console.log(`   ${ti} enseignants`);
console.log(`   ${sid} élèves`);
console.log(`   ${pi} paiements`);
console.log(`   ${ei} dépenses`);
console.log(`   ${ai} présences élèves`);
console.log(`   ${tai} présences enseignants`);
console.log(`   ${evalId} évaluations`);
console.log(`   ${gradeId} notes`);
console.log(`   ${pri} fiches de paie`);
console.log(`   ${schi} créneaux emploi du temps`);
console.log(`   ${exi} examens`);
console.log("═════════════════════════════════════════");
