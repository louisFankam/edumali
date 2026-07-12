-- =============================================================================
-- EduMali — Script de données de démonstration (Année scolaire 2025-2026)
-- Usage : sqlite3 ekima_db/data.db < scripts/seed-data.sql
-- =============================================================================

BEGIN TRANSACTION;

-- Nettoyage des données de test pour éviter les conflits
DELETE FROM audit_log;
DELETE FROM grades;
DELETE FROM evaluations;
DELETE FROM class_fee_types;
DELETE FROM class_subjects;
DELETE FROM teacher_subjects;
DELETE FROM teacher_attendance;
DELETE FROM payroll;
DELETE FROM expenses;
DELETE FROM schedules;
DELETE FROM exams;
DELETE FROM school_events;
DELETE FROM closed_periods;
DELETE FROM medical_infos;
DELETE FROM family_infos;
DELETE FROM academic_histories;
DELETE FROM payments WHERE student_id NOT IN (SELECT id FROM students LIMIT 1);
DELETE FROM attendance WHERE student_id NOT IN (SELECT id FROM students LIMIT 1);
DELETE FROM enrollments WHERE student_id NOT IN (SELECT id FROM students LIMIT 1);
DELETE FROM students WHERE id NOT IN (SELECT id FROM students LIMIT 1);
DELETE FROM subjects WHERE id > 1;
DELETE FROM teachers WHERE id > 1;
DELETE FROM fee_types;
DELETE FROM school_info;

-- =============================================================================
-- 1. ANNÉE SCOLAIRE
-- =============================================================================
UPDATE academic_years SET is_current = 0;
INSERT INTO academic_years (name, start_date, end_date, is_current)
  SELECT '2025-2026', '2025-10-01', '2026-06-30', 1
  WHERE NOT EXISTS (SELECT 1 FROM academic_years WHERE name = '2025-2026');
UPDATE academic_years SET is_current = 1 WHERE name = '2025-2026';

-- =============================================================================
-- 2. CLASSES (1ère → 9ème Année)
-- =============================================================================
-- IDs: CM2=1, test=2 (existants) ; 1ère=3, 2ème=4, …, 9ème=11 (nouveaux)

INSERT OR IGNORE INTO classes (name, level, capacity, total_fee, color, status)
VALUES
  ('1ère Année', 1, 30, 45000, '#22c55e', 'active'),
  ('2ème Année', 2, 30, 45000, '#3b82f6', 'active'),
  ('3ème Année', 3, 30, 55000, '#eab308', 'active'),
  ('4ème Année', 4, 30, 55000, '#a855f7', 'active'),
  ('5ème Année', 5, 30, 65000, '#ef4444', 'active'),
  ('6ème Année', 6, 30, 75000, '#ec4899', 'active'),
  ('7ème Année', 7, 35, 90000, '#14b8a6', 'active'),
  ('8ème Année', 8, 35, 95000, '#f97316', 'active'),
  ('9ème Année', 9, 35, 100000, '#6366f1', 'active');

-- =============================================================================
-- 3. INFORMATIONS ÉCOLE
-- =============================================================================
INSERT OR IGNORE INTO school_info (name, address, phone, email, website, director, founded_year, logo_url)
VALUES ('École de Démonstration EduMali', 'Bamako, Mali', '+223 70 12 34 56', 'contact@edumali.edu.ml', 'https://edumali.edu.ml', 'M. le Directeur', 2010, 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0iIzE5NzRiMiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMzIiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LWZhbWlseT0ic2VyaWYiPkVNPC90ZXh0Pjwvc3ZnPg==');

-- =============================================================================
-- 4. MATIÈRES
-- =============================================================================
INSERT OR IGNORE INTO subjects (name, code, coefficient, hours_per_week, color, status)
VALUES
  ('Mathématiques', 'MATH', 4, 6, '#3b82f6', 'Actif'),
  ('Français', 'FRAN', 4, 6, '#22c55e', 'Actif'),
  ('Anglais', 'ANGL', 2, 3, '#eab308', 'Actif'),
  ('Histoire-Géographie', 'HG', 2, 3, '#a855f7', 'Actif'),
  ('Sciences d''Observation', 'SDO', 2, 3, '#14b8a6', 'Actif'),
  ('Physique-Chimie', 'PHCH', 3, 4, '#06b6d4', 'Actif'),
  ('Sciences de la Vie et de la Terre', 'SVT', 3, 4, '#10b981', 'Actif'),
  ('Éducation Civique et Morale', 'ECM', 1, 1, '#ec4899', 'Actif'),
  ('Éducation Physique et Sportive', 'EPS', 1, 2, '#f97316', 'Actif'),
  ('Arts Plastiques', 'ARTS', 1, 1, '#ef4444', 'Actif'),
  ('Technologies de l''Information', 'TIC', 2, 2, '#6366f1', 'Actif'),
  ('Allemand', 'ALLEMAND', 2, 2, '#8b5cf6', 'Actif'),
  ('Technologie', 'TECHNO', 2, 2, '#0ea5e9', 'Actif'),
  ('Arabe', 'ARABE', 2, 2, '#d946ef', 'Actif');

-- =============================================================================
-- 4. ENSEIGNANTS (15)
-- =============================================================================
-- Titulaires (1 par classe)
INSERT OR IGNORE INTO teachers (first_name, last_name, email, phone, gender, hire_date, salary, hours_per_day, contrat, status)
VALUES
  ('Mamadou',   'Traoré',   'mamadou.traore@ecole.ml',   '70123401', 'Masculin', '2020-10-01', 150000, 6, 'mensuel', 'active'),
  ('Fatoumata', 'Keita',    'fatoumata.keita@ecole.ml',  '70123402', 'Féminin',  '2020-10-01', 150000, 6, 'mensuel', 'active'),
  ('Moussa',    'Diallo',   'moussa.diallo@ecole.ml',    '70123403', 'Masculin', '2020-10-01', 150000, 6, 'mensuel', 'active'),
  ('Aminata',   'Koné',     'aminata.kone@ecole.ml',     '70123404', 'Féminin',  '2020-10-01', 150000, 6, 'mensuel', 'active'),
  ('Drissa',    'Coulibaly','drissa.coulibaly@ecole.ml', '70123405', 'Masculin', '2021-10-01', 150000, 6, 'mensuel', 'active'),
  ('Rokia',     'Sidibé',   'rokia.sidibe@ecole.ml',    '70123406', 'Féminin',  '2021-10-01', 150000, 6, 'mensuel', 'active'),
  ('Sékou',     'Dembélé',  'sekou.dembele@ecole.ml',   '70123407', 'Masculin', '2021-10-01', 150000, 6, 'mensuel', 'active'),
  ('Mariam',    'Camara',   'mariam.camara@ecole.ml',   '70123408', 'Féminin',  '2021-10-01', 150000, 6, 'mensuel', 'active'),
  ('Boubacar',  'Bagayoko', 'boubacar.bagayoko@ecole.ml','70123409', 'Masculin', '2022-10-01', 150000, 6, 'mensuel', 'active'),
  -- Spécialistes
  ('Adama',     'Doumbia',  'adama.doumbia@ecole.ml',   '70123410', 'Masculin', '2022-10-01', 120000, 4, 'mensuel', 'active'),
  ('Kadiatou',  'Sissoko',  'kadiatou.sissoko@ecole.ml','70123411', 'Féminin',  '2022-10-01', 120000, 4, 'mensuel', 'active'),
  ('Oumar',     'Touré',    'oumar.toure@ecole.ml',     '70123412', 'Masculin', '2023-10-01', 120000, 4, 'mensuel', 'active'),
  ('Assitan',   'Sangaré',  'assitan.sangare@ecole.ml', '70123413', 'Féminin',  '2023-10-01', 120000, 4, 'mensuel', 'active'),
  ('Lassana',   'Konaté',   'lassana.konate@ecole.ml',  '70123414', 'Masculin', '2023-10-01', 120000, 4, 'horaire', 'active'),
  ('Hawa',      'Maïga',    'hawa.maiga@ecole.ml',      '70123415', 'Féminin',  '2023-10-01', 100000, 4, 'horaire', 'active');

-- =============================================================================
-- 5. TEACHER_SUBJECTS
-- =============================================================================
-- Titulaires enseignent plusieurs matières
-- Enseignants titulaires (1er cycle : 1ère→6ème) — enseignent plusieurs matières
INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id)
SELECT 2, id FROM subjects WHERE code IN ('FRAN','MATH','SDO','HG','ECM');   -- Mamadou (1ère)
INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id)
SELECT 3, id FROM subjects WHERE code IN ('FRAN','MATH','SDO','HG','ECM');   -- Fatoumata (2ème)
INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id)
SELECT 4, id FROM subjects WHERE code IN ('FRAN','MATH','SDO','HG','ECM');   -- Moussa (3ème)
INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id)
SELECT 5, id FROM subjects WHERE code IN ('FRAN','MATH','SDO','HG','ECM','ANGL');   -- Aminata (4ème)
INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id)
SELECT 6, id FROM subjects WHERE code IN ('FRAN','MATH','SDO','HG','ECM','ANGL');   -- Drissa (5ème)
INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id)
SELECT 7, id FROM subjects WHERE code IN ('FRAN','MATH','SDO','HG','ECM','ANGL');   -- Rokia (6ème)
-- Enseignants titulaires (2nd cycle : 7ème→9ème) — HG et ECM
INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id)
SELECT 8, id FROM subjects WHERE code IN ('HG','ECM');                          -- Sékou (7ème)
INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id)
SELECT 9, id FROM subjects WHERE code IN ('HG','ECM');                          -- Mariam (8ème)
INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id)
SELECT 10, id FROM subjects WHERE code IN ('HG','ECM');                         -- Boubacar (9ème)
-- Spécialistes (une ou deux matières)
INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id)
SELECT 11, id FROM subjects WHERE code = 'MATH';                                -- Adama (Maths)
INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id)
SELECT 12, id FROM subjects WHERE code = 'FRAN';                                -- Kadiatou (Français)
INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id)
SELECT 13, id FROM subjects WHERE code = 'ANGL';                                -- Oumar (Anglais)
INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id)
SELECT 14, id FROM subjects WHERE code IN ('PHCH','SVT');                       -- Assitan (Sciences collège)
INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id)
SELECT 15, id FROM subjects WHERE code = 'EPS';                                 -- Lassana (EPS)
INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id)
SELECT 16, id FROM subjects WHERE code = 'ARTS';                                -- Hawa (Arts)
INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id)
SELECT 11, id FROM subjects WHERE code = 'TIC';                                -- Adama (TIC)
INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id)
SELECT 13, id FROM subjects WHERE code = 'ALLEMAND';                           -- Oumar (Allemand)
INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id)
SELECT 14, id FROM subjects WHERE code = 'TECHNO';                            -- Assitan (Technologie)
INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id)
SELECT 12, id FROM subjects WHERE code = 'ARABE';                             -- Kadiatou (Arabe)

