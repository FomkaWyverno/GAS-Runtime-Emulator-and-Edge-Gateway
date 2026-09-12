import { google, sheets_v4 } from "googleapis";
import { GaxiosResponseWithHTTP2 } from "googleapis-common/build/src/http2.js";


class GoogleSheetsService {
    private sheets: sheets_v4.Sheets;

    constructor() {

        const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

        const authClient = new google.auth.GoogleAuth({
            scopes: SCOPES
        });

        this.sheets = google.sheets({
            version: 'v4',
            auth: authClient
        })
    }

    /**
     * Отримує сирі значення з таблиці. Дату отримує у вигляді форматованого рядка.
     * @param spreadsheetId ідентифікатор електроної таблиці
     * @param range масив діапазонів або назв аркушів (наприклад, ['Sheet1', 'Sheet2!A1:B10'])
     * @returns діапозон зі значеннями
     */
    async batchGetValues(spreadsheetId: string, ranges: string[]): Promise<sheets_v4.Schema$ValueRange[]> {
        if (!ranges || ranges.length === 0) return [];

        try {
            const response = await this.sheets.spreadsheets.values.batchGet({
                spreadsheetId,
                ranges,
                valueRenderOption: 'UNFORMATTED_VALUE',
                dateTimeRenderOption: 'FORMATTED_STRING'
            });

            return response.data.valueRanges || [];
        } catch (error) {
            const rangesStr = ranges.length > 10
                ? `${ranges.slice(0, 10).join(', ')}...`
                : ranges.join(', ');
            console.error(`Cannot read range from Google Sheet. SpreadsheetId: ${spreadsheetId} Range: ${rangesStr}`, error);
            throw error;
        }
    }

    async updateValues(spreadsheetId: string, range: string, values: any[][]): Promise<sheets_v4.Schema$UpdateValuesResponse> {
        try {
            // console.log(`[GoogleSheetsService] - Update Value spreadsheet_id: "${spreadsheetId}" range: "${range}" values:`);
            // console.log(`[GoogleSheetsService] - ${JSON.stringify(values, null, 2)}`);
            const response = await this.sheets.spreadsheets.values.update({
                spreadsheetId,
                range,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Cannot update range. SpreadsheetId: ${spreadsheetId}, Range: ${range}`, error);
            throw error;
        }
    }

    public async insertColumns(spreadsheetId: string, sheetId: number, startIndex: number, endIndex: number): Promise<GaxiosResponseWithHTTP2<sheets_v4.Schema$BatchUpdateSpreadsheetResponse>> {
        return await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheetId, requestBody: {
                requests: [
                    {
                        insertDimension: {
                            range: {
                                sheetId: sheetId,
                                dimension: 'COLUMNS',
                                startIndex: startIndex,
                                endIndex: endIndex
                            },
                            inheritFromBefore: true
                        }
                    }
                ]
            }
        });
    }

    public async insertRowsAtIndex(
        spreadsheet_id: string,
        sheet_id: number,
        start_index: number,
        end_index: number
    ): Promise<void> {
        await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheet_id,
            requestBody: {
                requests: [
                    {
                        insertDimension: {
                            range: {
                                sheetId: sheet_id,
                                dimension: "ROWS",
                                startIndex: start_index,
                                endIndex: end_index
                            },
                            inheritFromBefore: true
                        },
                    }
                ]
            }
        })
    }

    public async moveColumns(
        spreadsheetId: string,
        sheetId: number,
        startIndex: number,
        endIndex: number,
        destinationIndex: number
    ): Promise<sheets_v4.Schema$BatchUpdateSpreadsheetResponse> {
        const response = await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheetId,
            requestBody: {
                requests: [
                    {
                        moveDimension: {
                            source: {
                                sheetId: sheetId,
                                dimension: 'COLUMNS',
                                startIndex: startIndex,
                                endIndex: endIndex
                            },
                            destinationIndex: destinationIndex
                        }
                    }
                ]
            }
        });

        return response.data;
    }

    public async appendRow(
        spreadsheetId: string,
        range: string,
        values: any[][]
    ): Promise<sheets_v4.Schema$AppendValuesResponse> {
        const response = await this.sheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,
            range: range,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values: values
            }
        });

        return response.data;

    }

    public async clearContents(
        spreadsheetId: string,
        range: string
    ): Promise<sheets_v4.Schema$ClearValuesResponse> {
        const response = await this.sheets.spreadsheets.values.clear({
            spreadsheetId: spreadsheetId,
            range: range
        });

        return response.data;
    }

    public async deleteColumns(
        spreadsheet_id: string,
        sheet_id: number,
        column_index: number,
        how_many: number = 1
    ): Promise<sheets_v4.Schema$BatchUpdateSpreadsheetResponse> {
        const response = await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheet_id,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: sheet_id,
                                dimension: 'COLUMNS',
                                startIndex: column_index,
                                endIndex: column_index + how_many
                            }
                        }
                    }
                ]
            }
        });

        return response.data;
    }

    public async deleteRows(
        spreadsheet_id: string,
        sheet_id: number,
        row_index: number,
        how_many: number = 1
    ): Promise<sheets_v4.Schema$BatchUpdateSpreadsheetResponse> {
        const response = await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheet_id,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: sheet_id,
                                dimension: 'ROWS',
                                startIndex: row_index,
                                endIndex: row_index + how_many
                            }
                        }
                    }
                ]
            }
        });

        return response.data;
    }

    public async insertSheet(
        spreadsheet_id: string,
        sheetId: number,
        title: string,
        index: number
    ): Promise<sheets_v4.Schema$BatchUpdateSpreadsheetResponse> {
        const response = await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheet_id,
            requestBody: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                sheetId: sheetId,
                                title: title,
                                index: index
                            }
                        }
                    }
                ]
            }
        });

        return response.data;
    }

    public async duplicateSheet(
        spreadsheetId: string,
        sourceSheetId: number,
        insertSheetIndex: number,
        newSheetId: number,
        newSheetName: string
    ) {
        const response = await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheetId,
            requestBody: {
                requests: [
                    {
                        duplicateSheet: {
                            sourceSheetId: sourceSheetId,
                            insertSheetIndex: insertSheetIndex,
                            newSheetId: newSheetId,
                            newSheetName: newSheetName
                        }
                    }
                ]
            }
        });

        return response.data;
    }

    /**
     * Повертає загальну інформацію про таблицю
     * @param spreadsheetId ідентифікатор таблиці
     * @returns Схему таблиці
     */
    async getSpreadsheet(spreadsheetId: string): Promise<sheets_v4.Schema$Spreadsheet> {
        try {
            const response = await this.sheets.spreadsheets.get({
                spreadsheetId
            });

            return response.data;
        } catch (error) {
            console.error(`Cannot get Spreadsheet. SpreadsheetId: ${spreadsheetId}`);
            throw error;
        }
    }
}

export default new GoogleSheetsService();