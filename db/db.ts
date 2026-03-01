import * as SQLite from "expo-sqlite";
import { schemaSql } from "./schema";
import { muscleGroups, exercises } from "../seed/seedData";
import * as Crypto from "expo-crypto";

export const db = SQLite.openDatabaseSync("workouts.db");

function nowIso() {
  return new Date().toISOString();
}

function uuid() {
  return Crypto.randomUUID();
}

export function initDb() {
  db.execSync(schemaSql);

  // --- Lightweight migration: add finishedAt to workout_session if missing ---
  try {
    const cols = db.getAllSync<{ name: string }>(
      "PRAGMA table_info(workout_session);"
    );
    const hasFinishedAt = (cols ?? []).some((c) => c.name === "finishedAt");
    if (!hasFinishedAt) {
      db.runSync("ALTER TABLE workout_session ADD COLUMN finishedAt TEXT;");
    }
  } catch (e) {
    // If the table doesn't exist yet, schemaSql will create it; ignore.
  }

  // Ensure settings row exists
  const existing = db.getFirstSync<{ c: number }>(
    "SELECT COUNT(*) as c FROM settings WHERE id = 1;"
  );
  if (!existing || existing.c === 0) {
    const t = nowIso();
    db.runSync(
      "INSERT INTO settings (id, unitSystem, createdAt, updatedAt) VALUES (1, ?, ?, ?);",
      ["lb", t, t]
    );
  }

  // Seed muscle groups (idempotent)
  for (const mg of muscleGroups) {
    db.runSync(
      "INSERT OR IGNORE INTO muscle_group (id, name) VALUES (?, ?);",
      [mg.id, mg.name]
    );
  }

  // Seed exercises (idempotent-ish by name; for MVP this is fine)
  for (const ex of exercises) {
    const t = nowIso();
    const id = uuid();
    db.runSync(
      `INSERT OR IGNORE INTO exercise
        (id, name, primaryMuscleGroupId, secondaryMuscleGroupId, isCustom, createdAt, updatedAt, dirty)
       VALUES (?, ?, ?, ?, 0, ?, ?, 0);`,
      [id, ex.name, ex.primary, ex.secondary ?? null, t, t]
    );
  }
}

export function getUnitSystem(): "kg" | "lb" {
  const row = db.getFirstSync<{ unitSystem: "kg" | "lb" }>(
    "SELECT unitSystem FROM settings WHERE id = 1;"
  );
  return row?.unitSystem ?? "lb";
}

export function setUnitSystem(unit: "kg" | "lb") {
  const t = nowIso();
  db.runSync("UPDATE settings SET unitSystem = ?, updatedAt = ? WHERE id = 1;", [
    unit,
    t,
  ]);
}


export function createSession(focusMuscleGroupIds: string[]) {
  const id = uuid();
  const t = nowIso();

  db.runSync(
    `INSERT INTO workout_session
      (id, date, notes, focusMuscleGroupIds, createdAt, updatedAt, dirty)
     VALUES (?, ?, NULL, ?, ?, ?, 0);`,
    [id, t, JSON.stringify(focusMuscleGroupIds), t, t]
  );

  return id;
}

export function addExerciseToSession(sessionId: string, exerciseId: string) {
  const id = uuid();
  const t = nowIso();

  const row = db.getFirstSync<{ c: number }>(
    "SELECT COUNT(*) as c FROM session_exercise WHERE sessionId = ? AND deletedAt IS NULL;",
    [sessionId]
  );

  const orderIndex = row?.c ?? 0;

  db.runSync(
    `INSERT INTO session_exercise
      (id, sessionId, exerciseId, orderIndex, createdAt, updatedAt, dirty)
     VALUES (?, ?, ?, ?, ?, ?, 0);`,
    [id, sessionId, exerciseId, orderIndex, t, t]
  );

  return id;
}

export type SessionExerciseWithName = {
  sessionExerciseId: string;
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
};

export type SetEntryRow = {
  id: string;
  sessionExerciseId: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  isWarmup: number;
  createdAt: string;
};

export type SessionSetRow = {
  sessionExerciseId: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  isWarmup: number;
};

export function listSetsForSession(sessionId: string) {
  return (
    db.getAllSync<SessionSetRow>(
      `SELECT se.id as sessionExerciseId,
              s.setNumber as setNumber,
              s.reps as reps,
              s.weightKg as weightKg,
              s.isWarmup as isWarmup
       FROM session_exercise se
       JOIN set_entry s ON s.sessionExerciseId = se.id
       WHERE se.sessionId = ?
         AND se.deletedAt IS NULL
         AND s.deletedAt IS NULL
       ORDER BY se.orderIndex ASC, s.setNumber ASC;`,
      [sessionId]
    ) ?? []
  );
}

export function getSessionExerciseWithName(sessionExerciseId: string) {
  return db.getFirstSync<SessionExerciseWithName>(
    `SELECT se.id as sessionExerciseId,
            se.sessionId as sessionId,
            se.exerciseId as exerciseId,
            e.name as exerciseName
     FROM session_exercise se
     JOIN exercise e ON e.id = se.exerciseId
     WHERE se.id = ? AND se.deletedAt IS NULL;`,
    [sessionExerciseId]
  );
}

export function listSetsForSessionExercise(sessionExerciseId: string) {
  return (
    db.getAllSync<SetEntryRow>(
      `SELECT id,
              sessionExerciseId,
              setNumber,
              reps,
              weightKg,
              isWarmup,
              createdAt
       FROM set_entry
       WHERE sessionExerciseId = ? AND deletedAt IS NULL
       ORDER BY setNumber ASC;`,
      [sessionExerciseId]
    ) ?? []
  );
}

export function addSetEntry(args: {
  sessionExerciseId: string;
  reps: number;
  weightKg: number;
}) {
  const id = uuid();
  const t = nowIso();

  // determine next set number
  const row = db.getFirstSync<{ c: number }>(
    "SELECT COUNT(*) as c FROM set_entry WHERE sessionExerciseId = ? AND deletedAt IS NULL;",
    [args.sessionExerciseId]
  );

  const setNumber = (row?.c ?? 0) + 1;

  db.runSync(
    `INSERT INTO set_entry
      (id, sessionExerciseId, setNumber, reps, weightKg, isWarmup, createdAt, updatedAt, dirty)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?, 0);`,
    [id, args.sessionExerciseId, setNumber, args.reps, args.weightKg, t, t]
  );

  return id;
}