-- =============================================================================
-- 6. CLASS_SUBJECTS (chaque classe a des matières avec coefficients)
-- =============================================================================
-- =============================================================================
-- Structuration par classe (Mali — Enseignement Fondamental)
-- 1er cycle (1ère→6ème) : FRAN, MATH, SDO, HG, ECM, EPS, ARTS (+ANGL dès 4ème)
-- 2nd cycle (7ème→9ème) : FRAN, MATH, ANGL, HG, PHCH, SVT, ECM, EPS, ARTS
-- =============================================================================
-- 1ère Année : 7 matières, coeff total = 12
INSERT OR IGNORE INTO class_subjects (class_id, subject_id, teacher_id, coefficient)
SELECT c.id, s.id,
  CASE s.code WHEN 'EPS' THEN 15 WHEN 'ARTS' THEN 16 ELSE 2 END,
  CASE s.code WHEN 'FRAN' THEN 3 WHEN 'MATH' THEN 3 WHEN 'SDO' THEN 2 WHEN 'HG' THEN 1 WHEN 'ECM' THEN 1 WHEN 'EPS' THEN 1 WHEN 'ARTS' THEN 1 ELSE 1 END
FROM classes c CROSS JOIN subjects s
WHERE c.name = '1ère Année' AND s.code IN ('FRAN','MATH','SDO','HG','ECM','EPS','ARTS');

-- 2ème Année : 7 matières, coeff total = 12
INSERT OR IGNORE INTO class_subjects (class_id, subject_id, teacher_id, coefficient)
SELECT c.id, s.id,
  CASE s.code WHEN 'EPS' THEN 15 WHEN 'ARTS' THEN 16 ELSE 3 END,
  CASE s.code WHEN 'FRAN' THEN 3 WHEN 'MATH' THEN 3 WHEN 'SDO' THEN 2 WHEN 'HG' THEN 1 WHEN 'ECM' THEN 1 WHEN 'EPS' THEN 1 WHEN 'ARTS' THEN 1 ELSE 1 END
FROM classes c CROSS JOIN subjects s
WHERE c.name = '2ème Année' AND s.code IN ('FRAN','MATH','SDO','HG','ECM','EPS','ARTS');

-- 3ème Année : 7 matières, coeff total = 13 (HG→2)
INSERT OR IGNORE INTO class_subjects (class_id, subject_id, teacher_id, coefficient)
SELECT c.id, s.id,
  CASE s.code WHEN 'EPS' THEN 15 WHEN 'ARTS' THEN 16 ELSE 4 END,
  CASE s.code WHEN 'FRAN' THEN 3 WHEN 'MATH' THEN 3 WHEN 'SDO' THEN 2 WHEN 'HG' THEN 2 WHEN 'ECM' THEN 1 WHEN 'EPS' THEN 1 WHEN 'ARTS' THEN 1 ELSE 1 END
FROM classes c CROSS JOIN subjects s
WHERE c.name = '3ème Année' AND s.code IN ('FRAN','MATH','SDO','HG','ECM','EPS','ARTS');

-- 4ème Année : 8 matières (ajout ANGL), coeff total = 15
INSERT OR IGNORE INTO class_subjects (class_id, subject_id, teacher_id, coefficient)
SELECT c.id, s.id,
  CASE s.code WHEN 'ANGL' THEN 13 WHEN 'EPS' THEN 15 WHEN 'ARTS' THEN 16 ELSE 5 END,
  CASE s.code WHEN 'FRAN' THEN 3 WHEN 'MATH' THEN 3 WHEN 'ANGL' THEN 2 WHEN 'SDO' THEN 2 WHEN 'HG' THEN 2 WHEN 'ECM' THEN 1 WHEN 'EPS' THEN 1 WHEN 'ARTS' THEN 1 ELSE 1 END
FROM classes c CROSS JOIN subjects s
WHERE c.name = '4ème Année' AND s.code IN ('FRAN','MATH','ANGL','SDO','HG','ECM','EPS','ARTS');

-- 5ème Année : 8 matières, coeff total = 15
INSERT OR IGNORE INTO class_subjects (class_id, subject_id, teacher_id, coefficient)
SELECT c.id, s.id,
  CASE s.code WHEN 'ANGL' THEN 13 WHEN 'EPS' THEN 15 WHEN 'ARTS' THEN 16 ELSE 6 END,
  CASE s.code WHEN 'FRAN' THEN 3 WHEN 'MATH' THEN 3 WHEN 'ANGL' THEN 2 WHEN 'SDO' THEN 2 WHEN 'HG' THEN 2 WHEN 'ECM' THEN 1 WHEN 'EPS' THEN 1 WHEN 'ARTS' THEN 1 ELSE 1 END
FROM classes c CROSS JOIN subjects s
WHERE c.name = '5ème Année' AND s.code IN ('FRAN','MATH','ANGL','SDO','HG','ECM','EPS','ARTS');

-- 6ème Année : 8 matières, coeff total = 16 (FRAN→4)
INSERT OR IGNORE INTO class_subjects (class_id, subject_id, teacher_id, coefficient)
SELECT c.id, s.id,
  CASE s.code WHEN 'ANGL' THEN 13 WHEN 'EPS' THEN 15 WHEN 'ARTS' THEN 16 ELSE 7 END,
  CASE s.code WHEN 'FRAN' THEN 4 WHEN 'MATH' THEN 3 WHEN 'ANGL' THEN 2 WHEN 'SDO' THEN 2 WHEN 'HG' THEN 2 WHEN 'ECM' THEN 1 WHEN 'EPS' THEN 1 WHEN 'ARTS' THEN 1 ELSE 1 END
FROM classes c CROSS JOIN subjects s
WHERE c.name = '6ème Année' AND s.code IN ('FRAN','MATH','ANGL','SDO','HG','ECM','EPS','ARTS');

-- 7ème Année : 9 matières (PHCH+SVT remplacent SDO), coeff total = 21
INSERT OR IGNORE INTO class_subjects (class_id, subject_id, teacher_id, coefficient)
SELECT c.id, s.id,
  CASE s.code WHEN 'FRAN' THEN 12 WHEN 'MATH' THEN 11 WHEN 'ANGL' THEN 13 WHEN 'PHCH' THEN 14 WHEN 'SVT' THEN 14 WHEN 'HG' THEN 8 WHEN 'ECM' THEN 8 WHEN 'EPS' THEN 15 WHEN 'ARTS' THEN 16 ELSE NULL END,
  CASE s.code WHEN 'FRAN' THEN 4 WHEN 'MATH' THEN 4 WHEN 'ANGL' THEN 3 WHEN 'PHCH' THEN 3 WHEN 'SVT' THEN 2 WHEN 'HG' THEN 2 WHEN 'ECM' THEN 1 WHEN 'EPS' THEN 1 WHEN 'ARTS' THEN 1 ELSE 1 END
FROM classes c CROSS JOIN subjects s
WHERE c.name = '7ème Année' AND s.code IN ('FRAN','MATH','ANGL','HG','PHCH','SVT','ECM','EPS','ARTS');

-- 8ème Année : 9 matières, coeff total = 21
INSERT OR IGNORE INTO class_subjects (class_id, subject_id, teacher_id, coefficient)
SELECT c.id, s.id,
  CASE s.code WHEN 'FRAN' THEN 12 WHEN 'MATH' THEN 11 WHEN 'ANGL' THEN 13 WHEN 'PHCH' THEN 14 WHEN 'SVT' THEN 14 WHEN 'HG' THEN 9 WHEN 'ECM' THEN 9 WHEN 'EPS' THEN 15 WHEN 'ARTS' THEN 16 ELSE NULL END,
  CASE s.code WHEN 'FRAN' THEN 4 WHEN 'MATH' THEN 4 WHEN 'ANGL' THEN 3 WHEN 'PHCH' THEN 3 WHEN 'SVT' THEN 2 WHEN 'HG' THEN 2 WHEN 'ECM' THEN 1 WHEN 'EPS' THEN 1 WHEN 'ARTS' THEN 1 ELSE 1 END
FROM classes c CROSS JOIN subjects s
WHERE c.name = '8ème Année' AND s.code IN ('FRAN','MATH','ANGL','HG','PHCH','SVT','ECM','EPS','ARTS');

-- 9ème Année : 13 matières, coeff total = 32 (FRAN→5, MATH→5, SVT→3, PHCH→3)
INSERT OR IGNORE INTO class_subjects (class_id, subject_id, teacher_id, coefficient)
SELECT c.id, s.id,
  CASE s.code WHEN 'FRAN' THEN 12 WHEN 'MATH' THEN 11 WHEN 'ANGL' THEN 13 WHEN 'PHCH' THEN 14 WHEN 'SVT' THEN 14 WHEN 'HG' THEN 10 WHEN 'ECM' THEN 10 WHEN 'EPS' THEN 15 WHEN 'ARTS' THEN 16 WHEN 'TIC' THEN 11 WHEN 'ALLEMAND' THEN 13 WHEN 'TECHNO' THEN 14 WHEN 'ARABE' THEN 12 ELSE NULL END,
  CASE s.code WHEN 'FRAN' THEN 5 WHEN 'MATH' THEN 5 WHEN 'ANGL' THEN 3 WHEN 'PHCH' THEN 3 WHEN 'SVT' THEN 3 WHEN 'HG' THEN 2 WHEN 'ECM' THEN 1 WHEN 'EPS' THEN 1 WHEN 'ARTS' THEN 1 WHEN 'TIC' THEN 2 WHEN 'ALLEMAND' THEN 2 WHEN 'TECHNO' THEN 2 WHEN 'ARABE' THEN 2 ELSE 1 END
FROM classes c CROSS JOIN subjects s
WHERE c.name = '9ème Année' AND s.code IN ('FRAN','MATH','ANGL','HG','PHCH','SVT','ECM','EPS','ARTS','TIC','ALLEMAND','TECHNO','ARABE');

-- =============================================================================
-- 7. TYPES DE FRAIS
-- =============================================================================
INSERT OR IGNORE INTO fee_types (name, amount, period, description)
VALUES
  ('Scolarité', 0, 'annuel', 'Frais de scolarité annuels'),
  ('Frais d''examen', 5000, 'unique', 'Frais d''examen trimestriel'),
  ('Transport', 15000, 'trimestriel', 'Transport scolaire'),
  ('Assurance', 5000, 'annuel', 'Assurance scolaire'),
  ('Tenue', 10000, 'annuel', 'Tenue scolaire'),
  ('Activités', 7500, 'trimestriel', 'Activités parascolaires');

