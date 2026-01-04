"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTrainingHandler = void 0;
const training_repository_1 = require("./training.repository");
const createTrainingHandler = async (req, res) => {
    try {
        const training = req.body;
        const result = await (0, training_repository_1.createTraining)(training);
        res.status(201).json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.createTrainingHandler = createTrainingHandler;
