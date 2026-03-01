export const muscleGroups = [
  { id: "chest", name: "Chest" },
  { id: "back", name: "Back" },
  { id: "legs", name: "Legs" },
  { id: "shoulders", name: "Shoulders" },
  { id: "arms", name: "Arms" },
  { id: "core", name: "Core" },
];

type ExerciseSeed = {
  name: string;
  primary: string;
  secondary?: string;
};

export const exercises = [
  { name: "Bench Press", primary: "chest", secondary: "arms" },
  { name: "Incline Bench Press", primary: "chest", secondary: "shoulders" },
  { name: "Dumbbell Bench Press", primary: "chest", secondary: "arms" },
  { name: "Push-Up", primary: "chest", secondary: "arms" },
  { name: "Chest Fly", primary: "chest" },

  { name: "Pull-Up", primary: "back", secondary: "arms" },
  { name: "Lat Pulldown", primary: "back", secondary: "arms" },
  { name: "Barbell Row", primary: "back", secondary: "arms" },
  { name: "Seated Cable Row", primary: "back", secondary: "arms" },
  { name: "Deadlift", primary: "back", secondary: "legs" },

  { name: "Back Squat", primary: "legs", secondary: "core" },
  { name: "Front Squat", primary: "legs", secondary: "core" },
  { name: "Leg Press", primary: "legs" },
  { name: "Romanian Deadlift", primary: "legs", secondary: "back" },
  { name: "Walking Lunge", primary: "legs", secondary: "core" },
  { name: "Leg Curl", primary: "legs" },
  { name: "Leg Extension", primary: "legs" },
  { name: "Calf Raise", primary: "legs" },

  { name: "Overhead Press", primary: "shoulders", secondary: "arms" },
  { name: "Dumbbell Shoulder Press", primary: "shoulders", secondary: "arms" },
  { name: "Lateral Raise", primary: "shoulders" },
  { name: "Rear Delt Fly", primary: "shoulders", secondary: "back" },
  { name: "Face Pull", primary: "shoulders", secondary: "back" },

  { name: "Barbell Curl", primary: "arms" },
  { name: "Hammer Curl", primary: "arms" },
  { name: "Triceps Pushdown", primary: "arms" },
  { name: "Skull Crushers", primary: "arms" },
  { name: "Dips", primary: "arms", secondary: "chest" },

  { name: "Plank", primary: "core" },
  { name: "Hanging Leg Raise", primary: "core" },
  { name: "Cable Crunch", primary: "core" },
  { name: "Russian Twist", primary: "core" },
] satisfies ReadonlyArray<ExerciseSeed>;