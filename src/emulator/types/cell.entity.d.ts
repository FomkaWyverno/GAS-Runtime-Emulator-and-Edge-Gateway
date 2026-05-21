export type CellValueType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'NULL';

export interface CellEntity {
    spreadsheet_id: string;
    sheet_id: number;
    row: number;
    col: number;
    value: string | null;
    value_type: CellValueType;
}