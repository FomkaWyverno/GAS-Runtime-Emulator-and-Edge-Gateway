import Database from "../../../core/database/Database.js";
import { BatchUpdateRequest } from "../../@types/sheets/advanced/batchUpdate/BatchUpdateRequest.js";

export class SpreadsheetsCollection {
    public batchUpdate(resource: BatchUpdateRequest, spreadsheetId: string): void {
        Database.transaction(transactionId => {
            for (const request of resource.requests) {
                if (request.deleteSheet) {
                    const { sheetId } = request.deleteSheet;
                    
                    Database.query(
                        'DELETE FROM sheets WHERE sheet_id = ? AND spreadsheet_id = ?;',
                        [sheetId, spreadsheetId],
                        transactionId
                    );
                }
            }
        });
    }
}