import path from "path";
import fs from 'fs'


const CONFIG_PATH = path.join('dotenv', 'config.json');

if (!fs.existsSync(CONFIG_PATH)) throw new Error('Config file not exists!');

const rawConfig = fs.readFileSync(CONFIG_PATH, 'utf-8');
const jsonConfig = JSON.parse(rawConfig);

const AppConfig = {
    apps_script_path_src: jsonConfig.apps_script_path_src as string,
    database: {
        url: jsonConfig.database.url as string
    },
    gas: {
        path_to_code: jsonConfig.gas.path_to_code as string,
        activeSpreadsheetId: jsonConfig.gas.activeSpreadsheetId as string,
        defaultScriptProperty: jsonConfig.gas.defaultScriptProperty as Record<string,string>
    },
    sync: {
        spreadsheetId: jsonConfig.sync.spreadsheetId as string,
        sheets: jsonConfig.sync.sheets as string[]
    }
}

export default AppConfig;