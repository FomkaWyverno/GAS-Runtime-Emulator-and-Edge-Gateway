-- Таблиця для аркушів
CREATE TABLE IF NOT EXISTS sheets (
    id INT PRIMARY KEY AUTOINCREMENT,
    spreadsheet_id VARCHAR(255) NOT NULL,
    name TEXT NOT NULL,
    sheet_index INT NOT NULL
);

-- Таблиця для клітинок
CREATE TABLE IF NOT EXISTS cells (
    sheet_id INT NOT NULL,
    row INT NOT NULL,
    col INT NOT NULL,
    value TEXT,
    value_type VARCHAR(255),
    PRIMARY KEY (sheet_id, row, col),
    FOREIGN KEY (sheet_id) REFERENCES sheets(id) ON DELETE CASCADE

    -- Індексація
    INDEX idx_range_lookup (sheet_id, row, col)
);