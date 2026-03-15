"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_js_1 = require("./config/database.js");
const authRoutes_js_1 = __importDefault(require("./routes/authRoutes.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', authRoutes_js_1.default);
// Healthcheck
app.get('/health', async (req, res) => {
    try {
        await (0, database_js_1.query)('SELECT 1');
        res.status(200).json({ status: 'OK', database: 'connected' });
    }
    catch (err) {
        res.status(500).json({ status: 'ERROR', database: 'disconnected' });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
