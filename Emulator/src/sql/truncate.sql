SET FOREIGN_KEY_CHECKS = 0; -- Вимкнули перевірку залежностей

-- Дропаємо всі таблиці
TRUNCATE cells;
TRUNCATE sheets;
TRUNCATE script_properties;

SET FOREIGN_KEY_CHECKS = 1; -- Увімкнути перевірку залежностей