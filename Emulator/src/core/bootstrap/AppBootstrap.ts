import SandboxGAS from "../runtime/SandboxGAS.ts";
import { BootStrap } from "./Bootstrap.js";
import PropertiesDataBootstrap from "./PropertiesDataBootstrap.js";
import SheetsDataBootstrap from "./SheetsDataBootstrap.js";
import SynchronizerBootstrap from "./SynchronizerBootstrap.ts";


class AppBootstrap implements BootStrap {
    public async boot() {
        console.log('[AppBoot] - Phase 1 | Data sheet sync');
        await SheetsDataBootstrap.boot();
        console.log(`[AppBoot] - Phase 2 | Insert default script properties`);
        PropertiesDataBootstrap.boot();
        console.log(`[AppBoot] - Phase 3 | Initialisation Synchronizer with Google Sheets.`)
        SynchronizerBootstrap.boot();
        console.log(`[AppBoot] - Phase 4 | Initialization SandboxGAS`);
        SandboxGAS.init();
    }
}

export default new AppBootstrap();