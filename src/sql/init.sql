-- Аркуші
CREATE TABLE IF NOT EXISTS sheets (
    sheet_id INT NOT NULL,
    spreadsheet_id VARCHAR(255) NOT NULL,
    name VARCHAR(191) NOT NULL,
    sheet_index INT NOT NULL,

    PRIMARY KEY (sheet_id, spreadsheet_id),
    UNIQUE KEY uk_spreadsheet_sheet_name (spreadsheet_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Таблиця для клітинок
CREATE TABLE IF NOT EXISTS cells (
    sheet_id INT NOT NULL,
    row INT NOT NULL,
    col INT NOT NULL,
    value TEXT,
    value_type VARCHAR(255),
    PRIMARY KEY (sheet_id, row, col),
    FOREIGN KEY (sheet_id) REFERENCES sheets(sheet_id, spreadsheet_id) ON DELETE CASCADE

    -- Індексація
    INDEX idx_range_lookup (sheet_id, row, col)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ПропертіСервіс
CREATE TABLE IF NOT EXISTS `script_properties` (
    `property_key` VARCHAR(255) NOT NULL,
    `property_value` TEXT NOT NULL,
    
    PRIMARY KEY (`property_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;