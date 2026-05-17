
export class Spreadsheet {


    constructor(
        private readonly id: string
    ) {}

    /**
     * Gets a unique identifier for this spreadsheet.
     * A spreadsheet ID can be extracted from its URL.
     * For example, the spreadsheet ID in the URL https://docs.google.com/spreadsheets/d/abc1234567/edit#gid=0 is "abc1234567".
     * @returns The unique ID (or key) for the spreadsheet.
     */
    public getId(): string {
        return this.id;
    }
}