-- =============================================================================
-- 8. CLASS_FEE_TYPES (lier les frais aux classes)
-- =============================================================================
-- Frais de base (Scolarité) : montant = total_fee de la classe
INSERT OR IGNORE INTO class_fee_types (class_id, fee_type_id, amount)
SELECT c.id, ft.id, c.total_fee
FROM classes c CROSS JOIN fee_types ft
WHERE c.name IN ('1ère Année','2ème Année','3ème Année','4ème Année','5ème Année','6ème Année','7ème Année','8ème Année','9ème Année')
  AND ft.name = 'Scolarité';

-- Frais supplémentaires (examen, transport, assurance)
INSERT OR IGNORE INTO class_fee_types (class_id, fee_type_id, amount)
SELECT c.id, ft.id, ft.amount
FROM classes c CROSS JOIN fee_types ft
WHERE c.name IN ('1ère Année','2ème Année','3ème Année','4ème Année','5ème Année','6ème Année','7ème Année','8ème Année','9ème Année')
  AND ft.name IN ('Frais d''examen', 'Assurance');

-- Transport et Tenue seulement pour 5ème→9ème
INSERT OR IGNORE INTO class_fee_types (class_id, fee_type_id, amount)
SELECT c.id, ft.id, ft.amount
FROM classes c CROSS JOIN fee_types ft
WHERE c.name IN ('5ème Année','6ème Année','7ème Année','8ème Année','9ème Année')
  AND ft.name IN ('Transport', 'Tenue');

-- Activités seulement pour collège
INSERT OR IGNORE INTO class_fee_types (class_id, fee_type_id, amount)
SELECT c.id, ft.id, ft.amount
FROM classes c CROSS JOIN fee_types ft
WHERE c.name IN ('7ème Année','8ème Année','9ème Année')
  AND ft.name = 'Activités';

-- =============================================================================
-- 9. ÉLÈVES (180 = 20 × 9 classes)
-- =============================================================================
-- 1ère Année (class_id = 3)
INSERT INTO students (first_name, last_name, gender, birth_date, parent_name, parent_phone, address, class_id, registration_date, status)
SELECT * FROM (VALUES
  ('Mamadou','Traoré','Masculin','2018-01-15','Moussa Traoré','76123401','Bamako',3,'2025-10-01','Actif'),
  ('Fatoumata','Keita','Féminin','2018-03-20','Drissa Keita','76123402','Bamako',3,'2025-10-01','Actif'),
  ('Moussa','Diarra','Masculin','2018-05-10','Adama Diarra','76123403','Bamako',3,'2025-10-01','Actif'),
  ('Aminata','Diallo','Féminin','2018-02-28','Ousmane Diallo','76123404','Bamako',3,'2025-10-01','Actif'),
  ('Sékou','Koné','Masculin','2018-07-12','Mamady Koné','76123405','Bamako',3,'2025-10-01','Actif'),
  ('Kadiatou','Coulibaly','Féminin','2018-04-18','Bakary Coulibaly','76123406','Bamako',3,'2025-10-01','Actif'),
  ('Drissa','Sidibé','Masculin','2018-06-22','Makan Sidibé','76123407','Bamako',3,'2025-10-01','Actif'),
  ('Mariam','Dembélé','Féminin','2018-08-14','Samba Dembélé','76123408','Bamako',3,'2025-10-01','Actif'),
  ('Boubacar','Camara','Masculin','2018-01-30','Issa Camara','76123409','Bamako',3,'2025-10-01','Actif'),
  ('Aïssata','Bagayoko','Féminin','2018-09-05','Seydou Bagayoko','76123410','Bamako',3,'2025-10-01','Actif'),
  ('Oumar','Doumbia','Masculin','2018-11-18','Yacouba Doumbia','76123411','Bamako',3,'2025-10-01','Actif'),
  ('Djeneba','Sissoko','Féminin','2017-12-25','Moussa Sissoko','76123412','Bamako',3,'2025-10-01','Actif'),
  ('Lassana','Touré','Masculin','2018-02-14','Boureima Touré','76123413','Bamako',3,'2025-10-01','Actif'),
  ('Bintou','Sangaré','Féminin','2018-04-30','Amadou Sangaré','76123414','Bamako',3,'2025-10-01','Actif'),
  ('Yacouba','Konaté','Masculin','2018-06-15','Losseni Konaté','76123415','Bamako',3,'2025-10-01','Actif'),
  ('Oumou','Maïga','Féminin','2018-08-20','Souleymane Maïga','76123416','Bamako',3,'2025-10-01','Actif'),
  ('Cheick','Kanté','Masculin','2018-10-05','Mamadou Kanté','76123417','Bamako',3,'2025-10-01','Actif'),
  ('Salimata','Samaké','Féminin','2018-03-08','Abdoulaye Samaké','76123418','Bamako',3,'2025-10-01','Actif'),
  ('Modibo','Mariko','Masculin','2018-05-25','Samba Mariko','76123419','Bamako',3,'2025-10-01','Actif'),
  ('Rokia','Berthé','Féminin','2018-07-30','Mamourou Berthé','76123420','Bamako',3,'2025-10-01','Actif')
);

-- 2ème Année (class_id = 4)
INSERT INTO students (first_name, last_name, gender, birth_date, parent_name, parent_phone, address, class_id, registration_date, status)
SELECT * FROM (VALUES
  ('Ibrahim','Traoré','Masculin','2017-03-15','Mamadou Traoré','76223401','Bamako',4,'2025-10-01','Actif'),
  ('Assitan','Keita','Féminin','2017-05-20','Moussa Keita','76223402','Bamako',4,'2025-10-01','Actif'),
  ('Amadou','Diarra','Masculin','2017-01-10','Adama Diarra','76223403','Bamako',4,'2025-10-01','Actif'),
  ('Ramata','Diallo','Féminin','2017-09-28','Ousmane Diallo','76223404','Bamako',4,'2025-10-01','Actif'),
  ('Makan','Koné','Masculin','2017-07-12','Mamady Koné','76223405','Bamako',4,'2025-10-01','Actif'),
  ('Hawa','Coulibaly','Féminin','2017-04-18','Bakary Coulibaly','76223406','Bamako',4,'2025-10-01','Actif'),
  ('Samba','Sidibé','Masculin','2017-06-22','Makan Sidibé','76223407','Bamako',4,'2025-10-01','Actif'),
  ('Nafissatou','Dembélé','Féminin','2017-08-14','Samba Dembélé','76223408','Bamako',4,'2025-10-01','Actif'),
  ('Issa','Camara','Masculin','2017-10-30','Seydou Camara','76223409','Bamako',4,'2025-10-01','Actif'),
  ('Ténin','Bagayoko','Féminin','2017-02-05','Drissa Bagayoko','76223410','Bamako',4,'2025-10-01','Actif'),
  ('Mamady','Doumbia','Masculin','2017-11-18','Yacouba Doumbia','76223411','Bamako',4,'2025-10-01','Actif'),
  ('Korotoumou','Sissoko','Féminin','2017-03-25','Moussa Sissoko','76223412','Bamako',4,'2025-10-01','Actif'),
  ('Bakary','Touré','Masculin','2017-12-14','Boureima Touré','76223413','Bamako',4,'2025-10-01','Actif'),
  ('Kadia','Sangaré','Féminin','2017-04-30','Amadou Sangaré','76223414','Bamako',4,'2025-10-01','Actif'),
  ('Seydou','Konaté','Masculin','2017-06-15','Losseni Konaté','76223415','Bamako',4,'2025-10-01','Actif'),
  ('Fanta','Maïga','Féminin','2017-08-20','Souleymane Maïga','76223416','Bamako',4,'2025-10-01','Actif'),
  ('Dramane','Kanté','Masculin','2017-10-05','Mamadou Kanté','76223417','Bamako',4,'2025-10-01','Actif'),
  ('Maimouna','Samaké','Féminin','2017-01-08','Abdoulaye Samaké','76223418','Bamako',4,'2025-10-01','Actif'),
  ('Souleymane','Mariko','Masculin','2017-05-25','Samba Mariko','76223419','Bamako',4,'2025-10-01','Actif'),
  ('Awa','Berthé','Féminin','2017-07-30','Mamourou Berthé','76223420','Bamako',4,'2025-10-01','Actif')
);

-- 3ème Année (class_id = 5)
INSERT INTO students (first_name, last_name, gender, birth_date, parent_name, parent_phone, address, class_id, registration_date, status)
SELECT * FROM (VALUES
  ('Adama','Traoré','Masculin','2016-03-15','Mamadou Traoré','76323401','Bamako',5,'2025-10-01','Actif'),
  ('Rokia','Keita','Féminin','2016-05-20','Drissa Keita','76323402','Bamako',5,'2025-10-01','Actif'),
  ('Makan','Diarra','Masculin','2016-01-10','Adama Diarra','76323403','Bamako',5,'2025-10-01','Actif'),
  ('Mariam','Diallo','Féminin','2016-09-28','Ousmane Diallo','76323404','Bamako',5,'2025-10-01','Actif'),
  ('Losseni','Koné','Masculin','2016-07-12','Mamady Koné','76323405','Bamako',5,'2025-10-01','Actif'),
  ('Kadiatou','Coulibaly','Féminin','2016-04-18','Bakary Coulibaly','76323406','Bamako',5,'2025-10-01','Actif'),
  ('Moussa','Sidibé','Masculin','2016-06-22','Makan Sidibé','76323407','Bamako',5,'2025-10-01','Actif'),
  ('Assitan','Dembélé','Féminin','2016-08-14','Samba Dembélé','76323408','Bamako',5,'2025-10-01','Actif'),
  ('Samba','Camara','Masculin','2016-10-30','Issa Camara','76323409','Bamako',5,'2025-10-01','Actif'),
  ('Fatoumata','Bagayoko','Féminin','2016-02-05','Seydou Bagayoko','76323410','Bamako',5,'2025-10-01','Actif'),
  ('Issa','Doumbia','Masculin','2016-11-18','Yacouba Doumbia','76323411','Bamako',5,'2025-10-01','Actif'),
  ('Aminata','Sissoko','Féminin','2016-03-25','Moussa Sissoko','76323412','Bamako',5,'2025-10-01','Actif'),
  ('Boureima','Touré','Masculin','2016-12-14','Boureima Touré','76323413','Bamako',5,'2025-10-01','Actif'),
  ('Salimata','Sangaré','Féminin','2016-04-30','Amadou Sangaré','76323414','Bamako',5,'2025-10-01','Actif'),
  ('Youssouf','Konaté','Masculin','2016-06-15','Losseni Konaté','76323415','Bamako',5,'2025-10-01','Actif'),
  ('Djeneba','Maïga','Féminin','2016-08-20','Souleymane Maïga','76323416','Bamako',5,'2025-10-01','Actif'),
  ('Mamourou','Kanté','Masculin','2016-10-05','Mamadou Kanté','76323417','Bamako',5,'2025-10-01','Actif'),
  ('Oumou','Samaké','Féminin','2016-01-08','Abdoulaye Samaké','76323418','Bamako',5,'2025-10-01','Actif'),
  ('Seydou','Mariko','Masculin','2016-05-25','Samba Mariko','76323419','Bamako',5,'2025-10-01','Actif'),
  ('Bintou','Berthé','Féminin','2016-07-30','Mamourou Berthé','76323420','Bamako',5,'2025-10-01','Actif')
);

