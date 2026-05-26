// Seed script — remplit la base avec des données réalistes maliennes
// Utilise better-sqlite3 directement (pas Drizzle ORM) pour la rapidité

import Database from "better-sqlite3";

const dbPath = process.cwd() + "/edumali_db/data.db";
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("synchronous = OFF");
sqlite.pragma("foreign_keys = OFF");

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(a: T[]): T { return a[rand(0, a.length - 1)]; }
function esc(s: string | number | null | undefined): string {
  if (s === null || s === undefined) return "NULL";
  return "'" + String(s).replace(/'/g, "''") + "'";
}
function fmt(d: Date) { return d.toISOString().split("T")[0]; }
function sql(v: string) { sqlite.exec(v); }

// ── Data pools ──
const LN = ["Traoré","Coulibaly","Diarra","Dembélé","Diallo","Koné","Keïta","Sidibé","Touré","Doumbia","Diakité","Cissé","Maïga","Konaté","Samaké","Sangaré","Sissoko","Sanogo","Camara","Guindo","Fofana","Sacko","Bagayoko","Sylla","Diawara","Berthe","Togo","Diabaté","Kanté","Tangara","Dao","Togola","Dicko","Goïta","Haidara","Ouattara","Ballo","Sow","Kane","Tounkara","Mariko","Doucouré","Mallé","Daou","Fomba","Bouaré","Fané","Kouyaté","Diaby"];
const MN = ["Mamadou","Modibo","Seydou","Adama","Ousmane","Drissa","Cheick","Moussa","Ibrahim","Souleymane","Abdoulaye","Boubacar","Amadou","Issa","Youssouf","Mahamadou","Lassana","Hamed","Makan","Salif","Bakary","Karamoko","Tidiane","Mamoutou","Samba","Massambou","Abdramane"];
const FN = ["Fatoumata","Mariam","Aminata","Kadiatou","Aïssata","Rokia","Djeneba","Oumou","Hawa","Bintou","Assitan","Ramatoulaye","Safiatou","Maimouna","Salimata","Fanta","Assetou","Nana","Mariama","Korotoumou","Adiaratou","Sitan","Kadidia","Djénéba","Habibatou","Balkissa","Assa","Awa"];
const PN = ["Mamadou","Modibo","Seydou","Adama","Ousmane","Drissa","Moussa","Ibrahim","Souleymane","Abdoulaye","Boubacar","Amadou","Issa","Youssouf","Mahamadou","Lassana","Fatoumata","Mariam","Aminata","Kadiatou","Aïssata","Rokia","Djeneba","Oumou","Hawa","Bintou","Assitan"];
const CT = ["Bamako","Ségou","Sikasso","Koulikoro","Kayes","Mopti","Gao","Tombouctou"];
const BT = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

const TD: [string,string,string,string][] = [
  ["Mamadou","Traoré","Masculin","mamadou.traore@ecole.ml"],
  ["Fatoumata","Diallo","Féminin","fatoumata.diallo@ecole.ml"],
  ["Modibo","Keïta","Masculin","modibo.keita@ecole.ml"],
  ["Aminata","Coulibaly","Féminin","aminata.coulibaly@ecole.ml"],
  ["Seydou","Koné","Masculin","seydou.kone@ecole.ml"],
  ["Mariam","Sissoko","Féminin","mariam.sissoko@ecole.ml"],
  ["Adama","Diarra","Masculin","adama.diarra@ecole.ml"],
  ["Djeneba","Samaké","Féminin","djeneba.samake@ecole.ml"],
  ["Ousmane","Touré","Masculin","ousmane.toure@ecole.ml"],
  ["Kadiatou","Sangaré","Féminin","kadiatou.sangare@ecole.ml"],
  ["Drissa","Camara","Masculin","drissa.camara@ecole.ml"],
  ["Rokia","Doumbia","Féminin","rokia.doumbia@ecole.ml"],
  ["Moussa","Diakité","Masculin","moussa.diakite@ecole.ml"],
  ["Oumou","Sacko","Féminin","oumou.sacko@ecole.ml"],
  ["Ibrahim","Cissé","Masculin","ibrahim.cisse@ecole.ml"],
  ["Aissata","Maga","Féminin","aissata.maiga@ecole.ml"],
  ["Souleymane","Konaté","Masculin","souleymane.konate@ecole.ml"],
  ["Cheick","Sylla","Masculin","cheick.sylla@ecole.ml"],
];

const CL: [number,string,number,string][] = [
  [1,"CI (Cours d'Initiation)",1,"#4f46e5"],
  [2,"CP (Cours Préparatoire)",2,"#0891b2"],
  [3,"CE1 (Cours Élémentaire 1)",3,"#059669"],
  [4,"CE2 (Cours Élémentaire 2)",4,"#d97706"],
  [5,"CM1 (Cours Moyen 1)",5,"#dc2626"],
  [6,"CM2 (Cours Moyen 2)",6,"#7c3aed"],
  [7,"5ème (1er cycle)",7,"#db2777"],
  [8,"4ème",8,"#2563eb"],
  [9,"3ème (classe du DEF)",9,"#ca8a04"],
];

const SJ: [string,string,number,number,number,number][] = [
  ["Français","FR",5,8,1,1],
  ["Mathématiques","MA",5,6,1,1],
  ["Histoire-Géographie","HG",2,2,1,0],
  ["Sciences d'Observation","SO",3,2,1,0],
  ["Anglais","AN",2,2,1,1],
  ["EMC","EMC",1,1,1,1],
  ["EPS","EPS",1,2,1,1],
  ["Arts","AR",1,1,1,0],
  ["Histoire","HI",2,2,0,1],
  ["Géographie","GE",2,2,0,1],
  ["Physique-Chimie","PC",3,2,0,1],
  ["SVT","SV",3,2,0,1],
  ["Arabe","ARB",2,2,0,1],
];
const SC = ["#ef4444","#3b82f6","#10b981","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#84cc16","#6366f1","#d946ef","#14b8a6","#f97316","#a855f7"];

const FD: [string,number,string][] = [
  ["Frais d'inscription",10000,"unique"],
  ["Scolarité trimestre 1",25000,"trimestriel"],
  ["Scolarité trimestre 2",25000,"trimestriel"],
  ["Scolarité trimestre 3",25000,"trimestriel"],
  ["Kit scolaire",15000,"annuel"],
  ["APE",5000,"annuel"],
  ["Assurance scolaire",3000,"annuel"],
];

const ED: [string,number,string][] = [
  ["Facture électricité Octobre",85000,"electricite"],
  ["Facture électricité Novembre",82000,"electricite"],
  ["Facture eau Octobre",35000,"eau"],
  ["Facture eau Novembre",38000,"eau"],
  ["Fournitures bureau",45000,"fournitures"],
  ["Craie et tableaux",15000,"fournitures"],
  ["Produits entretien",28000,"entretien"],
  ["Réparation toiture",120000,"entretien"],
  ["Transport livres",55000,"transport"],
  ["Ordinateur admin",350000,"equipement"],
  ["Imprimante + cartouches",85000,"equipement"],
  ["Entretien jardin",20000,"entretien"],
  ["Fournitures sportives",65000,"fournitures"],
  ["Colle, papiers",12000,"fournitures"],
  ["Personnel entretien",60000,"autres"],
  ["Achat lampes",18000,"equipement"],
  ["Nettoyage fosses",45000,"entretien"],
  ["Transport équipements",25000,"transport"],
  ["Peinture classes",95000,"entretien"],
  ["Ventilateurs",125000,"equipement"],
];

function ph() { return `+223 ${rand(70,79)}${String(rand(10,99))}${String(rand(10,99))}${String(rand(10,99))}`; }
function ad() { return `${rand(1,999)} ${pick(CT)}`; }

// ══════════════════════════════════════════
console.log("🧹 Nettoyage...");
for (const t of ["grades","evaluations","class_subjects","teacher_subjects","teacher_attendance","payroll","medical_infos","family_infos","academic_histories","attendance","payments","enrollments","expenses","students","teachers","subjects","classes","academic_years","fee_types","school_info","closed_periods","audit_log","users"]) {
  sql(`DELETE FROM "${t}"`);
}
sql("DELETE FROM sqlite_sequence");
console.log("  OK");

// ═══ 1. Année scolaire ═══
console.log("📅 Année...");
sql("INSERT INTO academic_years (id,name,start_date,end_date,is_current) VALUES (1,'2025-2026','2025-09-15','2026-06-30',1)");

// ═══ 2. Classes ═══
console.log("🏫 Classes...");
for (const c of CL) {
  sql(`INSERT INTO classes (id,name,level,capacity,total_fee,color,status) VALUES (${c[0]},${esc(c[1])},${c[2]},40,75000,${esc(c[3])},'active')`);
}

// ═══ 3. Matières ═══
console.log("📚 Matières...");
SJ.forEach((s, i) => {
  sql(`INSERT INTO subjects (id,name,code,coefficient,hours_per_week,color,status) VALUES (${i+1},${esc(s[0])},${esc(s[1])},${s[2]},${s[3]},${esc(SC[i])},'Actif')`);
});

// ═══ 4. Enseignants ═══
console.log("👨‍🏫 Profs...");
let ti = 0;
for (const t of TD) {
  ti++;
  sql(`INSERT INTO teachers (id,first_name,last_name,email,phone,address,gender,hire_date,salary,contrat,status) VALUES (${ti},${esc(t[0])},${esc(t[1])},${esc(t[3])},${esc(ph())},${esc(ad())},${esc(t[2])},'2020-${String(rand(1,9)).padStart(2,"0")}-${String(rand(1,28)).padStart(2,"0")}',${rand(120000,250000)},'mensuel','active')`);
}

// ═══ 5. Élèves (35/classe) ═══
console.log("👨‍🎓 Élèves...");
let rows: { id: number; cid: number }[] = [];
let sid = 0;
const sv: string[] = [];
for (const c of CL) {
  for (let i = 0; i < 35; i++) {
    sid++;
    const g = i % 2 === 0 ? "Masculin" : "Féminin";
    const fn = g === "Masculin" ? pick(MN) : pick(FN);
    const ln = pick(LN);
    const yr = 2025 - c[2] - rand(5, 8);
    const pn = pick(PN);
    sv.push(`(${sid},${esc(fn)},${esc(ln)},${esc(g)},${esc(`${yr}-${String(rand(1,12)).padStart(2,"0")}-${String(rand(1,28)).padStart(2,"0")}`)},'Malienne',NULL,${esc(pn+" "+ln)},${esc(ph())},${esc(ad())},${c[0]},'2025-09-15','Actif')`);
    rows.push({ id: sid, cid: c[0] });
  }
}
for (let i = 0; i < sv.length; i += 500) sql(`INSERT INTO students (id,first_name,last_name,gender,birth_date,nationality,photo,parent_name,parent_phone,address,class_id,registration_date,status) VALUES ${sv.slice(i, i+500).join(",\n")}`);
console.log(`  ${sid} élèves`);

// ═══ 6. Class subjects ═══
console.log("🔗 Classe↔Matières...");
let csi = 0;
const csv: string[] = [];
for (const c of CL) {
  const prim = c[2] <= 6;
  SJ.forEach((s, i) => {
    if ((prim && !s[4]) || (!prim && !s[5])) return;
    csi++;
    csv.push(`(${csi},${c[0]},${i+1},${s[2]})`);
  });
}
sql(`INSERT INTO class_subjects (id,class_id,subject_id,coefficient) VALUES ${csv.join(",\n")}`);

// ═══ 7. Teacher subjects ═══
console.log("🔗 Prof↔Matières...");
let tsi = 0;
for (let t = 1; t <= ti; t++) {
  const n = rand(1, 3);
  const sh = [...Array(13).keys()].map(i => i + 1).sort(() => Math.random() - 0.5);
  for (let i = 0; i < n; i++) { tsi++; sql(`INSERT INTO teacher_subjects (id,teacher_id,subject_id) VALUES (${tsi},${t},${sh[i]})`); }
}

// ═══ 8. Enrollments ═══
console.log("📋 Inscriptions...");
sql("INSERT INTO enrollments (id,student_id,class_id,academic_year_id,enrollment_date,status) SELECT id,id,class_id,1,'2025-09-15','inscrit' FROM students");

// ═══ 9. Fee types ═══
console.log("💰 Types frais...");
FD.forEach((f, i) => {
  sql(`INSERT INTO fee_types (id,name,amount,period) VALUES (${i+1},${esc(f[0])},${f[1]},${esc(f[2])})`);
});

// ═══ 10. Payments ═══
console.log("💳 Paiements...");
let pi = 0;
for (const r of rows) {
  if (Math.random() < 0.5) continue;
  pi++;
  const fi = rand(0, FD.length - 1);
  const m = rand(9, 11);
  sql(`INSERT INTO payments (id,student_id,fee_type_id,amount,method,reference,date,status) VALUES (${pi},${r.id},${fi+1},${FD[fi][1]},${esc(pick(["espèces","mobile_money","virement"]))},${esc("PAY-"+r.id+"-"+rand(1000,9999))},'2025-${String(m).padStart(2,"0")}-${String(rand(1,28)).padStart(2,"0")}','payé')`);
}
console.log(`  ${pi} paiements`);

// ═══ 11. Expenses ═══
console.log("💰 Dépenses...");
ED.forEach((e, i) => {
  const m = rand(9, 11);
  sql(`INSERT INTO expenses (id,description,amount,category,date,academic_year_id) VALUES (${i+1},${esc(e[0])},${e[1]},${esc(e[2])},'2025-${String(m).padStart(2,"0")}-${String(rand(1,28)).padStart(2,"0")}',1)`);
});

// ═══ 12. Attendance ═══
console.log("📅 Présences élèves...");
const dates: string[] = [];
const d = new Date(2025, 9, 1);
while (d <= new Date(2025, 10, 30)) { if (d.getDay() !== 0 && d.getDay() !== 6) dates.push(fmt(d)); d.setDate(d.getDate() + 1); }
const STATUSES = ["présent","absent","retard","congé"];
const WEIGHTS = [0.85, 0.05, 0.05, 0.05];
let ai = 0;
const av: string[] = [];
for (const r of rows) {
  for (const date of dates) {
    ai++;
    let cumul = 0;
    const rnd = Math.random();
    let chosen = STATUSES[0];
    for (let i = 0; i < STATUSES.length; i++) { cumul += WEIGHTS[i]; if (rnd < cumul) { chosen = STATUSES[i]; break; } }
    av.push(`(${ai},${r.id},${r.cid},${esc(date)},${esc(chosen)})`);
  }
}
for (let i = 0; i < av.length; i += 5000) sql(`INSERT INTO attendance (id,student_id,class_id,date,status) VALUES ${av.slice(i, i+5000).join(",\n")}`);
console.log(`  ${ai} présences`);

// ═══ 13. Evaluations + Grades ═══
console.log("📝 Évaluations & notes...");
let ei = 0;
let gi = 0;
const evb: string[] = [];
const grb: string[] = [];
const TR = 1;
for (const c of CL) {
  const prim = c[2] <= 6;
  const cs = rows.filter(r => r.cid === c[0]);
  SJ.forEach((s, si) => {
    if ((prim && !s[4]) || (!prim && !s[5])) return;
    for (const t of ["devoir","trimestrielle"]) {
      ei++;
      const dt = t === "devoir" ? `2025-10-${String(rand(15,25)).padStart(2,"0")}` : `2025-12-${String(rand(1,10)).padStart(2,"0")}`;
      evb.push(`(${ei},${esc((t==="devoir"?"Devoir":"Trimestrielle")+" - "+s[0])},${esc(t)},${c[0]},${si+1},${TR},1,${esc(dt)},'published')`);
      for (const r of cs) {
        gi++;
        const abs = Math.random() < 0.05;
        grb.push(`(${gi},${ei},${r.id},${abs ? 0 : rand(5,18)},${abs ? 1 : 0})`);
      }
    }
  });
}
for (let i = 0; i < evb.length; i += 500) sql(`INSERT INTO evaluations (id,name,type,class_id,subject_id,trimester,academic_year_id,date,status) VALUES ${evb.slice(i, i+500).join(",\n")}`);
for (let i = 0; i < grb.length; i += 5000) sql(`INSERT INTO grades (id,evaluation_id,student_id,score,is_absent) VALUES ${grb.slice(i, i+5000).join(",\n")}`);
console.log(`  ${ei} évaluations, ${gi} notes`);

// ═══ 14. Medical ═══
console.log("🏥 Fiches médicales...");
let mi = 0;
for (const r of rows) {
  if (Math.random() < 0.3) continue;
  mi++;
  sql(`INSERT INTO medical_infos (id,student_id,blood_type,allergies,vaccination_status,emergency_contact,emergency_phone) VALUES (${mi},${r.id},${esc(pick(BT))},${esc(Math.random() < 0.2 ? pick(["Arachides","Poussière","Aspirine","Pénicilline"]) : null)},${esc(Math.random()<0.8?"À jour":"Non vacciné")},${esc(pick(PN)+" "+pick(LN))},${esc(ph())})`);
}

// ═══ 15. Family ═══
console.log("👪 Infos familiales...");
let fi2 = 0;
for (const r of rows) {
  if (Math.random() < 0.2) continue;
  fi2++;
  const fln = pick(LN);
  sql(`INSERT INTO family_infos (id,student_id,father_name,father_phone,father_profession,mother_name,mother_phone,mother_profession) VALUES (${fi2},${r.id},${esc(pick(MN)+" "+fln)},${esc(ph())},${esc(pick(["Fonctionnaire","Commerçant","Enseignant","Agriculteur","Chauffeur","Menuisier","Maçon"]))},${esc(pick(FN)+" "+fln)},${esc(ph())},${esc(pick(["Ménagère","Commerçante","Enseignante","Infirmière","Coiffeuse"]))})`);
}

// ═══ 16. School info ═══
console.log("🏛️ École...");
sql("INSERT INTO school_info (id,name,address,phone,email,website,director,founded_year) VALUES (1,'École Fondamentale de Démonstration','Avenue de l''Indépendance, Bamako','+223 20 22 33 44','contact@efd-demonstration.ml','https://efd-demonstration.ml','Dr. Mamadou Traoré',1995)");

// ═══ 17. Teacher attend ═══
console.log("📅 Présences profs...");
let tai = 0;
for (let t = 1; t <= ti; t++) {
  for (const date of dates) {
    tai++;
    const rnd = Math.random();
    const st = rnd < 0.9 ? "present" : rnd < 0.93 ? "absent" : rnd < 0.96 ? "retard" : "excused";
    sql(`INSERT INTO teacher_attendance (id,teacher_id,date,status) VALUES (${tai},${t},${esc(date)},${esc(st)})`);
  }
}

// ═══ 18. Payroll ═══
console.log("💰 Paie...");
let pri = 0;
for (let t = 1; t <= ti; t++) {
  const sal = rand(120000, 250000);
  for (let m = 9; m <= 11; m++) {
    pri++;
    sql(`INSERT INTO payroll (id,teacher_id,month,year,amount,paid_at) VALUES (${pri},${t},${m},2025,${sal},${esc(`2025-${String(m).padStart(2,"0")}-${rand(25,28)}`)})`);
  }
}

// ═══ 19. Academic histories ═══
console.log("📜 Historiques...");
let hi = 0;
for (const r of rows) {
  if (Math.random() < 0.8) continue;
  const cls = CL.find(c => c[0] === r.cid);
  if (!cls || (cls[2] - 1) < 1) continue;
  const prev = CL.find(c => c[2] === cls[2] - 1) || CL[0];
  hi++;
  sql(`INSERT INTO academic_histories (id,student_id,school_name,class_name,academic_year,reason) VALUES (${hi},${r.id},'École Fondamentale de Démonstration',${esc(prev[1])},'2024-2025','Passage en classe supérieure')`);
}

// ═══ DONE ═══
sqlite.pragma("foreign_keys = ON");
sqlite.close();

console.log("");
console.log("══════════════════════════════════");
console.log("✅ Seed terminé !");
console.log(`   ${CL.length} classes`);
console.log(`   ${SJ.length} matières`);
console.log(`   ${ti} enseignants`);
console.log(`   ${sid} élèves`);
console.log(`   ${pi} paiements`);
console.log(`   ${ai} présences`);
console.log(`   ${ei} évaluations`);
console.log(`   ${gi} notes`);
console.log("══════════════════════════════════");
