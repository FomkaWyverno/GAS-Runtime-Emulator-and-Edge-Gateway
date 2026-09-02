import { createSyncFn } from "synckit";
import { fileURLToPath } from "url";
import type { DatabaseParams, DatabaseWorkerResult } from "./DatabaseWorker.js";

const isTs = import.meta.url.endsWith('.ts');

const workerExts = isTs ? 'ts' : 'js';
const workerPath = fileURLToPath(new URL(`./DatabaseWorker.${workerExts}`, import.meta.url));

const runSyncDBFn = createSyncFn<(params: DatabaseParams) => DatabaseWorkerResult>(workerPath, {
    tsRunner: 'tsx'
});

class Database {
    public query<T = any>(sql: string, params?: any[], transactionId?: string): T[] {
        const request: DatabaseParams = {
            actionType: 'QUERY',
            sql,
            params,
            transactionId
        };
        const result = runSyncDBFn(request);

        if (result.type === 'ERROR') throw new Error(`Database Query Error
            SQL: ${sql}
            Params: ${JSON.stringify(params, null, 2)}
            Stacktrace: ${result.error}`);

        if (result.type === 'QUERY') {
            return result.data?.rows as T[];
        }

        throw new Error(`Unknown result type in query! Result type: ${result.type}`);
    }

    public transaction<T>(action: (transactionId: string) => T): T {
        let transactionId: string | undefined = undefined;
        try {
            const transaction = runSyncDBFn({
                'actionType': 'START_TRANSACTION',
            });

            if (transaction.type !== 'TRANSACTION') throw new Error(`Unknown type for Start Transaction result! Type: ${transaction.type}`);
            if (!transaction.data) throw new Error(`Created Transaction do not has data. Start transaction result: ${JSON.stringify(transaction, null, 2)}`);

            transactionId = transaction.data.transactionId;
            const result = action(transactionId);

            runSyncDBFn({ actionType: 'COMMIT', transactionId: transactionId })

            return result;
        } catch (error) {
            if (transactionId) {
                runSyncDBFn({ actionType: 'ROLLBACK', transactionId: transactionId });
            }
            throw error;
        }
    }
}

export default new Database();