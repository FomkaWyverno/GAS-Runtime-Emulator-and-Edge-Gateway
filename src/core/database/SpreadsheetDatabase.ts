import mysql, { Pool } from "mysql2/promise";
import fs from 'fs'
import configData from '../../../config.json' with { type: 'json' }
import { AppConfig } from "../../@types/AppConfig.js";
import { fileURLToPath } from "url";
import path from "path";

const config = configData as unknown as AppConfig;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SpreadsheetDatabase {
    private pool: Pool | null = null;

    public async init(): Promise<void> {
        if (this.pool) return;

        if (config.database.url) {
            this.pool = mysql.createPool(config.database.url);
            await this.initSchema();
            console.log('MySQL Connection Pool initilized')
        }
    }

    private async initSchema(): Promise<void> {
        try {
            if (!this.pool) throw new Error('Initialize Schema can\'t without MySQL Connection!');

            const sqlFilePath = path.join(__dirname, 'sql', 'init.sql');
            const sql = fs.readFileSync(sqlFilePath, 'utf-8');

            const sqlQueries = sql
                .split(';')
                .map(query => query.trim())
                .filter(query => query.length > 0);

            for (const query of sqlQueries) {
                await this.pool.query(query);
            }

            console.log(`MySQL Initilized DB-Schema`);
        } catch (error: any) {
            console.error('Fatal error in runtime intilized MySQL schema', error.message);
            throw error;
        }
    }
}

export default new SpreadsheetDatabase();