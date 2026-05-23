import path from "path";
import { createSyncFn } from "synckit";
import { fileURLToPath } from "url";
import { DatabaseParams } from "./DatabaseWorker.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workerPath = path.resolve(__dirname,'DatabaseWorker.js');

const runSyncQuerySQLFn = createSyncFn(workerPath);

class Database {
    public query<T = any>(sql: string, params?: any[]): T[] {
        const request: DatabaseParams = { sql, params };
        return runSyncQuerySQLFn(request);
    }

    public transaction<T>(action: () => T): T {
        try {
            this.query('START TRANSACTION;');

            const result = action();

            this.query('COMMIT;');

            return result;
        } catch (error) {
            this.query('ROLLBACK;');
            throw error;
        }
    }
}

export default new Database();