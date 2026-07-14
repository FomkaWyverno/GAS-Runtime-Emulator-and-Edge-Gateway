export interface ParsedRange {
    sheetName: string | null;
    row: number;
    column: number;
    numRows: number;
    numColumns: number;
}

export interface RangeToA1Options {
    sheetName?: string | null;
    row: number;
    column: number;
    numRows?: number;
    numColumns?: number;
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
            sheetName: sheetName,
            row: Math.min(start.row, end.row),
            column: Math.min(start.column, end.column),
            numRows: numRows,
            numColumns: numColumns
        }
    }

    public toA1Notation(options: RangeToA1Options): string {
        const { sheetName, row, column, numRows = 1, numColumns = 1 } =  options;
    
        if (row <= 0 || column <= 0) throw new Error(`Row and column must be greater than 0!`);

        const startLetters = this.getColLetters(column);
        const startCell = `${startLetters}${row}`;

        let rangePart = startCell;

        if (numRows > 1 || numColumns > 1) {
            const endRow = row + numRows - 1;
            const endCol = column + numColumns - 1;
            const endLetters = this.getColLetters(endCol);
            rangePart = `${startCell}:${endLetters}${endRow}`;
        }

        if (sheetName) return `'${sheetName}'!${rangePart}`;

        return rangePart;
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

    /**
     * Конвертує номер колонки (1 -> A, 28 -> AB) у літери.
     */
    private getColLetters(col: number): string {
        let temp = col;
        let letters = '';

        while (temp > 0) {
            const modulo = (temp - 1) % 26;
            letters = String.fromCharCode(65 + modulo) + letters;
            temp = Math.floor((temp - modulo) / 26);
        }

        return letters;
    }
}

export default new RangeUtils();