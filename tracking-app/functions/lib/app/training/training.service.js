"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
const training_repository_1 = require("./training.repository");
async function create(training) {
    if (!training.userId) {
        throw new Error('userId required');
    }
    return (0, training_repository_1.createTraining)({
        ...training,
        createdAt: new Date().toISOString(),
    });
}
