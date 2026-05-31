import RangeUtils, { ParsedRange } from "../src/emulator-utils/RangeUtils.js";


describe('RangeUtils.parseA1Notation', () => {
    it('Test full A1Notation', () => {
        const result: ParsedRange = {
            sheetName: 'Sheet1',
            row: 1,
            column: 1,
            numRows: 3,
            numColumns: 2
        }

        expect(result).toEqual(RangeUtils.parseA1Notation("'Sheet1'!A1:B3"))
    });

    it('Test full without \' A1Notation', () => {
        const result: ParsedRange = {
            sheetName: 'Sheet1',
            row: 1,
            column: 1,
            numRows: 3,
            numColumns: 2
        }

        expect(result).toEqual(RangeUtils.parseA1Notation("Sheet1!A1:B3"))
    });

    it('Test only range A1Notation', () => {
        const result: ParsedRange = {
            sheetName: null,
            row: 1,
            column: 1,
            numRows: 3,
            numColumns: 2
        }

        expect(result).toEqual(RangeUtils.parseA1Notation("A1:B3"))
    });

    it('Test single range A1Notation', () => {
        const result: ParsedRange = {
            sheetName: null,
            row: 1,
            column: 1,
            numRows: 1,
            numColumns: 1
        }

        expect(result).toEqual(RangeUtils.parseA1Notation("A1"))
    });
});