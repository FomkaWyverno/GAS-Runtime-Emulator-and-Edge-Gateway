import { google, sheets_v4 } from "googleapis";


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
     * @param range діапазон значень
     * @returns діапозон зі значеннями
     */
    async getValues(spreadsheetId: string, range: string): Promise<sheets_v4.Schema$ValueRange> {
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId,
                range,
                valueRenderOption: 'UNFORMATTED_VALUE',
                dateTimeRenderOption: 'FORMATTED_STRING'
            });

            return response.data;
        } catch (error) {
            console.error(`Cannot read range from Google Sheet. SpreadsheetId: ${spreadsheetId} Range: ${range}`, error);
            throw error;
        }
    }

    async updateValues(spreadsheetId: string, range: string, values: any[][]): Promise<sheets_v4.Schema$UpdateValuesResponse> {
        try {
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