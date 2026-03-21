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
    partnerName?: string;
}

export interface Relationship {
    id: string;
    title: string;
    type: string;
    status: string;
    level: number;
    xp: number;
    percentage: number;
    progressValue: number;
}

export interface Pill {
    id: string;
    user_id: string;
    mood: string;
    note?: string;
    created_at: string;
}

export interface Memory {
    id: string;
    relationship_id: string;
    title: string;
    content?: string;
    occurrence_date: string;
    media_urls?: string[];
    tags?: string[];
    created_at: string;
}

// ─── Relacionamentos ──────────────────────────────────────────────────────────
export const createRelationship = async (data: CreateRelationshipData): Promise<Relationship> => {
    const response = await api.post('/relationships', data);
    return response.data;
};

export const getRelationships = async (): Promise<Relationship[]> => {
    const response = await api.get('/dashboard/relationships');
    return Array.isArray(response.data) ? response.data : [];
};

export const getRelationshipById = async (id: string): Promise<Relationship> => {
    const response = await api.get(`/relationships/${id}`);
    return response.data;
};

// ─── Pílulas ──────────────────────────────────────────────────────────────────
export const savePill = async (mood: string, note?: string): Promise<Pill> => {
    const response = await api.post('/pills', { mood, note });
    return response.data;
};

export const getLatestPill = async (): Promise<Pill | null> => {
    const response = await api.get('/pills/latest');
    return response.data;
};

// ─── Memórias / Momentos ──────────────────────────────────────────────────────
export const getMemories = async (relId: string): Promise<Memory[]> => {
    const response = await api.get(`/memories/${relId}`);
    return Array.isArray(response.data) ? response.data : [];
};

export const createMemory = async (data: {
    relationship_id: string;
    title: string;
    content?: string;
    occurrence_date: string;
    tags?: string[];
}): Promise<Memory> => {
    const response = await api.post('/memories', data);
    return response.data;
};

export interface SOSResponse {
    session: any;
    advice: string[];
}

// ─── SOS / Emergência ──────────────────────────────────────────────────────────
export const triggerSOS = async (relationshipId?: string, message?: string): Promise<SOSResponse> => {
    const response = await api.post('/sos/trigger', { relationshipId, message });
    return response.data;
};

export default api;
