import configData from '../../../config.json' with { type: 'json' }
import mysql, { Connection, Pool, PoolConnection, ResultSetHeader } from "mysql2/promise";
import path from "path";
import fs from 'fs'
import { runAsWorker } from "synckit";
import { AppConfig } from '../../@types/AppConfig.js';
import { fileURLToPath } from 'url';

export interface DatabaseParams {
    actionType?: 'QUERY' | 'START_TRANSACTION' | 'COMMIT' | 'ROLLBACK';
    sql?: string,
    params?: any[],
    transactionId?: string;
}

export type DatabaseWorkerResultType = 'QUERY' | 'TRANSACTION' | 'ERROR';

export interface QueryResult {
    rows: mysql.QueryResult;
    affectedRows?: number;
    insertId?: number;
}

export interface TransactionResult {
    transactionId: string;
}

interface DatabaseResultMap {
    'QUERY': QueryResult;
    'TRANSACTION': TransactionResult;
    'ERROR': null
}

export type DatabaseWorkerResult = {
    [K in DatabaseWorkerResultType]: {
        type: K;
        success: boolean;
        data?: DatabaseResultMap[K];
        error?: string;
    }
}[DatabaseWorkerResultType]

const config = configData as unknown as AppConfig;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool: Pool | null = null;
const activeTransactions = new Map<string, PoolConnection>()

async function init(): Promise<void> {
    if (pool) return;

    if (config.database && config.database.url) {
        pool = mysql.createPool(config.database.url);
        await initSchema();
        console.log('MySQL Connection Pool initilized')
    }
}

async function initSchema(): Promise<void> {
    try {
        if (!pool) throw new Error('Initialize Schema can\'t without MySQL Connection!');

        const sqlFilePath = path.join(__dirname, 'sql', 'init.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf-8');

        const sqlQueries = sql
            .split(';')
            .map(query => query.trim())
            .filter(query => query.length > 0);

        for (const query of sqlQueries) {
            await pool.query(query);
        }

        console.log(`MySQL Initilized DB-Schema`);
    } catch (error: any) {
        console.error('Fatal error in runtime intilized MySQL schema', error.message);
        throw error;
    }
}

runAsWorker(async ({ actionType = 'QUERY', sql, params, transactionId }: DatabaseParams): Promise<DatabaseWorkerResult> => {
    try {
        await init();

        if (!pool) throw new Error('Database pool is not initialized inside worker!');

        if (actionType === 'START_TRANSACTION') {
            const generatedTransactionId = crypto.randomUUID(); // Створюємо унікальний ідентифікатор трансзакції

            // Якщо випадково якимось чином вже UUID вже лежить як активна тансзакція, тоді повертає помилку
            if (activeTransactions.has(generatedTransactionId)) {
                return {
                    type: 'ERROR',
                    success: false,
                    error: `Conflicted generation UUID: Transaction ${generatedTransactionId} is already exists!`
                }
            }

            // Беремо один з підключень з пула, та починаємо трансзакцію
            const connection = await pool.getConnection();
            await connection.beginTransaction();

            // Кешуємо трансзакцію у мапі
            activeTransactions.set(generatedTransactionId, connection);

            // Повертаємо клєінту результат початку трансзакції
            return {
                type: 'TRANSACTION',
                success: true,
                data: {
                    transactionId: generatedTransactionId
                },
                error: ''
            };
        }

        if (actionType === 'COMMIT') {
            if (!transactionId) return { type: "ERROR", success: false, error: 'Transaction ID is required to commit' };
            const connection = activeTransactions.get(transactionId);

            if (connection) {
                await connection.commit();
                connection.release();
                activeTransactions.delete(transactionId);
            }

            return {
                type: 'TRANSACTION',
                success: true,
                data: { transactionId }
            }
        }

        if (actionType === 'ROLLBACK') {
            if (!transactionId) return { type: 'ERROR', success: false, error: 'Transaction ID is required to rollback' };
            const connection = activeTransactions.get(transactionId);

            if (connection) {
                await connection.rollback();
                connection.release();
                activeTransactions.delete(transactionId);
            }

            return {
                type: 'TRANSACTION',
                success: true,
                data: { transactionId }
            }
        }


        if (!sql) return { type: 'ERROR', success: false, error: 'Worker recived empty request (no sql)' };

        let rawResult: any;

        if (transactionId && activeTransactions.has(transactionId)) {
            const connection = activeTransactions.get(transactionId)!;
            [rawResult] = await connection?.execute(sql, params);
        } else {
            [rawResult] = await pool.execute(sql, params);
        }

        if (Array.isArray(rawResult)) {
            return {
                type: 'QUERY',
                success: true,
                data: { rows: rawResult }
            };
        } else {
            const header = rawResult as ResultSetHeader;
            return {
                type: 'QUERY',
                success: true,
                data: {
                    rows: [],
                    affectedRows: header.affectedRows,
                    insertId: header.insertId
                }
            }
        }
    } catch (error: any) {
        return {
            type: 'ERROR',
            success: false,
            error: error.message || 'Unknown database error'
        };
    }
});