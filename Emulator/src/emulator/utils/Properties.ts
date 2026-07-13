import Database from "../../core/database/Database.js";

export class Properties {
    /**
     * Gets the value associated with the given key in the current Properties store, or null if no such key exists.
     * @param key the key for the property value to retrieve
     * @returns the value associated with the given key in the current Properties store
     */
    public getProperty(key: string): string | null {
        const sql = 'SELECT `property_value` FROM `script_properties` WHERE `property_key` = ? LIMIT 1;';
        
        const result = Database.query<{property_value: string}>(sql, [key]);
        const value = result[0]?.property_value;

        return value !== undefined ? value : null;
    }

    /**
     * Sets the given key-value pair in the current Properties store.
     * @param key the key for the property
     * @param value the value to associate with the key
     * @returns this Properties store, for chaining
     */
    public setProperty(key: string, value: string): Properties {
        const sql = 'INSERT INTO `script_properties` (`property_key`, `property_value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `property_value` = VALUES(`property_value`);';
        Database.query(sql, [key, value]);

        return this;
    } 
}