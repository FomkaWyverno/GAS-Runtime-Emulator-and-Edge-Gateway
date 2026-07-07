import { threadId } from "worker_threads";


const globalSharedBuffer = new SharedArrayBuffer(8);

export class Lock {
    private lockArray: Int32Array;

    constructor() {
        this.lockArray = new Int32Array(globalSharedBuffer);
    }

    /**
     * Attempts to acquire the lock, timing out with an exception after the provided number of milliseconds.
     * This method is the same as tryLock(timeoutInMillis) except that it throws an exception when the lock could not be acquired instead of returning false.
     * @param timeoutInMillis 
     */
    public waitLock(timeoutInMillis: number) {
        if (Atomics.load(this.lockArray, 1) === threadId) return; // Якщо воркер наш володіє локом, йдемо далі

        const startTime = Date.now();

        while (true) {
            const oldValue = Atomics.compareExchange(this.lockArray, 0, 0, 1);

            if (oldValue === 0) {
                Atomics.store(this.lockArray, 1, threadId);
                return;
            }
            const elapsed = Date.now() - startTime;
            const remainingTime = timeoutInMillis - elapsed;

            if (remainingTime <= 0) {
                throw new Error('Timeout occurred before obtaining a lock')
            }

            Atomics.wait(this.lockArray, 0, 1, remainingTime); // Потік очікує, поки у спільній памятї
        }
    }

    /**
     * Releases the lock, allowing other processes waiting on the lock to continue.
     * The lock is automatically released when the script terminates,
     * but for efficiency it is best to release it as soon as you no longer need exclusive access to a section of code.
     * This method has no effect if the lock has not been acquired.
     * Note that if you are working with a spreadsheet, you should call SpreadsheetApp.flush()
     * prior to releasing the lock, to commit all pending changes to the spreadsheet while you still have exclusive access to it.
     */
    public releaseLock() {
        if (Atomics.load(this.lockArray, 1) !== threadId) return;

        Atomics.store(this.lockArray, 1, 0);
        const oldValue = Atomics.exchange(this.lockArray, 0, 0);
        if (oldValue === 1) Atomics.notify(this.lockArray, 0, 1);
    }

    public hasLock(): boolean {
        return Atomics.load(this.lockArray, 1) === threadId;
    }
}