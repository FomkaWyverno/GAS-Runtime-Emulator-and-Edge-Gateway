import SandboxGAS from "../runtime/SandboxGAS.js";
import GoogleSheetsService from "../service/GoogleSheetsService.ts";
import { BootStrap } from "./Bootstrap.js";
import PropertiesDataBootstrap from "./PropertiesDataBootstrap.js";
import SheetsDataBootstrap from "./SheetsDataBootstrap.js";
import SynchronizerBootstrap from "./SynchronizerBootstrap.js";


class AppBootstrap implements BootStrap {
    public async boot() {
        console.log('[AppBoot] - Phase 1 | Start GoogleSheetService BatchUpdateWorker');
        GoogleSheetsService.startBatchUpdateWorker();
        console.log('[AppBoot] - Phase 2 | Data sheet sync');
        await SheetsDataBootstrap.boot();
        console.log(`[AppBoot] - Phase 3 | Insert default script properties`);
        PropertiesDataBootstrap.boot();
        console.log(`[AppBoot] - Phase 4 | Initialisation Synchronizer with Google Sheets.`)
        SynchronizerBootstrap.boot();
        console.log(`[AppBoot] - Phase 5 | Initialization SandboxGAS`);
        SandboxGAS.init();
    }
}

export default new AppBootstrap();