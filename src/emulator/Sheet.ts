import { Spreadsheet } from "./Spreadsheet.js";

export class Sheet {
    constructor(
        private readonly spreadsheet: Spreadsheet,
        private readonly sheet_id: number,
        private sheet_name: string,
        private sheet_index: number,
    ) {}

    /**
     * Returns the name of the sheet.
     * @returns The name of the sheet.
     */
    public getName(): string {
        return this.sheet_name;
    }

    /**
     * Внутрішній метод, щоб змінювати індекс розташування у таблиці аркуша.
     * @param sheetIndex новий індекс
     */
    public _setSheetIndex(sheetIndex: number) {
        this.sheet_index = sheetIndex;
    } 

    /**
     * Повертає таблицю у якій знаходиться цей аркуш
     * @returns Spreadsheet талбиці у якій знаходиться цей аркуш
     */
    public getParent(): Spreadsheet {
        return this.spreadsheet;
    }

    /**
     * Returns the ID of the sheet represented by this object.
     * This is an ID for the sheet that is unique to the spreadsheet.
     * The ID is a monotonically increasing integer assigned at sheet creation time that is independent of sheet position.
     * This is useful in conjunction with methods such as Range.copyFormatToRange(gridId, column, columnEnd, row, rowEnd) that take a gridId parameter rather than a Sheet instance.
     * @returns An ID for the sheet unique to the spreadsheet.
     */
    public getSheetId(): number {
        return this.sheet_id;
    }

    /**
     * Gets the position of the sheet in its parent spreadsheet. Starts at 1.
     * @returns The position of the sheet in its parent spreadsheet.
     */
    public getIndex(): number {
        return this.sheet_index;
    }
}