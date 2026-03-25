import fs from 'fs';
import path from 'path';
import pool from './database.js';
import { fileURLToPath } from 'url';

// Helper for ES Modules to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const syncDatabase = async () => {
    console.log('🔄 Sincronizando schema do banco de dados...');
    
    // Caminhos para os arquivos SQL na raiz do backend
    const backendRoot = path.join(__dirname, '../../');
    const filesToRun = [
        'schema.sql',
        'migration.sql',
        'feature_migration.sql',
        'update_types.sql',
        'phase3_migration.sql'
    ];

    const client = await pool.connect();

    try {
        // Habilitar extensões vitais primeiro
        await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
        await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

        for (const file of filesToRun) {
            const filePath = path.join(backendRoot, file);
            if (fs.existsSync(filePath)) {
                console.log(`Buscando e rodando ${file}...`);
                const sql = fs.readFileSync(filePath, 'utf-8');
                
                try {
                    await client.query(sql);
                    console.log(`✅ ${file} executado com sucesso.`);
                } catch (err: any) {
                    console.error(`⚠️ Erro ao executar ${file} (pode ser ignorado se for apenas conflito de IF NOT EXISTS):`, err.message);
                }
            } else {
                console.warn(`Arquivo ${file} não encontrado na raiz do backend.`);
            }
        }
        
        console.log('✅ Sincronização de banco de dados finalizada!');
    } catch (err: any) {
        console.error('❌ Erro crítico ao sincronizar o banco:', err.message);
    } finally {
        client.release();
    }
};