-- 4ème Année (class_id = 6)
INSERT INTO students (first_name, last_name, gender, birth_date, parent_name, parent_phone, address, class_id, registration_date, status)
SELECT * FROM (VALUES
  ('Moussa','Traoré','Masculin','2015-03-15','Mamadou Traoré','76423401','Bamako',6,'2025-10-01','Actif'),
  ('Mariam','Keita','Féminin','2015-05-20','Drissa Keita','76423402','Bamako',6,'2025-10-01','Actif'),
  ('Drissa','Diarra','Masculin','2015-01-10','Adama Diarra','76423403','Bamako',6,'2025-10-01','Actif'),
  ('Aminata','Diallo','Féminin','2015-09-28','Ousmane Diallo','76423404','Bamako',6,'2025-10-01','Actif'),
  ('Bakary','Koné','Masculin','2015-07-12','Mamady Koné','76423405','Bamako',6,'2025-10-01','Actif'),
  ('Ténin','Coulibaly','Féminin','2015-04-18','Bakary Coulibaly','76423406','Bamako',6,'2025-10-01','Actif'),
  ('Ousmane','Sidibé','Masculin','2015-06-22','Makan Sidibé','76423407','Bamako',6,'2025-10-01','Actif'),
  ('Rokia','Dembélé','Féminin','2015-08-14','Samba Dembélé','76423408','Bamako',6,'2025-10-01','Actif'),
  ('Makan','Camara','Masculin','2015-10-30','Issa Camara','76423409','Bamako',6,'2025-10-01','Actif'),
  ('Hawa','Bagayoko','Féminin','2015-02-05','Seydou Bagayoko','76423410','Bamako',6,'2025-10-01','Actif'),
  ('Souleymane','Doumbia','Masculin','2015-11-18','Yacouba Doumbia','76423411','Bamako',6,'2025-10-01','Actif'),
  ('Ramata','Sissoko','Féminin','2015-03-25','Moussa Sissoko','76423412','Bamako',6,'2025-10-01','Actif'),
  ('Mamadou','Touré','Masculin','2015-12-14','Boureima Touré','76423413','Bamako',6,'2025-10-01','Actif'),
  ('Korotoumou','Sangaré','Féminin','2015-04-30','Amadou Sangaré','76423414','Bamako',6,'2025-10-01','Actif'),
  ('Abdoulaye','Konaté','Masculin','2015-06-15','Losseni Konaté','76423415','Bamako',6,'2025-10-01','Actif'),
  ('Aïssata','Maïga','Féminin','2015-08-20','Souleymane Maïga','76423416','Bamako',6,'2025-10-01','Actif'),
  ('Sékou','Kanté','Masculin','2015-10-05','Mamadou Kanté','76423417','Bamako',6,'2025-10-01','Actif'),
  ('Nafissatou','Samaké','Féminin','2015-01-08','Abdoulaye Samaké','76423418','Bamako',6,'2025-10-01','Actif'),
  ('Lassana','Mariko','Masculin','2015-05-25','Samba Mariko','76423419','Bamako',6,'2025-10-01','Actif'),
  ('Fanta','Berthé','Féminin','2015-07-30','Mamourou Berthé','76423420','Bamako',6,'2025-10-01','Actif')
);

-- 5ème Année (class_id = 7)
INSERT INTO students (first_name, last_name, gender, birth_date, parent_name, parent_phone, address, class_id, registration_date, status)
SELECT * FROM (VALUES
  ('Samba','Traoré','Masculin','2014-03-15','Moussa Traoré','76523401','Bamako',7,'2025-10-01','Actif'),
  ('Ramata','Keita','Féminin','2014-05-20','Drissa Keita','76523402','Bamako',7,'2025-10-01','Actif'),
  ('Yacouba','Diarra','Masculin','2014-01-10','Adama Diarra','76523403','Bamako',7,'2025-10-01','Actif'),
  ('Kadiatou','Diallo','Féminin','2014-09-28','Ousmane Diallo','76523404','Bamako',7,'2025-10-01','Actif'),
  ('Amadou','Koné','Masculin','2014-07-12','Mamady Koné','76523405','Bamako',7,'2025-10-01','Actif'),
  ('Assitan','Coulibaly','Féminin','2014-04-18','Bakary Coulibaly','76523406','Bamako',7,'2025-10-01','Actif'),
  ('Modibo','Sidibé','Masculin','2014-06-22','Makan Sidibé','76523407','Bamako',7,'2025-10-01','Actif'),
  ('Djeneba','Dembélé','Féminin','2014-08-14','Samba Dembélé','76523408','Bamako',7,'2025-10-01','Actif'),
  ('Cheick','Camara','Masculin','2014-10-30','Issa Camara','76523409','Bamako',7,'2025-10-01','Actif'),
  ('Oumou','Bagayoko','Féminin','2014-02-05','Drissa Bagayoko','76523410','Bamako',7,'2025-10-01','Actif'),
  ('Mamady','Doumbia','Masculin','2014-11-18','Yacouba Doumbia','76523411','Bamako',7,'2025-10-01','Actif'),
  ('Aminata','Sissoko','Féminin','2014-03-25','Moussa Sissoko','76523412','Bamako',7,'2025-10-01','Actif'),
  ('Boureima','Touré','Masculin','2014-12-14','Boureima Touré','76523413','Bamako',7,'2025-10-01','Actif'),
  ('Mariam','Sangaré','Féminin','2014-04-30','Amadou Sangaré','76523414','Bamako',7,'2025-10-01','Actif'),
  ('Issa','Konaté','Masculin','2014-06-15','Losseni Konaté','76523415','Bamako',7,'2025-10-01','Actif'),
  ('Salimata','Maïga','Féminin','2014-08-20','Souleymane Maïga','76523416','Bamako',7,'2025-10-01','Actif'),
  ('Bakary','Kanté','Masculin','2014-10-05','Mamadou Kanté','76523417','Bamako',7,'2025-10-01','Actif'),
  ('Maimouna','Samaké','Féminin','2014-01-08','Abdoulaye Samaké','76523418','Bamako',7,'2025-10-01','Actif'),
  ('Seydou','Mariko','Masculin','2014-05-25','Samba Mariko','76523419','Bamako',7,'2025-10-01','Actif'),
  ('Awa','Berthé','Féminin','2014-07-30','Mamourou Berthé','76523420','Bamako',7,'2025-10-01','Actif')
);

-- 6ème Année (class_id = 8)
INSERT INTO students (first_name, last_name, gender, birth_date, parent_name, parent_phone, address, class_id, registration_date, status)
SELECT * FROM (VALUES
  ('Mamadou','Keita','Masculin','2013-03-15','Mamadou Keita','76623401','Bamako',8,'2025-10-01','Actif'),
  ('Aminata','Traoré','Féminin','2013-05-20','Moussa Traoré','76623402','Bamako',8,'2025-10-01','Actif'),
  ('Makan','Diarra','Masculin','2013-01-10','Adama Diarra','76623403','Bamako',8,'2025-10-01','Actif'),
  ('Rokia','Diallo','Féminin','2013-09-28','Ousmane Diallo','76623404','Bamako',8,'2025-10-01','Actif'),
  ('Drissa','Koné','Masculin','2013-07-12','Mamady Koné','76623405','Bamako',8,'2025-10-01','Actif'),
  ('Fatoumata','Coulibaly','Féminin','2013-04-18','Bakary Coulibaly','76623406','Bamako',8,'2025-10-01','Actif'),
  ('Moussa','Sidibé','Masculin','2013-06-22','Makan Sidibé','76623407','Bamako',8,'2025-10-01','Actif'),
  ('Hawa','Dembélé','Féminin','2013-08-14','Samba Dembélé','76623408','Bamako',8,'2025-10-01','Actif'),
  ('Ibrahim','Camara','Masculin','2013-10-30','Issa Camara','76623409','Bamako',8,'2025-10-01','Actif'),
  ('Ténin','Bagayoko','Féminin','2013-02-05','Drissa Bagayoko','76623410','Bamako',8,'2025-10-01','Actif'),
  ('Lassana','Doumbia','Masculin','2013-11-18','Yacouba Doumbia','76623411','Bamako',8,'2025-10-01','Actif'),
  ('Oumou','Sissoko','Féminin','2013-03-25','Moussa Sissoko','76623412','Bamako',8,'2025-10-01','Actif'),
  ('Cheick','Touré','Masculin','2013-12-14','Boureima Touré','76623413','Bamako',8,'2025-10-01','Actif'),
  ('Ramata','Sangaré','Féminin','2013-04-30','Amadou Sangaré','76623414','Bamako',8,'2025-10-01','Actif'),
  ('Ousmane','Konaté','Masculin','2013-06-15','Losseni Konaté','76623415','Bamako',8,'2025-10-01','Actif'),
  ('Mariam','Maïga','Féminin','2013-08-20','Souleymane Maïga','76623416','Bamako',8,'2025-10-01','Actif'),
  ('Adama','Kanté','Masculin','2013-10-05','Mamadou Kanté','76623417','Bamako',8,'2025-10-01','Actif'),
  ('Aïssata','Samaké','Féminin','2013-01-08','Abdoulaye Samaké','76623418','Bamako',8,'2025-10-01','Actif'),
  ('Bakary','Mariko','Masculin','2013-05-25','Samba Mariko','76623419','Bamako',8,'2025-10-01','Actif'),
  ('Bintou','Berthé','Féminin','2013-07-30','Mamourou Berthé','76623420','Bamako',8,'2025-10-01','Actif')
);

