import GasEventEmitter from "../events/GasEventEmitter.ts";
import GasSynchronizerService from "../service/GasSynchronizerService.ts";
import { BootStrap } from "./Bootstrap.js";


class SynchronizerBootstrap implements BootStrap {
    public boot() {
        console.log(`[SynchronizerBootstrap] - Start registration for events for changes in Sheets`);
        GasEventEmitter.on('onUpdateRange', payload => GasSynchronizerService.enqueue('onUpdateRange', payload));
        GasEventEmitter.on('onInsertColumns', payload => GasSynchronizerService.enqueue('onInsertColumns', payload));
        GasEventEmitter.on('onMoveColumns', payload => GasSynchronizerService.enqueue('onMoveColumns', payload));
        GasEventEmitter.on('onAppendRow', payload => GasSynchronizerService.enqueue('onAppendRow', payload));
        GasEventEmitter.on('onClearContents', payload => GasSynchronizerService.enqueue('onClearContents', payload));
        GasEventEmitter.on('onDeleteColumns', payload => GasSynchronizerService.enqueue('onDeleteColumns', payload));
        GasEventEmitter.on('onDeleteRows', payload => GasSynchronizerService.enqueue('onDeleteRows', payload));
        GasEventEmitter.on('onInsertSheet', payload => GasSynchronizerService.enqueue('onInsertSheet', payload));
        console.log(`[SynchronizerBootstrap] - Registred for events for changes in Sheets`);
    }
}

export default new SynchronizerBootstrap();