export type CellValueType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE';

export interface CellEntity {
    spreadsheet_id: string;
    sheet_id: number;
    row: number;
    col: number;
    value: string;
    value_type: CellValueType;
}