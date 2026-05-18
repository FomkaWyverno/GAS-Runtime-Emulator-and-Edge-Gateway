
export class Sheet {
    constructor(
        private readonly sheet_id: number,
        private readonly sheet_name: string
    ) {}

    /**
     * Returns the name of the sheet.
     * @returns The name of the sheet.
     */
    public getName(): string {
        return this.sheet_name;
    }
}