import axios from 'axios';

// Configuração base do axios
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface CreateRelationshipData {
    type: 'solo' | 'dating' | 'marriage' | 'poly' | 'open' | 'friendship';
}

export interface Relationship {
    id: number;
    title: string;
    type: string;
    status: string;
    level: number;
    xp: number;
    percentage: number;
    progressValue: number;
}

// ─── Funções da API ───────────────────────────────────────────────────────────
export const createRelationship = async (data: CreateRelationshipData): Promise<Relationship> => {
    const response = await api.post('/relationships', data);
    return response.data;
};

export const getRelationships = async (): Promise<Relationship[]> => {
    const response = await api.get('/dashboard/relationships');
    return Array.isArray(response.data) ? response.data : [];
};

export default api;
