"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const models_1 = require("../app/_shared/models");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// Initialize Firebase Admin for seeding
const serviceAccountPath = path.join(__dirname, '../../.firebase/serviceAccountKey.json');
let app;
if (process.env.FIRESTORE_EMULATOR_HOST) {
    // Use emulator
    console.log(`🔧 Using Firestore Emulator: ${process.env.FIRESTORE_EMULATOR_HOST}`);
    app = firebase_admin_1.default.apps.length
        ? firebase_admin_1.default.app()
        : firebase_admin_1.default.initializeApp({
            projectId: 'easyworkouttrack',
        });
}
else if (fs.existsSync(serviceAccountPath)) {
    // Use service account key
    console.log('🔑 Using service account key from .firebase/serviceAccountKey.json');
    const serviceAccount = require(serviceAccountPath);
    app = firebase_admin_1.default.apps.length
        ? firebase_admin_1.default.app()
        : firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount),
        });
}
else {
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
// Mock workout data for seeding - all templates use NotStarted status
const SEED_WORKOUTS = [
    {
        name: 'Push Day A',
        exercises: [
            {
                id: '1',
                name: 'Bench Press',
                sets: [
                    { id: '1', weight: 60, reps: 8, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 65, reps: 6, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 70, reps: 5, status: models_1.StatusEnum.NotStarted },
                    { id: '4', weight: 70, reps: 5, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '2',
                name: 'Overhead Press',
                sets: [
                    { id: '1', weight: 40, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 42, reps: 8, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 42, reps: 8, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '3',
                name: 'Incline Dumbbell Press',
                sets: [
                    { id: '1', weight: 22, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 24, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 24, reps: 10, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '4',
                name: 'Tricep Pushdowns',
                sets: [
                    { id: '1', weight: 25, reps: 15, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 27, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 30, reps: 10, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '5',
                name: 'Lateral Raises',
                sets: [
                    { id: '1', weight: 10, reps: 15, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 12, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 12, reps: 12, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '6',
                name: 'Dumbbell Flyes',
                sets: [
                    { id: '1', weight: 18, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 20, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 20, reps: 10, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '7',
                name: 'Front Raises',
                sets: [
                    { id: '1', weight: 10, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 12, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 12, reps: 10, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '8',
                name: 'Skull Crushers',
                sets: [
                    { id: '1', weight: 20, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 22, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 22, reps: 10, status: models_1.StatusEnum.NotStarted },
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
                    { id: '1', weight: 100, reps: 5, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 110, reps: 5, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 120, reps: 3, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '2',
                name: 'Pull-ups',
                sets: [
                    { id: '1', weight: 0, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 0, reps: 8, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 0, reps: 6, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '3',
                name: 'Barbell Rows',
                sets: [
                    { id: '1', weight: 60, reps: 8, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 65, reps: 8, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 65, reps: 8, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '4',
                name: 'Face Pulls',
                sets: [
                    { id: '1', weight: 20, reps: 15, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 20, reps: 15, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 25, reps: 12, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '5',
                name: 'Bicep Curls',
                sets: [
                    { id: '1', weight: 15, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 17, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 17, reps: 10, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '6',
                name: 'Shrugs',
                sets: [
                    { id: '1', weight: 40, reps: 15, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 45, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 45, reps: 12, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '7',
                name: 'Reverse Flyes',
                sets: [
                    { id: '1', weight: 8, reps: 15, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 10, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 10, reps: 12, status: models_1.StatusEnum.NotStarted },
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
                    { id: '1', weight: 80, reps: 8, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 90, reps: 6, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 100, reps: 5, status: models_1.StatusEnum.NotStarted },
                    { id: '4', weight: 100, reps: 5, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '2',
                name: 'Leg Press',
                sets: [
                    { id: '1', weight: 120, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 140, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 150, reps: 8, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '3',
                name: 'Romanian Deadlifts',
                sets: [
                    { id: '1', weight: 60, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 70, reps: 8, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 75, reps: 8, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '4',
                name: 'Leg Curls',
                sets: [
                    { id: '1', weight: 40, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 45, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 45, reps: 10, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '5',
                name: 'Leg Extensions',
                sets: [
                    { id: '1', weight: 50, reps: 15, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 55, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 60, reps: 10, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '6',
                name: 'Calf Raises',
                sets: [
                    { id: '1', weight: 60, reps: 15, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 70, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 70, reps: 12, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '7',
                name: 'Walking Lunges',
                sets: [
                    { id: '1', weight: 20, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 20, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 25, reps: 10, status: models_1.StatusEnum.NotStarted },
                ],
            },
        ],
    },
    {
        name: 'Push Day B',
        exercises: [
            {
                id: '1',
                name: 'Incline Barbell Press',
                sets: [
                    { id: '1', weight: 50, reps: 8, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 55, reps: 8, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 60, reps: 6, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '2',
                name: 'Dumbbell Shoulder Press',
                sets: [
                    { id: '1', weight: 20, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 22, reps: 8, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 22, reps: 8, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '3',
                name: 'Cable Flyes',
                sets: [
                    { id: '1', weight: 15, reps: 15, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 17, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 17, reps: 12, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '4',
                name: 'Arnold Press',
                sets: [
                    { id: '1', weight: 18, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 20, reps: 8, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 20, reps: 8, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '5',
                name: 'Overhead Tricep Extension',
                sets: [
                    { id: '1', weight: 20, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 22, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 22, reps: 10, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '6',
                name: 'Pec Deck',
                sets: [
                    { id: '1', weight: 40, reps: 15, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 45, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 50, reps: 10, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '7',
                name: 'Rope Tricep Pushdowns',
                sets: [
                    { id: '1', weight: 25, reps: 15, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 27, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 30, reps: 10, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '8',
                name: 'Dips',
                sets: [
                    { id: '1', weight: 0, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 0, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 0, reps: 8, status: models_1.StatusEnum.NotStarted },
                ],
            },
        ],
    },
    {
        name: 'Pull Day B',
        exercises: [
            {
                id: '1',
                name: 'Weighted Pull-ups',
                sets: [
                    { id: '1', weight: 10, reps: 8, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 10, reps: 6, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 12, reps: 5, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '2',
                name: 'Lat Pulldown',
                sets: [
                    { id: '1', weight: 60, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 65, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 70, reps: 8, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '3',
                name: 'Seated Cable Rows',
                sets: [
                    { id: '1', weight: 50, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 55, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 55, reps: 10, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '4',
                name: 'T-Bar Rows',
                sets: [
                    { id: '1', weight: 40, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 45, reps: 8, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 50, reps: 8, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '5',
                name: 'Hammer Curls',
                sets: [
                    { id: '1', weight: 15, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 17, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 17, reps: 10, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '6',
                name: 'Preacher Curls',
                sets: [
                    { id: '1', weight: 12, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 15, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 15, reps: 10, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '7',
                name: 'Cable Face Pulls',
                sets: [
                    { id: '1', weight: 25, reps: 15, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 27, reps: 15, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 30, reps: 12, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '8',
                name: 'Farmer Walks',
                sets: [
                    { id: '1', weight: 30, reps: 40, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 35, reps: 30, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 40, reps: 25, status: models_1.StatusEnum.NotStarted },
                ],
            },
        ],
    },
    {
        name: 'Full Body',
        exercises: [
            {
                id: '1',
                name: 'Squats',
                sets: [
                    { id: '1', weight: 70, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 80, reps: 8, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 85, reps: 6, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '2',
                name: 'Bench Press',
                sets: [
                    { id: '1', weight: 55, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 60, reps: 8, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 65, reps: 6, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '3',
                name: 'Bent Over Rows',
                sets: [
                    { id: '1', weight: 50, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 55, reps: 8, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 55, reps: 8, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '4',
                name: 'Overhead Press',
                sets: [
                    { id: '1', weight: 35, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 37, reps: 8, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 40, reps: 6, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '5',
                name: 'Romanian Deadlifts',
                sets: [
                    { id: '1', weight: 60, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 70, reps: 8, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 75, reps: 6, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '6',
                name: 'Dumbbell Flyes',
                sets: [
                    { id: '1', weight: 15, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 17, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 17, reps: 10, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '7',
                name: 'Lat Pulldown',
                sets: [
                    { id: '1', weight: 55, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 60, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 65, reps: 8, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '8',
                name: 'Leg Curls',
                sets: [
                    { id: '1', weight: 35, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 40, reps: 10, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 40, reps: 10, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '9',
                name: 'Core Circuit',
                sets: [
                    { id: '1', weight: 0, reps: 20, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 0, reps: 20, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 0, reps: 20, status: models_1.StatusEnum.NotStarted },
                ],
            },
        ],
    },
    {
        name: 'Quick HIIT',
        exercises: [
            {
                id: '1',
                name: 'Burpees',
                sets: [
                    { id: '1', weight: 0, reps: 15, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 0, reps: 15, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 0, reps: 15, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '2',
                name: 'Mountain Climbers',
                sets: [
                    { id: '1', weight: 0, reps: 20, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 0, reps: 20, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 0, reps: 20, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '3',
                name: 'Jump Squats',
                sets: [
                    { id: '1', weight: 0, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 0, reps: 12, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 0, reps: 12, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '4',
                name: 'Push-ups',
                sets: [
                    { id: '1', weight: 0, reps: 20, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 0, reps: 15, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 0, reps: 12, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '5',
                name: 'High Knees',
                sets: [
                    { id: '1', weight: 0, reps: 30, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 0, reps: 30, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 0, reps: 30, status: models_1.StatusEnum.NotStarted },
                ],
            },
            {
                id: '6',
                name: 'Plank',
                sets: [
                    { id: '1', weight: 0, reps: 60, status: models_1.StatusEnum.NotStarted },
                    { id: '2', weight: 0, reps: 45, status: models_1.StatusEnum.NotStarted },
                    { id: '3', weight: 0, reps: 30, status: models_1.StatusEnum.NotStarted },
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
            const now = new Date().toISOString();
            const docRef = await workoutsCollection.add({
                ...workout,
                userId: '007',
                createdAt: now,
                updatedAt: now,
            });
            console.log(`Created workout "${workout.name}" with ID: ${docRef.id}`);
        }
        console.log('✅ Workout seeding completed successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error seeding workouts:', error);
        process.exit(1);
    }
}
seedWorkouts();
