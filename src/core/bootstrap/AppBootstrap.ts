import { BootStrap } from "./Bootstrap.js";
import SheetsDataBootstrap from "./SheetsDataBootstrap.js";


class AppBootstrap implements BootStrap {
    public async boot() {
        console.log('[Boot] - Phase 1 | Data sheet sync');
        SheetsDataBootstrap.boot();
        
    }
}

export default new AppBootstrap();