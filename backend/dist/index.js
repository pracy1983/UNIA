import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { query } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import relationshipsRoutes from './routes/relationshipsRoutes.js';
import pillRoutes from './routes/pillRoutes.js';
import memoryRoutes from './routes/memoryRoutes.js';
import sosRoutes from './routes/sosRoutes.js';
dotenv.config();
// @ts-ignore
const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/relationships', relationshipsRoutes);
app.use('/api/pills', pillRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/sos', sosRoutes);
// Healthcheck
app.get('/health', async (req, res) => {
    try {
        await query('SELECT 1');
        res.status(200).json({ status: 'OK', database: 'connected' });
    }
    catch (error) {
        res.status(500).json({ status: 'Error', database: 'disconnected' });
    }
});
if (process.env.NODE_ENV === 'production') {
    const publicPath = path.join(__dirname, 'dist', 'public');
    app.use(express.static(publicPath));
    app.get('*all', (req, res) => {
        res.sendFile(path.join(publicPath, 'index.html'));
    });
}
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
