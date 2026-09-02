import { CellValueType } from "../../emulator/@types/sheets/cell.entity.js";
import DateUtil from "./DateUtil.js";

export default {
    /**
     * Визначає тип значення для бази данних
     * @param value 
     * @returns тип комірки
     */
    getCellType(value: any): CellValueType {
        if (value === null || value === undefined) return 'STRING';
        if (typeof value === 'boolean') return 'BOOLEAN';
        if (typeof value === 'number') return 'NUMBER';

        if (DateUtil.parseDate(value) !== null) return 'DATE';

        return 'STRING';
    }
}