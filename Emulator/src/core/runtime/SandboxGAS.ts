import { HTTPResponse } from "../../emulator/network/HTTPResponse.ts";
import { UrlFetchApp } from "../../emulator/network/UrlFetchApp.ts";
import Sheets from "../../emulator/sheets/advanced/Sheets.ts";
import { SpreadsheetsCollection } from "../../emulator/sheets/advanced/SpreadsheetsCollection.ts";
import { Sheet } from "../../emulator/sheets/Sheet.ts";
import { Spreadsheet } from "../../emulator/sheets/Spreadsheet.ts";
import { SpreadsheetApp } from "../../emulator/sheets/SpreadsheetApp.ts";
import { Browser } from "../../emulator/ui/Browser.ts";
import { ButtonSet } from "../../emulator/ui/ButtonSet.ts";
import { Menu } from "../../emulator/ui/Menu.ts";
import { CacheService } from "../../emulator/utils/CacheService.ts";
import Console from "../../emulator/utils/Console.ts";
import { ContentService } from "../../emulator/utils/ContentService.ts";
import LockService from "../../emulator/utils/LockService.ts";
import { PropertiesService } from "../../emulator/utils/PropertiesService.ts";
import { Utilities } from "../../emulator/utils/Utilities.ts";
import AppConfig from "../config/AppConfig.ts";
import { Range } from "../../emulator/sheets/Range.ts";
import vm from 'node:vm'
import fs from 'node:fs'
import path from "node:path";
import { Cache } from "../../emulator/utils/Cache.ts";
import { Lock } from "../../emulator/utils/Lock.ts";

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
            Console,
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