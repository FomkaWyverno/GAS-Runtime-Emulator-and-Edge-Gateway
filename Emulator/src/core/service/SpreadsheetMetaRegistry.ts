import { sheets_v4 } from "googleapis";

export interface SheetMetadata {
    sheetId: number;
    title: string;
    rowCount: number;
    columnCount: number;
}

export interface SpreadsheetMetadata {
    spreadsheetId: string;
    sheets: Map<string | number, SheetMetadata>; // Мапа аркушів ел.таблиці, можна шукати за назвою аркуша або айді
}

class SpreadsheetMetaRegistry {
    private spreadsheets = new Map<string, SpreadsheetMetadata>();

    public getSheetMeta(spreadsheetId: string, sheetNameOrId: string | number): SheetMetadata | undefined {
        const sp = this.spreadsheets.get(spreadsheetId);
        if (!sp) return undefined;
        return sp.sheets.get(sheetNameOrId);
    }

    public setSpreadsheetMeta(spreadsheetId: string, sheets: sheets_v4.Schema$Sheet[]) {
        // Якщо не існує аркушів у ел.таблиці
        if (!sheets || sheets.length === 0) return;

        const sheetsMap = new Map<string | number, SheetMetadata>();
        for (const sheet of sheets) {
            const props = sheet.properties!;
            const meta: SheetMetadata = {
                sheetId: props.sheetId!,
                title: props.title!,
                rowCount: props.gridProperties!.rowCount!,
                columnCount: props.gridProperties!.columnCount!,
            };

            sheetsMap.set(props.sheetId!, meta);
            sheetsMap.set(props.title!, meta);
        }

        this.spreadsheets.set(spreadsheetId, {
            spreadsheetId,
            sheets: sheetsMap
        });
    }

    /**
     * Додає рядки до певного аркуша з ел.таблиці
     * @param spreadsheetId ідентифікатор ел.таблиці
     * @param sheetNameOrId імя або ідентифікатор ел.таблиці
     * @param count потрібна кількість скільки потрібно додати
     */
    public addRowsLocally(spreadsheetId: string, sheetNameOrId: string | number, count: number) {
        const meta = this.getSheetMeta(spreadsheetId, sheetNameOrId);
        if (meta) {
            meta.rowCount += count;
        }
    }

    /**
     * Додає колонок до певного аркуша з ел.таблиці
     * @param spreadsheetId ідентифікатор ел.таблиці
     * @param sheetNameOrId імя або ідентифікатор ел.таблиці
     * @param count потрібна кількість скільки потрібно додати
     */
    public addColsLocally(spreadsheetId: string, sheetNameOrId: string | number, count: number) {
        const meta = this.getSheetMeta(spreadsheetId, sheetNameOrId);
        if (meta) {
            meta.columnCount += count;
        }
    }

    /**
     * Видаляє рядки з певного аркуша з ел.таблиці
     * @param spreadsheetId ідентифікатор ел.таблиці
     * @param sheetNameOrId імя або ідентифікатор ел.таблиці
     * @param count потрібна кількість скільки потрібно видалити
     */
    public removeRowsLocally(spreadsheetId: string, sheetNameOrId: string | number, count: number) {
        const meta = this.getSheetMeta(spreadsheetId, sheetNameOrId);
        if (meta) {
            meta.rowCount -= count;
        }
    }

    /**
     * Видаляє колонки з певного аркуша з ел.таблиці
     * @param spreadsheetId ідентифікатор ел.таблиці
     * @param sheetNameOrId імя або ідентифікатор ел.таблиці
     * @param count потрібна кількість скільки потрібно видалити
     */
    public removeColsLocally(spreadsheetId: string, sheetNameOrId: string | number, count: number) {
        const meta = this.getSheetMeta(spreadsheetId, sheetNameOrId);
        if (meta) {
            meta.columnCount -= count;
        }
    }

    /**
     * Реєструє метадані нового аркуша в ел.таблиці
     * @param spreadsheetId ідентифікатор ел.таблиці
     * @param sheetId ідентифікатор нового аркуша
     * @param title назва нового аркуша
     * @param rowCount кількість рядків у сітці нового аркуша
     * @param columnCount кількість колонок у сітці нового аркуша
     */
    public registerSheetLocally(
        spreadsheetId: string,
        sheetId: number,
        title: string,
        rowCount: number,
        columnCount: number
    ) {
        let sp = this.spreadsheets.get(spreadsheetId);
        if (!sp) {
            sp = {
                spreadsheetId,
                sheets: new Map<string | number, SheetMetadata>()
            };
            this.spreadsheets.set(spreadsheetId, sp);
        }

        const meta: SheetMetadata = {
            sheetId,
            title,
            rowCount,
            columnCount
        };

        sp.sheets.set(sheetId, meta);
        sp.sheets.set(title, meta);
    }
}

export default new SpreadsheetMetaRegistry();