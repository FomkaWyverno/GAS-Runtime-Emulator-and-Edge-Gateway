import SandboxGAS from "../runtime/SandboxGAS.ts";
import { BootStrap } from "./Bootstrap.js";
import PropertiesDataBootstrap from "./PropertiesDataBootstrap.js";
import SheetsDataBootstrap from "./SheetsDataBootstrap.js";


class AppBootstrap implements BootStrap {
    public async boot() {
        console.log('[AppBoot] - Phase 1 | Data sheet sync');
        await SheetsDataBootstrap.boot();
        console.log(`[AppBoot] - Phase 2 | Insert default script properties`);
        PropertiesDataBootstrap.boot();
        console.log(`[AppBoot] - Phase 3 | Initialization SandboxGAS`);
        SandboxGAS.init();
    }
}

export default new AppBootstrap();