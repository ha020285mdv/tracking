"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTraining = createTraining;
const firebase_admin_1 = require("../core/firebase/firebase.admin");
async function createTraining(training) {
    const ref = await firebase_admin_1.db.collection('trainings').add({
        ...training,
        createdAt: new Date().toISOString(), // always track creation time
    });
    return { id: ref.id, ...training };
}
