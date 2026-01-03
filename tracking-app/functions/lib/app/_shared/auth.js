"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const firebase_admin_1 = require("../core/firebase/firebase.admin");
/**
 * Middleware to verify Firebase ID token from Authorization header
 */
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Unauthorized: No token provided' });
            return;
        }
        const idToken = authHeader.split('Bearer ')[1];
        try {
            const decodedToken = await firebase_admin_1.admin.auth().verifyIdToken(idToken);
            req.userId = decodedToken.uid;
            next();
        }
        catch (error) {
            console.error('Token verification failed:', error);
            res.status(401).json({ error: 'Unauthorized: Invalid token' });
            return;
        }
    }
    catch (error) {
        console.error('Authentication middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
};
exports.authenticateUser = authenticateUser;
