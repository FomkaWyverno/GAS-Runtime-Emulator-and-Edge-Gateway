import Database from "../src/core/database/Database.ts";
import { Range } from "../src/emulator/sheets/Range.ts";
import { jest } from "@jest/globals"

describe('Range.ts - Cell Data Extraction & Date Handling Tests', () => {
    let mockSheet: any;
    let range: Range;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Database, 'query').mockImplementation(() => []);

        mockSheet = {
            getParent: () => ({ getId: () => 'mock_spreadsheet' }),
            getSheetId: () => 0
        };

        range = new Range(mockSheet, 1, 1, 1, 1);
    });

    afterEach(() => {
        jest.resetAllMocks();
    })


    describe('getValue()', () => {
        it('Test on Date of ISO string from Database', () => {
            (Database.query as jest.Mock).mockReturnValue([
                { value: '2026-08-05T11:21:09.000Z', value_type: 'DATE' }
            ]);

            const result = range.getValue();

            expect(result).toBeInstanceOf(Date);
            expect((result as Date).toISOString()).toBe('2026-08-05T11:21:09.000Z');
        });

        it('Test on Date of european time format string from Database', () => {
            (Database.query as jest.Mock).mockReturnValue([
                { value: "19.04.2026 20:37:20", value_type: 'DATE' }
            ]);

            const result = range.getValue();

            expect(result).toBeInstanceOf(Date);
            expect((result as Date).getFullYear()).toBe(2026);
            expect((result as Date).getMonth()).toBe(3);
            expect((result as Date).getDate()).toBe(19);
            expect((result as Date).getHours()).toBe(20);
            expect((result as Date).getMinutes()).toBe(37);
            expect((result as Date).getSeconds()).toBe(20);
        });

        it('Test on Date of american time format string from Database', () => {
            (Database.query as jest.Mock).mockReturnValue([
                { value: "08/05/2026 11:21:09", value_type: "DATE" }
            ]);

            const result = range.getValue();

            expect(result).toBeInstanceOf(Date);
            expect((result as Date).getMonth()).toBe(7);
            expect((result as Date).getDate()).toBe(5);
        });

        it('Test on broken date string must be return empty string', () => {
            (Database.query as jest.Mock).mockReturnValue([
                { value: 'broken_text', value_type: 'DATE' }
            ]);

            const result = range.getValue();

            expect(result).toBe('');
        });
    });


    describe('getValues() 2D Matrix', () => {
        it('Test 2D Arrya of Date', () => {
            const multiRange = new Range(mockSheet, 1, 1, 2, 2); // 2x2 сітка

            (Database.query as jest.Mock).mockReturnValue([
                { row: 1, col: 1, value: '05.08.2026 11:21:09', value_type: 'DATE' },
                { row: 1, col: 2, value: '42', value_type: 'NUMBER' },
                { row: 2, col: 1, value: null, value_type: 'DATE' },
                { row: 2, col: 2, value: 'true', value_type: 'BOOLEAN' },
            ]);

            const matrix = multiRange.getValues();

            expect(matrix[0][0]).toBeInstanceOf(Date);
            expect(matrix[0][1]).toBe(42);
            expect(matrix[1][0]).toBe(''); // Порожня комірка замість null
            expect(matrix[1][1]).toBe(true);
        });
    });
});