-- 7ème Année (class_id = 9)
INSERT INTO students (first_name, last_name, gender, birth_date, parent_name, parent_phone, address, class_id, registration_date, status)
SELECT * FROM (VALUES
  ('Seydou','Traoré','Masculin','2012-03-15','Mamadou Traoré','76723401','Bamako',9,'2025-10-01','Actif'),
  ('Kadiatou','Keita','Féminin','2012-05-20','Drissa Keita','76723402','Bamako',9,'2025-10-01','Actif'),
  ('Oumar','Diarra','Masculin','2012-01-10','Adama Diarra','76723403','Bamako',9,'2025-10-01','Actif'),
  ('Mariam','Diallo','Féminin','2012-09-28','Ousmane Diallo','76723404','Bamako',9,'2025-10-01','Actif'),
  ('Boubacar','Koné','Masculin','2012-07-12','Mamady Koné','76723405','Bamako',9,'2025-10-01','Actif'),
  ('Assitan','Coulibaly','Féminin','2012-04-18','Bakary Coulibaly','76723406','Bamako',9,'2025-10-01','Actif'),
  ('Makan','Sidibé','Masculin','2012-06-22','Makan Sidibé','76723407','Bamako',9,'2025-10-01','Actif'),
  ('Djeneba','Dembélé','Féminin','2012-08-14','Samba Dembélé','76723408','Bamako',9,'2025-10-01','Actif'),
  ('Mamadou','Camara','Masculin','2012-10-30','Issa Camara','76723409','Bamako',9,'2025-10-01','Actif'),
  ('Fatoumata','Bagayoko','Féminin','2012-02-05','Seydou Bagayoko','76723410','Bamako',9,'2025-10-01','Actif'),
  ('Samba','Doumbia','Masculin','2012-11-18','Yacouba Doumbia','76723411','Bamako',9,'2025-10-01','Actif'),
  ('Aminata','Sissoko','Féminin','2012-03-25','Moussa Sissoko','76723412','Bamako',9,'2025-10-01','Actif'),
  ('Modibo','Touré','Masculin','2012-12-14','Boureima Touré','76723413','Bamako',9,'2025-10-01','Actif'),
  ('Ramata','Sangaré','Féminin','2012-04-30','Amadou Sangaré','76723414','Bamako',9,'2025-10-01','Actif'),
  ('Issa','Konaté','Masculin','2012-06-15','Losseni Konaté','76723415','Bamako',9,'2025-10-01','Actif'),
  ('Rokia','Maïga','Féminin','2012-08-20','Souleymane Maïga','76723416','Bamako',9,'2025-10-01','Actif'),
  ('Moussa','Kanté','Masculin','2012-10-05','Mamadou Kanté','76723417','Bamako',9,'2025-10-01','Actif'),
  ('Salimata','Samaké','Féminin','2012-01-08','Abdoulaye Samaké','76723418','Bamako',9,'2025-10-01','Actif'),
  ('Yacouba','Mariko','Masculin','2012-05-25','Samba Mariko','76723419','Bamako',9,'2025-10-01','Actif'),
  ('Nafissatou','Berthé','Féminin','2012-07-30','Mamourou Berthé','76723420','Bamako',9,'2025-10-01','Actif')
);

-- 8ème Année (class_id = 10)
INSERT INTO students (first_name, last_name, gender, birth_date, parent_name, parent_phone, address, class_id, registration_date, status)
SELECT * FROM (VALUES
  ('Drissa','Traoré','Masculin','2011-03-15','Mamadou Traoré','76823401','Bamako',10,'2025-10-01','Actif'),
  ('Aïssata','Keita','Féminin','2011-05-20','Drissa Keita','76823402','Bamako',10,'2025-10-01','Actif'),
  ('Lassana','Diarra','Masculin','2011-01-10','Adama Diarra','76823403','Bamako',10,'2025-10-01','Actif'),
  ('Bintou','Diallo','Féminin','2011-09-28','Ousmane Diallo','76823404','Bamako',10,'2025-10-01','Actif'),
  ('Sékou','Koné','Masculin','2011-07-12','Mamady Koné','76823405','Bamako',10,'2025-10-01','Actif'),
  ('Hawa','Coulibaly','Féminin','2011-04-18','Bakary Coulibaly','76823406','Bamako',10,'2025-10-01','Actif'),
  ('Amadou','Sidibé','Masculin','2011-06-22','Makan Sidibé','76823407','Bamako',10,'2025-10-01','Actif'),
  ('Korotoumou','Dembélé','Féminin','2011-08-14','Samba Dembélé','76823408','Bamako',10,'2025-10-01','Actif'),
  ('Samba','Camara','Masculin','2011-10-30','Issa Camara','76823409','Bamako',10,'2025-10-01','Actif'),
  ('Maimouna','Bagayoko','Féminin','2011-02-05','Drissa Bagayoko','76823410','Bamako',10,'2025-10-01','Actif'),
  ('Bakary','Doumbia','Masculin','2011-11-18','Yacouba Doumbia','76823411','Bamako',10,'2025-10-01','Actif'),
  ('Ténin','Sissoko','Féminin','2011-03-25','Moussa Sissoko','76823412','Bamako',10,'2025-10-01','Actif'),
  ('Mamady','Touré','Masculin','2011-12-14','Boureima Touré','76823413','Bamako',10,'2025-10-01','Actif'),
  ('Aminata','Sangaré','Féminin','2011-04-30','Amadou Sangaré','76823414','Bamako',10,'2025-10-01','Actif'),
  ('Seydou','Konaté','Masculin','2011-06-15','Losseni Konaté','76823415','Bamako',10,'2025-10-01','Actif'),
  ('Djeneba','Maïga','Féminin','2011-08-20','Souleymane Maïga','76823416','Bamako',10,'2025-10-01','Actif'),
  ('Mamadou','Kanté','Masculin','2011-10-05','Mamadou Kanté','76823417','Bamako',10,'2025-10-01','Actif'),
  ('Fatoumata','Samaké','Féminin','2011-01-08','Abdoulaye Samaké','76823418','Bamako',10,'2025-10-01','Actif'),
  ('Ousmane','Mariko','Masculin','2011-05-25','Samba Mariko','76823419','Bamako',10,'2025-10-01','Actif'),
  ('Rokia','Berthé','Féminin','2011-07-30','Mamourou Berthé','76823420','Bamako',10,'2025-10-01','Actif')
);

-- 9ème Année (class_id = 11)
INSERT INTO students (first_name, last_name, gender, birth_date, parent_name, parent_phone, address, class_id, registration_date, status)
SELECT * FROM (VALUES
  ('Moussa','Traoré','Masculin','2010-03-15','Mamadou Traoré','76923401','Bamako',11,'2025-10-01','Actif'),
  ('Rokia','Keita','Féminin','2010-05-20','Drissa Keita','76923402','Bamako',11,'2025-10-01','Actif'),
  ('Cheick','Diarra','Masculin','2010-01-10','Adama Diarra','76923403','Bamako',11,'2025-10-01','Actif'),
  ('Mariam','Diallo','Féminin','2010-09-28','Ousmane Diallo','76923404','Bamako',11,'2025-10-01','Actif'),
  ('Makan','Koné','Masculin','2010-07-12','Mamady Koné','76923405','Bamako',11,'2025-10-01','Actif'),
  ('Assitan','Coulibaly','Féminin','2010-04-18','Bakary Coulibaly','76923406','Bamako',11,'2025-10-01','Actif'),
  ('Ibrahim','Sidibé','Masculin','2010-06-22','Makan Sidibé','76923407','Bamako',11,'2025-10-01','Actif'),
  ('Kadiatou','Dembélé','Féminin','2010-08-14','Samba Dembélé','76923408','Bamako',11,'2025-10-01','Actif'),
  ('Boureima','Camara','Masculin','2010-10-30','Issa Camara','76923409','Bamako',11,'2025-10-01','Actif'),
  ('Oumou','Bagayoko','Féminin','2010-02-05','Seydou Bagayoko','76923410','Bamako',11,'2025-10-01','Actif'),
  ('Adama','Doumbia','Masculin','2010-11-18','Yacouba Doumbia','76923411','Bamako',11,'2025-10-01','Actif'),
  ('Fatoumata','Sissoko','Féminin','2010-03-25','Moussa Sissoko','76923412','Bamako',11,'2025-10-01','Actif'),
  ('Modibo','Touré','Masculin','2010-12-14','Boureima Touré','76923413','Bamako',11,'2025-10-01','Actif'),
  ('Salimata','Sangaré','Féminin','2010-04-30','Amadou Sangaré','76923414','Bamako',11,'2025-10-01','Actif'),
  ('Youssouf','Konaté','Masculin','2010-06-15','Losseni Konaté','76923415','Bamako',11,'2025-10-01','Actif'),
  ('Aminata','Maïga','Féminin','2010-08-20','Souleymane Maïga','76923416','Bamako',11,'2025-10-01','Actif'),
  ('Samba','Kanté','Masculin','2010-10-05','Mamadou Kanté','76923417','Bamako',11,'2025-10-01','Actif'),
  ('Hawa','Samaké','Féminin','2010-01-08','Abdoulaye Samaké','76923418','Bamako',11,'2025-10-01','Actif'),
  ('Mamadou','Mariko','Masculin','2010-05-25','Samba Mariko','76923419','Bamako',11,'2025-10-01','Actif'),
  ('Ramata','Berthé','Féminin','2010-07-30','Mamourou Berthé','76923420','Bamako',11,'2025-10-01','Actif')
);

-- =============================================================================
-- 10. ENROLLMENTS (180 élèves dans 2025-2026)
-- =============================================================================
INSERT OR IGNORE INTO enrollments (student_id, class_id, academic_year_id, enrollment_date, status)
SELECT s.id, s.class_id, ay.id, '2025-10-01', 'inscrit'
FROM students s CROSS JOIN academic_years ay
WHERE ay.is_current = 1 AND s.status = 'Actif'
  AND NOT EXISTS (SELECT 1 FROM enrollments e WHERE e.student_id = s.id AND e.academic_year_id = ay.id);
-- Ajouter aussi l'élève existant (louis fankam, id=1) dans CM2
INSERT OR IGNORE INTO enrollments (student_id, class_id, academic_year_id, enrollment_date, status)
SELECT 1, 1, ay.id, '2025-10-01', 'inscrit'
FROM academic_years ay WHERE ay.is_current = 1;

-- =============================================================================
-- 11. DISCOUNTS (30% des élèves ont une réduction)
-- =============================================================================
UPDATE students SET
  discount_type = CASE WHEN s.id % 10 = 0 THEN 'percentage' WHEN s.id % 7 = 0 THEN 'fixed' ELSE NULL END,
  discount_value = CASE WHEN s.id % 10 = 0 THEN 10 WHEN s.id % 7 = 0 THEN 5000 ELSE NULL END,
  discount_reason = CASE WHEN s.id % 10 = 0 THEN 'Famille nombreuse' WHEN s.id % 7 = 0 THEN 'Bourse scolaire' ELSE NULL END
FROM (SELECT id FROM students) s WHERE students.id > 1 AND students.id = s.id
  AND (s.id % 10 = 0 OR s.id % 7 = 0);

