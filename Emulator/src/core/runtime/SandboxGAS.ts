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
import { Range } from "../../emulator/sheets/Range.js";
import vm from 'node:vm'
import fs from 'node:fs'
import path from "node:path";
import { Cache } from "../../emulator/utils/Cache.js";
import { Lock } from "../../emulator/utils/Lock.js";
import { Blob } from "../../emulator/utils/Blob.js";

interface GasFile {
    filePath: string;
    code: string;
}

class SandboxGAS {
    private cachedFiles: GasFile[] = []; 
    private isInitialized = false;
    
    /**
     * Ініціалізація: викликається ОДИН РАЗ при старті програми.
     * Читає диск, сортує файли як у GAS і зберігає в оперативку.
     */
    public init() {
        if (this.isInitialized) return;

        const codeFolder = AppConfig.gas.path_to_code;
        const rawFiles = this.getFilesRecursively(codeFolder);

        rawFiles.sort((a, b) => {
            const pathA = a.replace(/\\/g, '/');
            const pathB = b.replace(/\\/g, '/');
            return pathA.localeCompare(pathB);
        });

        this.cachedFiles = rawFiles.map(filePath => ({
            filePath,
            code: fs.readFileSync(filePath, 'utf-8')
        }));

        this.isInitialized = true;
        console.log(`[GasScriptRunner] - Pre-loader ${this.cachedFiles.length} files. Ready to run.`);
    }

    private getContext(): vm.Context {
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
            console: Console,
            ContentService,
            Lock,
            LockService,
            PropertiesService,
            Utilities
        }

        sandbox.global = sandbox;

        return sandbox;
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

    /**
     * Один раз запускає у окремій пісочниці код GAS та виконує, всі наступні виклики функцій будуть ізольовані друг від друга
     * @param functionName назва функції
     * @param args аргументи функції
     * @returns результат виконаня функції
     */
    public execute(functionName: string, args: any[] = []): any {
        if (!this.isInitialized) throw new Error("GasScriptRunner is not initialized! Call init() first.");

        const sandbox = this.getContext();
        vm.createContext(sandbox);

        for (const file of this.cachedFiles) {
            vm.runInContext(file.code, sandbox, {
                filename: file.filePath
            });
        }

        const targetFunction = sandbox[functionName];
        if (typeof targetFunction !== 'function') throw new Error(`[GasScriptRunner] - Function "${functionName}" is not defined in global GAS scope!`);

        console.log(`[GasScriptRunner] - Insatiating clean VM execution for : ${functionName}()`);
        return targetFunction(...args);
    }
}

export default new SandboxGAS();