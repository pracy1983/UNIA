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
    type: 'namoro' | 'casamento' | 'noivado' | 'afeto' | 'ficante' | 'amizade colorida' | 'solo' | 'dating' | 'marriage' | 'poly' | 'open' | 'friendship';
    partnerName?: string;
    startedAt?: string;
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
    started_at?: string;
    invite_token?: string;
    is_archived?: boolean;
    settings?: Record<string, any>;
    partner_node?: {
        id: string;
        name: string;
        photo_url?: string;
        owner_id: string;
    };
}

export interface WishlistItem {
    id: string;
    relationship_id: string;
    user_id: string;
    title: string;
    link_url?: string;
    image_url?: string;
    description?: string;
    category?: string;
    created_at: string;
}

export interface Profile {
    id: string;
    email: string;
    display_name: string;
    full_name?: string;
    cpf?: string;
    birth_date?: string;
    photo_url?: string;
}

export interface Pill {
    id: string;
    user_id: string;
    mood: string;
    note?: string;
    created_at: string;
}

export interface PersonalityQuestion {
    id: string;
    question_text: string;
    category: string;
}

export interface PersonalityDiscovery {
    question_id: string;
    question_text: string;
    category: string;
    answer_content: string;
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

export const archiveRelationship = async (id: string): Promise<Relationship> => {
    const response = await api.put(`/relationships/${id}/archive`);
    return response.data;
};

export const deleteRelationship = async (id: string): Promise<void> => {
    await api.delete(`/relationships/${id}`);
};

// ─── Convites ───────────────────────────────────────────────────────────────
export const getRelationshipByInvite = async (token: string): Promise<Relationship> => {
    const response = await api.get(`/relationships/invite/${token}`);
    return response.data;
};

export const acceptInvite = async (token: string): Promise<{ relationshipId: string }> => {
    const response = await api.post('/relationships/invite/accept', { token });
    return response.data;
};

// ─── SOS ────────────────────────────────────────────────────────────────────
export const startMediation = async (relationshipId?: string): Promise<any> => {
    const response = await api.post('/sos/start', { relationshipId });
    return response.data;
};

export const sendMediationMessage = async (sessionId: string, message: string): Promise<any> => {
    if (!sessionId || sessionId === 'undefined') {
        throw new Error('ID da sessão de SOS não encontrado. Tente reiniciar a mediação.');
    }
    const response = await api.post(`/sos/${sessionId}/message`, { message });
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

export const triggerSOS = async (relationshipId?: string, message?: string): Promise<SOSResponse> => {
    const response = await api.post('/sos', { relationshipId, message });
    return response.data;
};

// ─── Wishlist ───────────────────────────────────────────────────────────────
export const getWishlist = async (relationshipId: string): Promise<WishlistItem[]> => {
    const response = await api.get(`/wishlist/${relationshipId}`);
    return Array.isArray(response.data) ? response.data : [];
};

export const getPersonalWishlist = async (): Promise<WishlistItem[]> => {
    const response = await api.get('/wishlist/personal');
    return Array.isArray(response.data) ? response.data : [];
};

export const addWishlistItem = async (data: Partial<WishlistItem>): Promise<WishlistItem> => {
    const response = await api.post('/wishlist', data);
    return response.data;
};

export const deleteWishlistItem = async (id: string): Promise<void> => {
    await api.delete(`/wishlist/${id}`);
};

export const updateRelationship = async (id: string, data: any): Promise<Relationship> => {
    const response = await api.put(`/relationships/${id}`, data);
    return response.data;
};

// ─── Profile ────────────────────────────────────────────────────────────────
export const getProfile = async (): Promise<Profile> => {
    const response = await api.get('/profile');
    return response.data;
};

export const updateProfile = async (data: Partial<Profile>): Promise<Profile> => {
    const response = await api.put('/profile', data);
    return response.data;
};

// ─── Personality Profiling ──────────────────────────────────────────────────
export const getUnansweredQuestions = async (): Promise<PersonalityQuestion[]> => {
    const response = await api.get('/personality/unanswered');
    return response.data;
};

export const submitPersonalityAnswer = async (questionId: string, answerContent: string): Promise<any> => {
    const response = await api.post('/personality/answers', { questionId, answerContent });
    return response.data;
};

export const getDiscoveries = async (): Promise<PersonalityDiscovery[]> => {
    const response = await api.get('/personality/discoveries');
    return response.data;
};

export default api;
