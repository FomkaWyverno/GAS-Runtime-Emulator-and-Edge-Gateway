import CellUtil from "../src/core/utils/CellUtil.js";


describe("CellUtil.getCellType", () => {
    const testValues = [
            "09.04.2026 15:30:55",
            "09.04.2026 17:02:29",
            "09.04.2026 17:10:54",
            "09.04.2026 17:14:48",
            "09.04.2026 17:23:02",
            "19.04.2026 19:08:59",
            "19.04.2026 20:37:20",
            "03.08.2026 23:58:20",
        ];
    it.each(testValues)('should identify "%s" as DATE type', testDate => {
        expect(CellUtil.getCellType(testDate)).toEqual('DATE');
    });
});