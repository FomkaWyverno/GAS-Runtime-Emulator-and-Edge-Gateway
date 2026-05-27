export interface ParsedRange {
    sheetName: string | null;
    row: number;
    column: number;
    numRows: number;
    numColumns: number;
}

interface ParsedCell {
    row: number;
    column: number;
}

class RangeUtils {
    public parseA1Notation(a1Notation: string): ParsedRange {
        if (!a1Notation) throw new Error('A1Notation cannot be empty!');

        const trimmed = a1Notation.trim();

        let sheetName: string | null = null;
        let rangePart = a1Notation;

        if (trimmed.includes('!')) {
            const exclamIndex = trimmed.lastIndexOf('!');
            sheetName = trimmed.substring(0, exclamIndex).trim();
            rangePart = trimmed.substring(exclamIndex + 1).trim();

            if (sheetName.startsWith("'") && sheetName.endsWith("'")) {
                sheetName = sheetName.slice(1, -1).trim();
            }
        }

        const parts = rangePart.split(':');
        const startCell = parts[0].trim();
        const endCell = parts[1] ? parts[1].trim() : startCell;

        const start = this.parseCell(startCell);
        const end = this.parseCell(endCell);

        const numRows = Math.abs(end.row - start.row) + 1;
        const numColumns = Math.abs(end.column - start.column) + 1;

        return {
            sheetName: null,
            row: Math.min(start.row, end.row),
            column: Math.min(start.column, end.column),
            numRows: numRows,
            numColumns: numColumns
        }
    }

    private parseCell(cellNotation: string): ParsedCell {
        const match = cellNotation.match(/^([A-Z]+)([0-9]+)$/i);

        if (!match) throw new Error('Uncorrect format-cell')

        const letters = match[1].toUpperCase();
        const row = parseInt(match[2], 10);

        let column = 0;
        for (let i = 0; i < letters.length; i++) {
            column = column * 26 + (letters.charCodeAt(i) - 64);
        }

        return {
            row: row,
            column: column
        }
    }
}

export default new RangeUtils();