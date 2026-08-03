import { CellValueType } from "./cell.entity.js";

export interface Cell {
    value: string;
    value_type: CellValueType;
}