-- =============================================================================
-- 12. PAIEMENTS (400+)
-- =============================================================================
-- Scolarité : certains paient en une fois, d'autres en plusieurs versements
-- Octobre 2025 : premier versement (40-60% du total)
INSERT INTO payments (student_id, fee_type_id, amount, method, date, status)
SELECT s.id, ft.id,
  CASE
    WHEN s.id % 5 = 0 THEN ROUND(c.total_fee * 0.5)  -- 50% d'avance
    WHEN s.id % 7 = 0 THEN ROUND(c.total_fee * 0.3)  -- 30%
    ELSE ROUND(c.total_fee * 0.4)                     -- 40%
  END,
  CASE CAST(s.id % 4 AS INTEGER)
    WHEN 0 THEN 'espèces' WHEN 1 THEN 'mobile_money' WHEN 2 THEN 'virement' ELSE 'chèque'
  END,
  '2025-10-' || SUBSTR('0' || CAST(5 + (s.id % 20) AS TEXT), -2, 2),
  'payé'
FROM students s
JOIN classes c ON c.id = s.class_id
CROSS JOIN fee_types ft
WHERE s.status = 'Actif' AND s.id > 1 AND ft.name = 'Scolarité'
  AND s.id % 13 != 0;  -- 8% ne paient rien en octobre

-- Novembre 2025 : deuxième versement
INSERT INTO payments (student_id, fee_type_id, amount, method, date, status)
SELECT s.id, ft.id,
  CASE
    WHEN s.id % 5 = 0 THEN ROUND(c.total_fee * 0.5)  -- solde pour ceux qui ont donné 50%
    ELSE ROUND(c.total_fee * 0.3)
  END,
  CASE CAST(s.id % 4 AS INTEGER)
    WHEN 0 THEN 'espèces' WHEN 1 THEN 'mobile_money' WHEN 2 THEN 'virement' ELSE 'chèque'
  END,
  '2025-11-' || SUBSTR('0' || CAST(3 + (s.id % 25) AS TEXT), -2, 2),
  CASE WHEN s.id % 11 = 0 THEN 'en_attente' ELSE 'payé' END
FROM students s
JOIN classes c ON c.id = s.class_id
CROSS JOIN fee_types ft
WHERE s.status = 'Actif' AND s.id > 1 AND ft.name = 'Scolarité'
  AND s.id % 5 != 0     -- ceux qui ont payé 50% en oct complètent
  AND s.id % 13 != 0;   -- exclus ceux qui n'ont pas payé en oct

-- Janvier 2026 : paiement final (solde) pour les paiements en plusieurs fois
INSERT INTO payments (student_id, fee_type_id, amount, method, date, status)
SELECT s.id, ft.id,
  c.total_fee - COALESCE((SELECT SUM(p2.amount) FROM payments p2 WHERE p2.student_id = s.id AND p2.status = 'payé'), 0),
  CASE CAST(s.id % 4 AS INTEGER)
    WHEN 0 THEN 'espèces' WHEN 1 THEN 'mobile_money' WHEN 2 THEN 'virement' ELSE 'chèque'
  END,
  '2026-01-15',
  CASE WHEN s.id % 3 = 0 THEN 'payé' ELSE 'en_attente' END
FROM students s
JOIN classes c ON c.id = s.class_id
CROSS JOIN fee_types ft
WHERE s.status = 'Actif' AND s.id > 1 AND ft.name = 'Scolarité'
  AND s.id % 5 != 0     -- exclus ceux qui ont payé en une fois
  AND COALESCE((SELECT SUM(p2.amount) FROM payments p2 WHERE p2.student_id = s.id AND p2.status = 'payé'), 0) < c.total_fee
  AND s.id % 13 != 0;   -- exclus impayés

-- Frais supplémentaires : examens, assurance, transport
INSERT INTO payments (student_id, fee_type_id, amount, method, date, status)
SELECT s.id, cft.fee_type_id, COALESCE(cft.amount, ft.amount),
  CASE CAST(s.id % 4 AS INTEGER)
    WHEN 0 THEN 'espèces' WHEN 1 THEN 'mobile_money' WHEN 2 THEN 'virement' ELSE 'chèque'
  END,
  CASE WHEN ft.period = 'trimestriel' THEN '2025-10-15'
       WHEN ft.period = 'annuel' THEN '2025-10-20'
       ELSE '2025-11-01'
  END,
  CASE WHEN s.id % 8 = 0 THEN 'en_attente' ELSE 'payé' END
FROM students s
JOIN class_fee_types cft ON cft.class_id = s.class_id
JOIN fee_types ft ON ft.id = cft.fee_type_id
WHERE s.status = 'Actif' AND s.id > 1 AND ft.name != 'Scolarité'
  AND s.id % 13 != 0;

-- Garantir que tous les étudiants actifs ont au moins un paiement
INSERT INTO payments (student_id, amount, method, date, status)
SELECT s.id, COALESCE(c.total_fee, 75000), 'espèces', COALESCE(e.enrollment_date, '2025-10-01'), 'payé'
FROM students s
LEFT JOIN classes c ON c.id = s.class_id
LEFT JOIN enrollments e ON e.student_id = s.id AND e.academic_year_id = (SELECT id FROM academic_years WHERE is_current = 1)
WHERE s.status = 'Actif'
  AND (SELECT COALESCE(SUM(p.amount), 0) FROM payments p WHERE p.student_id = s.id) = 0;

-- =============================================================================
-- 13. PRÉSENCES ÉLÈVES (2 semaines, oct-nov 2025)
-- =============================================================================
INSERT OR IGNORE INTO attendance (student_id, class_id, date, status)
SELECT s.id, s.class_id, d.date,
  CASE
    WHEN s.id % 17 = 0 AND d.date IN ('2025-10-07','2025-10-14') THEN 'absent'
    WHEN s.id % 19 = 0 AND d.date = '2025-10-09' THEN 'retard'
    WHEN s.id % 23 = 0 AND d.date = '2025-10-13' THEN 'congé'
    ELSE 'présent'
  END
FROM students s
CROSS JOIN (
  SELECT '2025-10-06' AS date UNION ALL SELECT '2025-10-07' UNION ALL
  SELECT '2025-10-08' UNION ALL SELECT '2025-10-09' UNION ALL
  SELECT '2025-10-10' UNION ALL SELECT '2025-10-13' UNION ALL
  SELECT '2025-10-14' UNION ALL SELECT '2025-10-15' UNION ALL
  SELECT '2025-10-16' UNION ALL SELECT '2025-10-17'
) d
WHERE s.status = 'Actif' AND s.id > 1;

-- =============================================================================
-- 14. PRÉSENCES ENSEIGNANTS (2 semaines)
-- =============================================================================
INSERT OR IGNORE INTO teacher_attendance (teacher_id, date, status)
SELECT t.id, d.date,
  CASE
    WHEN t.id = 2 AND d.date = '2025-10-08' THEN 'absent'
    WHEN t.id = 5 AND d.date = '2025-10-14' THEN 'retard'
    WHEN t.id = 7 AND d.date = '2025-10-13' THEN 'absent'
    ELSE 'present'
  END
FROM teachers t
CROSS JOIN (
  SELECT '2025-10-06' AS date UNION ALL SELECT '2025-10-07' UNION ALL
  SELECT '2025-10-08' UNION ALL SELECT '2025-10-09' UNION ALL
  SELECT '2025-10-10' UNION ALL SELECT '2025-10-13' UNION ALL
  SELECT '2025-10-14' UNION ALL SELECT '2025-10-15' UNION ALL
  SELECT '2025-10-16' UNION ALL SELECT '2025-10-17'
) d
WHERE t.id > 1;

-- =============================================================================
-- 15. ÉVALUATIONS (1 Devoir + 1 Trimestrielle par matière, Trimestre 1)
-- =============================================================================
-- Unicité garantie par uniqueIndex("eval_unique_period") sur (classId,subjectId,trimester,type)
-- → 1 devoir + 1 trimestrielle par (classe, matière, trimestre)

-- === DEVOIR T1 ===
-- 1ère→3ème : 7 matières
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Devoir T1 - ' || s.name, 'devoir', c.id, s.id, 1, ay.id, '2025-11-10', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name IN ('1ère Année','2ème Année','3ème Année') AND s.code IN ('FRAN','MATH','SDO','HG','ECM','EPS','ARTS') AND ay.is_current = 1;

-- 4ème→6ème : 8 matières (avec ANGL)
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Devoir T1 - ' || s.name, 'devoir', c.id, s.id, 1, ay.id, '2025-11-10', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name IN ('4ème Année','5ème Année','6ème Année') AND s.code IN ('FRAN','MATH','ANGL','SDO','HG','ECM','EPS','ARTS') AND ay.is_current = 1;

-- 7ème→9ème : 9 matières (PHCH, SVT)
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Devoir T1 - ' || s.name, 'devoir', c.id, s.id, 1, ay.id, '2025-11-10', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name IN ('7ème Année','8ème Année','9ème Année') AND s.code IN ('FRAN','MATH','ANGL','HG','PHCH','SVT','ECM','EPS','ARTS') AND ay.is_current = 1;
-- 9ème Année : matières supplémentaires (TIC, ALLEMAND, TECHNO, ARABE)
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Devoir T1 - ' || s.name, 'devoir', c.id, s.id, 1, ay.id, '2025-11-10', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name = '9ème Année' AND s.code IN ('TIC','ALLEMAND','TECHNO','ARABE') AND ay.is_current = 1;

-- === TRIMESTRIELLE T1 ===
-- 1ère→3ème
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Trimestre T1 - ' || s.name, 'trimestrielle', c.id, s.id, 1, ay.id, '2025-12-15', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name IN ('1ère Année','2ème Année','3ème Année') AND s.code IN ('FRAN','MATH','SDO','HG','ECM','EPS','ARTS') AND ay.is_current = 1;

-- 4ème→6ème
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Trimestre T1 - ' || s.name, 'trimestrielle', c.id, s.id, 1, ay.id, '2025-12-15', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name IN ('4ème Année','5ème Année','6ème Année') AND s.code IN ('FRAN','MATH','ANGL','SDO','HG','ECM','EPS','ARTS') AND ay.is_current = 1;

-- 7ème→9ème
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Trimestre T1 - ' || s.name, 'trimestrielle', c.id, s.id, 1, ay.id, '2025-12-15', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name IN ('7ème Année','8ème Année','9ème Année') AND s.code IN ('FRAN','MATH','ANGL','HG','PHCH','SVT','ECM','EPS','ARTS') AND ay.is_current = 1;
-- 9ème Année : matières supplémentaires
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Trimestre T1 - ' || s.name, 'trimestrielle', c.id, s.id, 1, ay.id, '2025-12-15', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name = '9ème Année' AND s.code IN ('TIC','ALLEMAND','TECHNO','ARABE') AND ay.is_current = 1;

-- =============================================================================
-- 15b. ÉVALUATIONS - Trimestre 2
-- =============================================================================

-- === DEVOIR T2, 1ère→3ème ===
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Devoir T2 - ' || s.name, 'devoir', c.id, s.id, 2, ay.id, '2026-02-10', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name IN ('1ère Année','2ème Année','3ème Année') AND s.code IN ('FRAN','MATH','SDO','HG','ECM','EPS','ARTS') AND ay.is_current = 1;

