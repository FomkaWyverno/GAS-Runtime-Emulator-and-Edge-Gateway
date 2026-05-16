import configData from '../../../config.json' with { type: 'json' }
import mysql, { Pool } from "mysql2/promise";
import path from "path";
import fs from 'fs'
import { runAsWorker } from "synckit";
import { AppConfig } from '../../@types/AppConfig.js';
import { fileURLToPath } from 'url';

export interface DatabaseParams {
    sql: string,
    params?: any[]
}

const config = configData as unknown as AppConfig;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool: Pool | null = null;

async function init(): Promise < void> {
    if(pool) return;

    if(config.database && config.database.url) {
    pool = mysql.createPool(config.database.url);
    await initSchema();
    console.log('MySQL Connection Pool initilized')
}
    }

async function initSchema(): Promise < void> {
    try {
        if(!pool) throw new Error('Initialize Schema can\'t without MySQL Connection!');

        const sqlFilePath = path.join(__dirname, 'sql', 'init.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf-8');

        const sqlQueries = sql
            .split(';')
            .map(query => query.trim())
            .filter(query => query.length > 0);

        for(const query of sqlQueries) {
            await pool.query(query);
        }

            console.log(`MySQL Initilized DB-Schema`);
    } catch(error: any) {
        console.error('Fatal error in runtime intilized MySQL schema', error.message);
        throw error;
    }
}

runAsWorker(async ({ sql, params }: DatabaseParams) => {
    await init();
    
    if (!sql) throw new Error('Worker received empty request (no sql)');
    if (!pool) throw new Error('Database pool is not initialized inside worker!');

    const [rows] = await pool.execute(sql, params);
    return rows;
});