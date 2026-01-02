import admin from 'firebase-admin';
import { StatusEnum } from '../app/_shared/models';
import * as path from 'path';
import * as fs from 'fs';

// Initialize Firebase Admin for seeding
const serviceAccountPath = path.join(__dirname, '../../.firebase/serviceAccountKey.json');

let app: admin.app.App;

if (process.env.FIRESTORE_EMULATOR_HOST) {
  // Use emulator
  console.log(`🔧 Using Firestore Emulator: ${process.env.FIRESTORE_EMULATOR_HOST}`);
  app = admin.apps.length
    ? admin.app()
    : admin.initializeApp({
        projectId: 'easyworkouttrack',
      });
} else if (fs.existsSync(serviceAccountPath)) {
  // Use service account key
  console.log('🔑 Using service account key from .firebase/serviceAccountKey.json');
  const serviceAccount = require(serviceAccountPath);
  app = admin.apps.length
    ? admin.app()
    : admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
} else {
  console.error('❌ Error: Service account key not found!');
  console.error(`   Expected location: ${serviceAccountPath}`);
  console.error('\n📋 To fix this:');
  console.error('   1. Go to Firebase Console: https://console.firebase.google.com/');
  console.error('   2. Select project: easyworkouttrack');
  console.error('   3. Go to Project Settings → Service Accounts');
  console.error('   4. Click "Generate new private key"');
  console.error('   5. Save as: functions\\.firebase\\serviceAccountKey.json\n');
  process.exit(1);
}

const db = app.firestore();

// Mock workout data for seeding
const SEED_WORKOUTS = [
  {
    name: 'Push Day A',
    exercises: [
      {
        id: '1',
        name: 'Bench Press',
        sets: [
          { id: '1', weight: 60, reps: 8, status: StatusEnum.Completed },
          { id: '2', weight: 65, reps: 6, status: StatusEnum.Completed },
          { id: '3', weight: 70, reps: 5, status: StatusEnum.Completed },
          { id: '4', weight: 70, reps: 5, status: StatusEnum.Completed },
        ],
      },
      {
        id: '2',
        name: 'Overhead Press',
        sets: [
          { id: '1', weight: 40, reps: 10, status: StatusEnum.Completed },
          { id: '2', weight: 42, reps: 8, status: StatusEnum.Active },
          { id: '3', weight: 42, reps: 8, status: StatusEnum.Pending },
        ],
      },
      {
        id: '3',
        name: 'Incline Dumbbell Press',
        sets: [
          { id: '1', weight: 22, reps: 12, status: StatusEnum.Pending },
          { id: '2', weight: 22, reps: 10, status: StatusEnum.Pending },
          { id: '3', weight: 22, reps: 10, status: StatusEnum.Pending },
        ],
      },
      {
        id: '4',
        name: 'Tricep Pushdowns',
        sets: [
          { id: '1', weight: 25, reps: 15, status: StatusEnum.Active },
          { id: '2', weight: 27, reps: 12, status: StatusEnum.Pending },
          { id: '3', weight: 30, reps: 10, status: StatusEnum.Pending },
        ],
      },
      {
        id: '5',
        name: 'Push-ups',
        sets: [
          { id: '1', weight: null, reps: 20, status: StatusEnum.Pending },
          { id: '2', weight: null, reps: 15, status: StatusEnum.Pending },
          { id: '3', weight: null, reps: 12, status: StatusEnum.Pending },
        ],
      },
    ],
  },
  {
    name: 'Pull Day A',
    exercises: [
      {
        id: '1',
        name: 'Deadlift',
        sets: [
          { id: '1', weight: 100, reps: 5, status: StatusEnum.Pending },
          { id: '2', weight: 110, reps: 5, status: StatusEnum.Pending },
          { id: '3', weight: 120, reps: 3, status: StatusEnum.Pending },
        ],
      },
      {
        id: '2',
        name: 'Pull-ups',
        sets: [
          { id: '1', weight: null, reps: 10, status: StatusEnum.Pending },
          { id: '2', weight: null, reps: 8, status: StatusEnum.Pending },
          { id: '3', weight: null, reps: 6, status: StatusEnum.Pending },
        ],
      },
      {
        id: '3',
        name: 'Barbell Rows',
        sets: [
          { id: '1', weight: 60, reps: 8, status: StatusEnum.Pending },
          { id: '2', weight: 65, reps: 8, status: StatusEnum.Pending },
          { id: '3', weight: 65, reps: 8, status: StatusEnum.Pending },
        ],
      },
    ],
  },
  {
    name: 'Leg Day A',
    exercises: [
      {
        id: '1',
        name: 'Squats',
        sets: [
          { id: '1', weight: 80, reps: 8, status: StatusEnum.Pending },
          { id: '2', weight: 90, reps: 6, status: StatusEnum.Pending },
          { id: '3', weight: 100, reps: 5, status: StatusEnum.Pending },
          { id: '4', weight: 100, reps: 5, status: StatusEnum.Pending },
        ],
      },
      {
        id: '2',
        name: 'Leg Press',
        sets: [
          { id: '1', weight: 120, reps: 12, status: StatusEnum.Pending },
          { id: '2', weight: 140, reps: 10, status: StatusEnum.Pending },
          { id: '3', weight: 150, reps: 8, status: StatusEnum.Pending },
        ],
      },
      {
        id: '3',
        name: 'Leg Curls',
        sets: [
          { id: '1', weight: 40, reps: 12, status: StatusEnum.Pending },
          { id: '2', weight: 45, reps: 10, status: StatusEnum.Pending },
          { id: '3', weight: 45, reps: 10, status: StatusEnum.Pending },
        ],
      },
    ],
  },
];

async function seedWorkouts() {
  console.log('Starting workout seeding...');

  try {
    const workoutsCollection = db.collection('workouts');

    // Clear existing workouts (optional - comment out if you want to keep existing data)
    const existingWorkouts = await workoutsCollection.get();
    console.log(`Found ${existingWorkouts.size} existing workouts`);

    // Uncomment to delete existing workouts before seeding
    // const deletePromises = existingWorkouts.docs.map((doc) => doc.ref.delete());
    // await Promise.all(deletePromises);
    // console.log('Cleared existing workouts');

    // Add seed workouts
    for (const workout of SEED_WORKOUTS) {
      const docRef = await workoutsCollection.add({
        ...workout,
        createdAt: new Date().toISOString(),
        isActive: false,
        userId: '007',
      });
      console.log(`Created workout "${workout.name}" with ID: ${docRef.id}`);
    }

    console.log('✅ Workout seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding workouts:', error);
    process.exit(1);
  }
}

seedWorkouts();
