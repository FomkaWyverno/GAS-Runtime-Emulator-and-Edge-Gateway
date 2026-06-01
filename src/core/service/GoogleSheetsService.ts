import { google, sheets_v4 } from "googleapis";
import path from "path";


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
}

export default new GoogleSheetsService();