-- 4ème→6ème
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Devoir T2 - ' || s.name, 'devoir', c.id, s.id, 2, ay.id, '2026-02-10', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name IN ('4ème Année','5ème Année','6ème Année') AND s.code IN ('FRAN','MATH','ANGL','SDO','HG','ECM','EPS','ARTS') AND ay.is_current = 1;

-- 7ème→9ème
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Devoir T2 - ' || s.name, 'devoir', c.id, s.id, 2, ay.id, '2026-02-10', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name IN ('7ème Année','8ème Année','9ème Année') AND s.code IN ('FRAN','MATH','ANGL','HG','PHCH','SVT','ECM','EPS','ARTS') AND ay.is_current = 1;
-- 9ème Année : matières supplémentaires
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Devoir T2 - ' || s.name, 'devoir', c.id, s.id, 2, ay.id, '2026-02-10', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name = '9ème Année' AND s.code IN ('TIC','ALLEMAND','TECHNO','ARABE') AND ay.is_current = 1;

-- === TRIMESTRIELLE T2, 1ère→3ème ===
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Trimestre T2 - ' || s.name, 'trimestrielle', c.id, s.id, 2, ay.id, '2026-03-15', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name IN ('1ère Année','2ème Année','3ème Année') AND s.code IN ('FRAN','MATH','SDO','HG','ECM','EPS','ARTS') AND ay.is_current = 1;

-- 4ème→6ème
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Trimestre T2 - ' || s.name, 'trimestrielle', c.id, s.id, 2, ay.id, '2026-03-15', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name IN ('4ème Année','5ème Année','6ème Année') AND s.code IN ('FRAN','MATH','ANGL','SDO','HG','ECM','EPS','ARTS') AND ay.is_current = 1;

-- 7ème→9ème
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Trimestre T2 - ' || s.name, 'trimestrielle', c.id, s.id, 2, ay.id, '2026-03-15', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name IN ('7ème Année','8ème Année','9ème Année') AND s.code IN ('FRAN','MATH','ANGL','HG','PHCH','SVT','ECM','EPS','ARTS') AND ay.is_current = 1;
-- 9ème Année : matières supplémentaires
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Trimestre T2 - ' || s.name, 'trimestrielle', c.id, s.id, 2, ay.id, '2026-03-15', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name = '9ème Année' AND s.code IN ('TIC','ALLEMAND','TECHNO','ARABE') AND ay.is_current = 1;

-- =============================================================================
-- 15c. ÉVALUATIONS - Trimestre 3 (sauf 8ème Année)
-- =============================================================================

-- === DEVOIR T3, 1ère→3ème ===
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Devoir T3 - ' || s.name, 'devoir', c.id, s.id, 3, ay.id, '2026-04-10', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name IN ('1ère Année','2ème Année','3ème Année') AND s.code IN ('FRAN','MATH','SDO','HG','ECM','EPS','ARTS') AND ay.is_current = 1;

-- 4ème→6ème
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Devoir T3 - ' || s.name, 'devoir', c.id, s.id, 3, ay.id, '2026-04-10', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name IN ('4ème Année','5ème Année','6ème Année') AND s.code IN ('FRAN','MATH','ANGL','SDO','HG','ECM','EPS','ARTS') AND ay.is_current = 1;

-- 7ème→9ème (sauf 8ème Année)
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Devoir T3 - ' || s.name, 'devoir', c.id, s.id, 3, ay.id, '2026-04-10', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name IN ('7ème Année','9ème Année') AND s.code IN ('FRAN','MATH','ANGL','HG','PHCH','SVT','ECM','EPS','ARTS') AND ay.is_current = 1;
-- 9ème Année : matières supplémentaires
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Devoir T3 - ' || s.name, 'devoir', c.id, s.id, 3, ay.id, '2026-04-10', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name = '9ème Année' AND s.code IN ('TIC','ALLEMAND','TECHNO','ARABE') AND ay.is_current = 1;

-- === TRIMESTRIELLE T3, 1ère→3ème ===
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Trimestre T3 - ' || s.name, 'trimestrielle', c.id, s.id, 3, ay.id, '2026-06-01', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name IN ('1ère Année','2ème Année','3ème Année') AND s.code IN ('FRAN','MATH','SDO','HG','ECM','EPS','ARTS') AND ay.is_current = 1;

-- 4ème→6ème
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Trimestre T3 - ' || s.name, 'trimestrielle', c.id, s.id, 3, ay.id, '2026-06-01', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name IN ('4ème Année','5ème Année','6ème Année') AND s.code IN ('FRAN','MATH','ANGL','SDO','HG','ECM','EPS','ARTS') AND ay.is_current = 1;

-- 7ème→9ème (sauf 8ème Année)
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Trimestre T3 - ' || s.name, 'trimestrielle', c.id, s.id, 3, ay.id, '2026-06-01', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name IN ('7ème Année','9ème Année') AND s.code IN ('FRAN','MATH','ANGL','HG','PHCH','SVT','ECM','EPS','ARTS') AND ay.is_current = 1;
-- 9ème Année : matières supplémentaires
INSERT OR IGNORE INTO evaluations (name, type, class_id, subject_id, trimester, academic_year_id, date, status)
SELECT 'Trimestre T3 - ' || s.name, 'trimestrielle', c.id, s.id, 3, ay.id, '2026-06-01', 'published'
FROM classes c CROSS JOIN academic_years ay CROSS JOIN subjects s
WHERE c.name = '9ème Année' AND s.code IN ('TIC','ALLEMAND','TECHNO','ARABE') AND ay.is_current = 1;

-- =============================================================================
-- 16. NOTES (~2900)
-- =============================================================================
INSERT OR IGNORE INTO grades (evaluation_id, student_id, score, is_absent)
SELECT ev.id, s.id,
  ROUND(
    CASE
      WHEN s.id % 15 = 0 THEN 5 + ABS(RANDOM() % 6)        -- faibles
      WHEN s.id % 9 = 0 THEN 15 + ABS(RANDOM() % 5)         -- excellents
      ELSE 8 + ABS(RANDOM() % 10)                            -- moyens
    END, 1
  ),
  CASE WHEN s.id % 29 = 0 AND ev.id % 5 = 0 THEN 1 ELSE 0 END
FROM evaluations ev
JOIN classes c ON c.id = ev.class_id
JOIN students s ON s.class_id = c.id AND s.status = 'Actif' AND s.id > 1
WHERE NOT EXISTS (
  SELECT 1 FROM grades g WHERE g.evaluation_id = ev.id AND g.student_id = s.id
);

-- =============================================================================
-- 16b. NOTES - Trimestre 2
-- =============================================================================
INSERT OR IGNORE INTO grades (evaluation_id, student_id, score, is_absent)
SELECT ev.id, s.id,
  ROUND(
    CASE
      WHEN s.id % 15 = 0 THEN 5 + ABS(RANDOM() % 6)
      WHEN s.id % 9 = 0 THEN 15 + ABS(RANDOM() % 5)
      ELSE 8 + ABS(RANDOM() % 10)
    END, 1
  ),
  CASE WHEN s.id % 29 = 0 AND ev.id % 5 = 0 THEN 1 ELSE 0 END
FROM evaluations ev
JOIN classes c ON c.id = ev.class_id
JOIN students s ON s.class_id = c.id AND s.status = 'Actif' AND s.id > 1
WHERE ev.trimester = 2
  AND NOT EXISTS (
    SELECT 1 FROM grades g WHERE g.evaluation_id = ev.id AND g.student_id = s.id
  );

