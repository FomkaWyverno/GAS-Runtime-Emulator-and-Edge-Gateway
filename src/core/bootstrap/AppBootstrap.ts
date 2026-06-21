import { BootStrap } from "./Bootstrap.js";
import PropertiesDataBootstrap from "./PropertiesDataBootstrap.js";
import RuntimeBootstrap from "./RuntimeBootstrap.js";
import SheetsDataBootstrap from "./SheetsDataBootstrap.js";


class AppBootstrap implements BootStrap {
    public async boot() {
        console.log('[AppBoot] - Phase 1 | Data sheet sync');
        await SheetsDataBootstrap.boot();
        console.log(`[AppBoot] - Phase 2 | Insert default script properties`);
        PropertiesDataBootstrap.boot();
        console.log(`[AppBoot] - Phase 3 | Start runtime Apps Script code`);
        RuntimeBootstrap.boot();
    }
}

export default new AppBootstrap();