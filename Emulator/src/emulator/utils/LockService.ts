import { Lock } from "./Lock.js";


class LockService {
    private scriptLock: Lock

    constructor() {
        this.scriptLock = new Lock();
    }

    /**
     * Gets a lock that prevents any user from concurrently running a section of code.
     * A code section guarded by a script lock cannot be executed simultaneously regardless of the identity of the user.
     * Note that the lock is not actually acquired until Lock.tryLock(timeoutInMillis) or Lock.waitLock(timeoutInMillis) is called.
     * @returns A lock scoped to the script.
     */
    public getScriptLock(): Lock {
        return this.scriptLock;
    }
}

export default new LockService();