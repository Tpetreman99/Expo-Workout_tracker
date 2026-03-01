📱 Expo Workout Tracker

A mobile workout tracking app built with React Native (Expo) and SQLite.

This project allows users to create workout sessions, add exercises, log sets, and track completed workouts through a history view.

⸻

🚀 Features

Workout Sessions
	•	Create a new workout session
	•	Select focus muscle groups
	•	Add exercises to a session

Exercise Logging
	•	Log sets with:
	•	Reps
	•	Weight (kg)
	•	Automatic set numbering
	•	Sets displayed inline on the session screen

Finish Workflow
	•	Mark workout as finished
	•	Persist completion timestamp
	•	Automatically move completed workouts to History

History View
	•	Displays completed workouts only
	•	Ordered by most recent
	•	Navigate back to session detail

⸻

🛠 Tech Stack
	•	Expo Router
	•	React Native
	•	TypeScript
	•	expo-sqlite
	•	Local SQLite database with lightweight migrations

⸻

🧠 Database Design

Core tables:
	•	workout_session
	•	session_exercise
	•	exercise
	•	set_entry
	•	muscle_group

Design decisions:
	•	Soft deletes using deletedAt
	•	Automatic setNumber incrementing
	•	Local-first data architecture
	•	Inline session set loading via SQL JOIN queries

⸻

💻 Development Setup

Clone the repository:

git clone https://github.com/Tpetreman99/Expo-Workout_tracker.git
cd Expo-Workout_tracker
npm install
npx expo start

⸻

📈 Roadmap

Planned improvements:
	•	Unit toggle (kg ↔ lb)
	•	Workout templates
	•	Personal record tracking
	•	Volume tracking
	•	Session summary screen
	•	Cloud sync
	•	Authentication

⸻

🎯 Purpose

This project was built to:
	•	Practice React Native + Expo Router
	•	Implement relational data modeling with SQLite
	•	Build a scalable workout tracking architecture
	•	Apply real-world state and data flow patterns

⸻

👤 Author

Tanner Petreman
GitHub: https://github.com/Tpetreman99
