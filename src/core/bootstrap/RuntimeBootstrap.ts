import { HTTPResponse } from "../../emulator/network/HTTPResponse.js";
import { UrlFetchApp } from "../../emulator/network/UrlFetchApp.js";
import Sheets from "../../emulator/sheets/advanced/Sheets.js";
import { SpreadsheetsCollection } from "../../emulator/sheets/advanced/SpreadsheetsCollection.js";
import { Sheet } from "../../emulator/sheets/Sheet.js";
import { Spreadsheet } from "../../emulator/sheets/Spreadsheet.js";
import { SpreadsheetApp } from "../../emulator/sheets/SpreadsheetApp.js";
import { Browser } from "../../emulator/ui/Browser.js";
import { ButtonSet } from "../../emulator/ui/ButtonSet.js";
import { Menu } from "../../emulator/ui/Menu.js";
import { CacheService } from "../../emulator/utils/CacheService.js";
import Console from "../../emulator/utils/Console.js";
import { ContentService } from "../../emulator/utils/ContentService.js";
import LockService from "../../emulator/utils/LockService.js";
import { PropertiesService } from "../../emulator/utils/PropertiesService.js";
import { Utilities } from "../../emulator/utils/Utilities.js";
import AppConfig from "../config/AppConfig.js";
import { Range } from "../../emulator/sheets/Range.ts";
import { BootStrap } from "./Bootstrap.js";
import vm from 'node:vm'
import fs from 'node:fs'
import path from "node:path";
import { Cache } from "../../emulator/utils/Cache.ts";
import { Lock } from "../../emulator/utils/Lock.ts";


class RuntimeBootstrap implements BootStrap {
    public boot() {
        const sandbox: vm.Context = {
            HTTPResponse,
            UrlFetchApp,
            Sheets,
            SpreadsheetsCollection,
            Range,
            Sheet,
            Spreadsheet,
            SpreadsheetApp,
            Browser,
            ButtonSet,
            Menu,
            Blob,
            Cache,
            CacheService,
            Console,
            ContentService,
            Lock,
            LockService,
            PropertiesService,
            Utilities
        }

        sandbox.global = sandbox;
        vm.createContext(sandbox);

        try {
            console.log('[RuntimeBootstrap] - Get apps script code folder');
            const appsScriptCodeFolder = AppConfig.gas.path_to_code;
            console.log('[RuntimeBootstrap] - Get apps script code files path');
            const appsScriptFiles = this.getFilesRecursively(appsScriptCodeFolder).sort((a, b) => {
                const pathA = a.replace(/\\/g, '/');
                const pathB = b.replace(/\\/g, '/');

                if (pathA < pathB) return -1;
                if (pathB > pathA) return 1;
                return 0;
            });

            console.log(`[RuntimeBootstrap] - Apps Script files: \n${appsScriptFiles.join('\n')}`);
            console.log(`[RuntimeBootstrap] - Read Apps Script files`)
            const appsScriptCode = appsScriptFiles.map(file => fs.readFileSync(file, 'utf-8')).join('\n');
    
            console.log(`[RuntimeBootstrap] - Start Apps Script code`);
            vm.runInContext(appsScriptCode, sandbox, { filename: appsScriptCodeFolder });
        } catch (err) {
            console.error('Error in runtime executing JS Code:', err);
        }
    }

    private getFilesRecursively(dir: string): string[] {
        let results: string[] = [];
        const list = fs.readdirSync(dir);

        list.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat && stat.isDirectory()) {
                if (file !== '@types') {
                    results = results.concat(this.getFilesRecursively(filePath));
                }
            } else if (file.endsWith('.js')) {
                results.push(filePath);
            }
        });

        return results;
    }
}

export default new RuntimeBootstrap();