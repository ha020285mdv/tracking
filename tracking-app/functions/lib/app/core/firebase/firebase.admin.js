"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.db = exports.firebaseAdminApp = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
// Initialize default Firebase Admin app
exports.firebaseAdminApp = firebase_admin_1.default.apps.length ? firebase_admin_1.default.app() : firebase_admin_1.default.initializeApp();
// Firestore & Auth exports
exports.db = exports.firebaseAdminApp.firestore();
exports.auth = exports.firebaseAdminApp.auth();
