CREATE TABLE cases (
 id TEXT PRIMARY KEY, title TEXT NOT NULL, specialty TEXT NOT NULL, category TEXT NOT NULL,
 modality TEXT NOT NULL, region TEXT NOT NULL, difficulty TEXT NOT NULL,
 objectives TEXT NOT NULL, clinical_description TEXT NOT NULL, study_uid TEXT NOT NULL UNIQUE,
 bibliography TEXT NOT NULL, explanation TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('draft','published')),
 annotations TEXT NOT NULL DEFAULT '[]', adapter_version INTEGER NOT NULL DEFAULT 1,
 neuroscan_challenge_id INTEGER
);
CREATE TABLE questions (
 id TEXT PRIMARY KEY, case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
 kind TEXT NOT NULL, prompt TEXT NOT NULL, options TEXT NOT NULL, answer INTEGER NOT NULL,
 explanation TEXT NOT NULL, source TEXT NOT NULL, difficulty TEXT NOT NULL
);
CREATE TABLE enrollments (
 user_id TEXT NOT NULL, case_id TEXT NOT NULL REFERENCES cases(id), PRIMARY KEY(user_id,case_id)
);
CREATE TABLE attempts (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL, case_id TEXT NOT NULL, question_id TEXT NOT NULL,
 mode TEXT NOT NULL, selected INTEGER NOT NULL, correct INTEGER NOT NULL, score INTEGER NOT NULL,
 created_at INTEGER NOT NULL
);
CREATE INDEX idx_attempts_user ON attempts(user_id,case_id,created_at);
CREATE TABLE review_cards (
 user_id TEXT NOT NULL, question_id TEXT NOT NULL, streak INTEGER NOT NULL, interval_days INTEGER NOT NULL,
 due_at INTEGER NOT NULL, reviews INTEGER NOT NULL, PRIMARY KEY(user_id,question_id)
);
INSERT INTO cases VALUES (
 'GPA-NEURO-001','Orientación en TC craneal sintética','Neurorradiología','Neuroimágenes',
 'CT','Cráneo','Básica','["Reconocer el plano axial","Navegar una serie DICOM","Identificar la orientación izquierda-derecha"]',
 'Estudio sintético de cráneo sin datos de pacientes. Explore la serie y determine su orientación.',
 '1.2.826.0.1.3680043.10.543.20261105.1',
 'NEURO//SCAN, módulo 1, desafío 4; DICOM PS3.3',
 'La serie está ordenada a lo largo del eje superior-inferior. Las marcas de orientación del visor son la referencia final.',
 'published','[{"label":"Plano axial","description":"Observe la simetría y la variación entre cortes."}]',1,4
);
INSERT INTO questions VALUES (
 'GPA-Q-001','GPA-NEURO-001','multiple_choice',
 'Al recorrer cortes axiales desde la convexidad hacia la base, ¿qué relación describe mejor el movimiento?',
 '["De superior a inferior","De anterior a posterior","De lateral a medial","De posterior a anterior"]',0,
 'Los cortes axiales se ordenan a lo largo del eje superior-inferior. El visor puede invertir el sentido de navegación: atienda a las marcas.',
 'NEURO//SCAN, desafío 4; Neuroanatomía, diap. 13–14','Básica'
);
