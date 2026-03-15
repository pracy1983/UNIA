"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_js_1 = require("../config/database.js");
const register = async (req, res) => {
    const { email, password, displayName } = req.body;
    try {
        const userCheck = await (0, database_js_1.query)('SELECT id FROM users WHERE email = $1', [email]);
        if (userCheck.rowCount && userCheck.rowCount > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const result = await (0, database_js_1.query)('INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name', [email, passwordHash, displayName]);
        // Create a default Solo node for the user
        const newUser = result.rows[0];
        await (0, database_js_1.query)('INSERT INTO nodes (owner_id, name, type) VALUES ($1, $2, $3)', [newUser.id, 'Meu Cantinho', 'solo']);
        const token = jsonwebtoken_1.default.sign({ id: newUser.id, email: newUser.email }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
        res.status(201).json({ user: newUser, token });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await (0, database_js_1.query)('SELECT * FROM users WHERE email = $1', [email]);
        if (!result.rowCount || result.rowCount === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const user = result.rows[0];
        const isMatch = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
        res.json({
            user: {
                id: user.id,
                email: user.email,
                displayName: user.display_name,
            },
            token,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