-- =============================================================================
-- 16c. NOTES - Trimestre 3 (aucune note pour 8ème Année — pas d'évaluations T3)
-- =============================================================================
INSERT OR IGNORE INTO grades (evaluation_id, student_id, score, is_absent)
SELECT ev.id, s.id,
  ROUND(
    CASE
      WHEN s.id % 15 = 0 THEN 5 + ABS(RANDOM() % 6)
      WHEN s.id % 9 = 0 THEN 15 + ABS(RANDOM() % 5)
      ELSE 8 + ABS(RANDOM() % 10)
    END, 1
  ),
  CASE WHEN s.id % 29 = 0 AND ev.id % 5 = 0 THEN 1 ELSE 0 END
FROM evaluations ev
JOIN classes c ON c.id = ev.class_id
JOIN students s ON s.class_id = c.id AND s.status = 'Actif' AND s.id > 1
WHERE ev.trimester = 3
  AND NOT EXISTS (
    SELECT 1 FROM grades g WHERE g.evaluation_id = ev.id AND g.student_id = s.id
  );

-- =============================================================================
-- 17. EMPLOI DU TEMPS (30 créneaux)
-- =============================================================================
INSERT OR IGNORE INTO schedules (class_id, academic_year_id, day, start_time, end_time, subject_id, teacher_id)
WITH d(day,start_time,end_time) AS (
  VALUES (0,'08:00','09:30'),(0,'09:45','11:15'),(0,'11:30','13:00'),
         (1,'08:00','09:30'),(1,'09:45','11:15'),(1,'11:30','13:00'),
         (2,'08:00','09:30'),(2,'09:45','11:15'),(2,'11:30','13:00'),
         (3,'08:00','09:30'),(3,'09:45','11:15'),(3,'11:30','13:00'),
         (4,'08:00','09:30'),(4,'09:45','11:15'),(4,'11:30','13:00')
)
SELECT c.id, ay.id, d.day, d.start_time, d.end_time, s.id, tch.id
FROM classes c
CROSS JOIN academic_years ay
CROSS JOIN d
LEFT JOIN subjects s ON s.code = CASE d.day
  WHEN 0 THEN 'MATH' WHEN 1 THEN 'FRAN' WHEN 2 THEN 'PHCH'
  WHEN 3 THEN 'HG' WHEN 4 THEN 'EPS'
END
LEFT JOIN teachers tch ON tch.id = CASE d.day
  WHEN 0 THEN 11 WHEN 1 THEN 12 WHEN 2 THEN 14 WHEN 3 THEN 8 WHEN 4 THEN 15
END
WHERE c.name = '7ème Année' AND ay.is_current = 1
  AND NOT EXISTS (SELECT 1 FROM schedules sc
                  WHERE sc.class_id = c.id AND sc.academic_year_id = ay.id
                    AND sc.day = d.day AND sc.start_time = d.start_time);

-- =============================================================================
-- 18. PAIE (15 profs × 8 mois = 120 fiches)
-- =============================================================================
INSERT OR IGNORE INTO payroll (teacher_id, month, year, amount, bonus, deductions, paid_at)
SELECT t.id, m.month, 2025,
  t.salary + COALESCE(b.bonus, 0),
  COALESCE(b.bonus, 0),
  CASE WHEN t.id % 4 = 0 THEN 5000 ELSE 0 END,
  '2025-' || SUBSTR('0' || CAST(m.month AS TEXT), -2, 2) || '-28'
FROM teachers t
CROSS JOIN (SELECT 10 AS month UNION ALL SELECT 11 UNION ALL SELECT 12) m
LEFT JOIN (
  SELECT 2 AS teacher_id, 25000 AS bonus
  UNION ALL SELECT 3, 20000
  UNION ALL SELECT 5, 15000
  UNION ALL SELECT 8, 30000
  UNION ALL SELECT 11, 20000
  UNION ALL SELECT 14, 15000
) b ON b.teacher_id = t.id
WHERE t.id > 1;

-- 2026 (jan-mai)
INSERT OR IGNORE INTO payroll (teacher_id, month, year, amount, bonus, deductions, paid_at)
SELECT t.id, m.month, 2026,
  t.salary + COALESCE(b.bonus, 0),
  COALESCE(b.bonus, 0),
  CASE WHEN t.id % 4 = 0 THEN 5000 ELSE 0 END,
  '2026-' || SUBSTR('0' || CAST(m.month AS TEXT), -2, 2) || '-28'
FROM teachers t
CROSS JOIN (SELECT 1 AS month UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5) m
LEFT JOIN (
  SELECT 2 AS teacher_id, 25000 AS bonus
  UNION ALL SELECT 3, 20000
  UNION ALL SELECT 5, 15000
  UNION ALL SELECT 8, 30000
  UNION ALL SELECT 11, 20000
  UNION ALL SELECT 14, 15000
) b ON b.teacher_id = t.id
WHERE t.id > 1;

-- =============================================================================
-- 19. DÉPENSES (50+)
-- =============================================================================
-- Eau (mensuel)
INSERT INTO expenses (description, amount, category, date, academic_year_id)
WITH m(mois,date) AS (
  VALUES ('Octobre 2025','2025-10-15'),('Novembre 2025','2025-11-15'),
         ('Décembre 2025','2025-12-15'),('Janvier 2026','2026-01-15'),
         ('Février 2026','2026-02-15'),('Mars 2026','2026-03-15')
)
SELECT 'Facture d''eau - ' || m.mois, 15000, 'eau', m.date, ay.id
FROM academic_years ay, m
WHERE ay.is_current = 1;

-- Électricité (mensuel)
INSERT INTO expenses (description, amount, category, date, academic_year_id)
WITH m(mois,date) AS (
  VALUES ('Octobre 2025','2025-10-20'),('Novembre 2025','2025-11-20'),
         ('Décembre 2025','2025-12-20'),('Janvier 2026','2026-01-20'),
         ('Février 2026','2026-02-20'),('Mars 2026','2026-03-20')
)
SELECT 'Facture d''électricité - ' || m.mois, 25000, 'electricite', m.date, ay.id
FROM academic_years ay, m
WHERE ay.is_current = 1;

-- Fournitures scolaires
INSERT INTO expenses (description, amount, category, date, academic_year_id)
VALUES
  ('Fournitures rentrée scolaire', 45000, 'fournitures', '2025-10-02', (SELECT id FROM academic_years WHERE is_current = 1)),
  ('Cahiers et stylos', 12000, 'fournitures', '2025-10-15', (SELECT id FROM academic_years WHERE is_current = 1)),
  ('Craies et tableaux', 8000, 'fournitures', '2025-11-05', (SELECT id FROM academic_years WHERE is_current = 1)),
  ('Manuels scolaires CM', 65000, 'fournitures', '2025-10-10', (SELECT id FROM academic_years WHERE is_current = 1)),
  ('Livres bibliothèque', 25000, 'fournitures', '2025-12-01', (SELECT id FROM academic_years WHERE is_current = 1)),
  ('Matériel sportif', 35000, 'equipement', '2025-10-25', (SELECT id FROM academic_years WHERE is_current = 1)),
  ('Réparation toiture', 75000, 'entretien', '2025-11-10', (SELECT id FROM academic_years WHERE is_current = 1)),
  ('Peinture classes', 50000, 'entretien', '2025-12-15', (SELECT id FROM academic_years WHERE is_current = 1)),
  ('Entretien jardin', 10000, 'entretien', '2026-01-05', (SELECT id FROM academic_years WHERE is_current = 1)),
  ('Plomberie', 22000, 'entretien', '2026-02-10', (SELECT id FROM academic_years WHERE is_current = 1));

-- Transport
INSERT INTO expenses (description, amount, category, date, academic_year_id)
WITH m(mois,date) AS (
  VALUES ('Octobre','2025-10-30'),('Novembre','2025-11-28'),
         ('Décembre','2025-12-22'),('Janvier','2026-01-30')
)
SELECT 'Transport ramassage - ' || m.mois, 20000, 'transport', m.date, ay.id
FROM academic_years ay, m
WHERE ay.is_current = 1;

-- Équipement
INSERT INTO expenses (description, amount, category, date, academic_year_id)
VALUES
  ('Tables-bancs (10)', 150000, 'equipement', '2025-10-05', (SELECT id FROM academic_years WHERE is_current = 1)),
  ('Ordinateur administratif', 250000, 'equipement', '2025-11-20', (SELECT id FROM academic_years WHERE is_current = 1)),
  ('Imprimante', 85000, 'equipement', '2025-12-10', (SELECT id FROM academic_years WHERE is_current = 1));

-- Autres dépenses
INSERT INTO expenses (description, amount, category, date, academic_year_id)
VALUES
  ('Frais bancaires', 5000, 'autres', '2025-10-28', (SELECT id FROM academic_years WHERE is_current = 1)),
  ('Abonnement internet', 15000, 'autres', '2025-11-01', (SELECT id FROM academic_years WHERE is_current = 1)),
  ('Frais de téléphone', 8000, 'autres', '2025-11-15', (SELECT id FROM academic_years WHERE is_current = 1)),
  ('Fournitures bureau', 7000, 'fournitures', '2025-12-05', (SELECT id FROM academic_years WHERE is_current = 1)),
  ('Réparation photocopieur', 18000, 'entretien', '2026-01-12', (SELECT id FROM academic_years WHERE is_current = 1)),
  ('Vetements', 9500, 'autres', '2026-02-20', (SELECT id FROM academic_years WHERE is_current = 1)),
  ('Fête scolaire', 30000, 'autres', '2025-12-18', (SELECT id FROM academic_years WHERE is_current = 1)),
  ('Produits entretien', 12000, 'fournitures', '2026-03-01', (SELECT id FROM academic_years WHERE is_current = 1));

-- =============================================================================
-- 20. INFOS MÉDICALES
-- =============================================================================
INSERT INTO medical_infos (student_id, blood_type, allergies, doctor_phone, vaccination_status)
SELECT s.id,
  CASE CAST(s.id % 5 AS INTEGER)
    WHEN 0 THEN 'A+' WHEN 1 THEN 'O+' WHEN 2 THEN 'B+' WHEN 3 THEN 'AB+' ELSE 'A-'
  END,
  CASE WHEN s.id % 11 = 0 THEN 'Poussière, pollen' ELSE NULL END,
  '76543210',
  CASE WHEN s.id % 3 = 0 THEN 'À jour' ELSE 'Partiel' END
FROM students s WHERE s.status = 'Actif' AND s.id > 1;

-- =============================================================================
-- 21. INFOS FAMILIALES
-- =============================================================================
INSERT INTO family_infos (student_id, father_name, father_phone, mother_name, mother_phone, guardian_name, guardian_phone)
SELECT s.id,
  CASE WHEN s.id % 3 = 0 THEN SUBSTR(s.parent_name, 1, INSTR(s.parent_name, ' ') - 1) ELSE SUBSTR(s.parent_name, INSTR(s.parent_name, ' ') + 1) END,
  s.parent_phone,
  'Mme ' || SUBSTR(s.parent_name, INSTR(s.parent_name, ' ') + 1),
  CAST(70000000 + s.id AS TEXT),
  NULL, NULL
FROM students s WHERE s.status = 'Actif' AND s.id > 1;

-- =============================================================================
-- 22. ÉVÉNEMENTS SCOLAIRES
-- =============================================================================
INSERT INTO school_events (title, description, type, start_date, end_date, all_day, color)
VALUES
  ('Rentrée scolaire 2025-2026', 'Début de l''année scolaire', 'event', '2025-10-01', '2025-10-01', 1, '#22c55e'),
  ('Vacances de Noël', 'Vacances de fin d''année', 'holiday', '2025-12-22', '2026-01-05', 1, '#ef4444'),
  ('Réunion parents-profs T1', 'Premier trimestre', 'meeting', '2025-12-15', '2025-12-15', 1, '#3b82f6'),
  ('Examen trimestre 1', 'Évaluations du premier trimestre', 'exam', '2025-12-08', '2025-12-19', 1, '#a855f7'),
  ('Journée sportive', 'Compétitions inter-classes', 'event', '2026-02-15', '2026-02-15', 1, '#f97316'),
  ('Vacances de Pâques', '', 'holiday', '2026-04-06', '2026-04-13', 1, '#ef4444'),
  ('Remise des bulletins T2', '', 'meeting', '2026-03-30', '2026-03-30', 1, '#3b82f6'),
  ('Fin d''année scolaire', 'Cérémonie de clôture', 'event', '2026-06-30', '2026-06-30', 1, '#22c55e');

-- =============================================================================
-- 23. TEACHER_SUBJECTS — complément pour l'enseignant existant
-- =============================================================================
INSERT OR IGNORE INTO teacher_subjects (teacher_id, subject_id)
SELECT 1, id FROM subjects WHERE code = 'ANGL';  -- Fatoumataa test → Anglais

-- =============================================================================
-- FIN
-- =============================================================================
COMMIT;

.print '✅ Script terminé avec succès !'
.print '📊 Résumé :'
SELECT COUNT(*) || ' classes' AS result FROM classes;
SELECT COUNT(*) || ' élèves' AS result FROM students;
SELECT COUNT(*) || ' enseignants' AS result FROM teachers;
SELECT COUNT(*) || ' matières' AS result FROM subjects;
SELECT COUNT(*) || ' paiements' AS result FROM payments;
SELECT COUNT(*) || ' présences élèves' AS result FROM attendance;
SELECT COUNT(*) || ' présences enseignants' AS result FROM teacher_attendance;
SELECT COUNT(*) || ' évaluations' AS result FROM evaluations;
SELECT COUNT(*) || ' notes' AS result FROM grades;
SELECT COUNT(*) || ' fiches de paie' AS result FROM payroll;
SELECT COUNT(*) || ' dépenses' AS result FROM expenses;
SELECT COUNT(*) || ' événements' AS result FROM school_events;
SELECT COUNT(*) || ' infos médicales' AS result FROM medical_infos;
SELECT COUNT(*) || ' infos familiales' AS result FROM family_infos;
