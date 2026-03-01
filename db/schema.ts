export const schemaSql = `
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  unitSystem TEXT NOT NULL CHECK (unitSystem IN ('kg','lb')),
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS muscle_group (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS exercise (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  primaryMuscleGroupId TEXT NOT NULL,
  secondaryMuscleGroupId TEXT,
  isCustom INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  deletedAt TEXT,
  dirty INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (primaryMuscleGroupId) REFERENCES muscle_group(id),
  FOREIGN KEY (secondaryMuscleGroupId) REFERENCES muscle_group(id)
);

CREATE TABLE IF NOT EXISTS workout_session (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  notes TEXT,
  focusMuscleGroupIds TEXT NOT NULL DEFAULT '[]',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  finishedAt TEXT,
  deletedAt TEXT,
  dirty INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS session_exercise (
  id TEXT PRIMARY KEY,
  sessionId TEXT NOT NULL,
  exerciseId TEXT NOT NULL,
  orderIndex INTEGER NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  deletedAt TEXT,
  dirty INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (sessionId) REFERENCES workout_session(id),
  FOREIGN KEY (exerciseId) REFERENCES exercise(id)
);

CREATE TABLE IF NOT EXISTS set_entry (
  id TEXT PRIMARY KEY,
  sessionExerciseId TEXT NOT NULL,
  setNumber INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weightKg REAL NOT NULL,
  isWarmup INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  deletedAt TEXT,
  dirty INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (sessionExerciseId) REFERENCES session_exercise(id)
);

CREATE INDEX IF NOT EXISTS idx_session_date ON workout_session(date);
CREATE INDEX IF NOT EXISTS idx_session_exercise_session ON session_exercise(sessionId);
CREATE INDEX IF NOT EXISTS idx_set_entry_session_ex ON set_entry(sessionExerciseId);
CREATE INDEX IF NOT EXISTS idx_exercise_primary_muscle ON exercise(primaryMuscleGroupId);
`;