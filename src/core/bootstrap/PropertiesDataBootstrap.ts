import AppConfig from "../config/AppConfig.js";
import Database from "../database/Database.js";
import { BootStrap } from "./Bootstrap.js";


class PropertiesDataBootstrap implements BootStrap {
    public boot() {
        const properties = AppConfig.gas.defaultScriptProperty;

        const keys = Object.keys(properties);
        const placeholder = keys.map(() => `(?, ?)`).join(', ');

        const sql = `
            INSERT INTO \`script_properties\` (property_key, property_value)
            VALUES ${placeholder};
        `;

        const flatValues = keys.reduce((acc, key) => {
            acc.push(key, properties[key]);
            return acc;
        }, [] as string[]);

        Database.query(sql, flatValues);
    }

}

export default new PropertiesDataBootstrap();