import { Sheet } from "./Sheet.js";

export class Range {
    constructor(
        private readonly sheet: Sheet,
        private readonly row: number,
        private readonly column: number,
        private readonly numRows: number,
        private readonly numColumns: number) {}
}