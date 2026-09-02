import { Worker } from "worker_threads";
import { Lock } from "../src/emulator/utils/Lock.js";


describe('Lock Class', () => {
    let lock: Lock;

    beforeEach(() => {
        lock = new Lock();
        if (lock.hasLock()) {
            lock.releaseLock();
        }
    });

    it('Should successfully acquire and release the lock', () => {
        expect(lock.hasLock()).toBe(false);

        lock.waitLock(1000);
        expect(lock.hasLock()).toBe(true);

        lock.releaseLock();
        expect(lock.hasLock()).toBe(false);
    });

    it('Should support reentrancy from the same thread', () => {
        lock.waitLock(1000);
        expect(lock.hasLock()).toBe(true);

        // Subsequent call on the same thread should not block or throw
        expect(() => lock.waitLock(1000)).not.toThrow();
        expect(lock.hasLock()).toBe(true);

        lock.releaseLock();
    });

    it('Should throw a timeout error if held by another thread', () => {
        // Mock the lock state as if held by a different thread (e.g., ID 999)
        const rawBuffer = (lock as any).lockArray as Int32Array;
        Atomics.store(rawBuffer, 0, 1); // 1 = Locked
        Atomics.store(rawBuffer, 1, 999); // Held by thread 999

        expect(() => lock.waitLock(50)).toThrow('Timeout occurred before obtaining a lock');

        // Clean up
        Atomics.store(rawBuffer, 0, 0);
        Atomics.store(rawBuffer, 1, 0);
    });

    it('Should not release the lock if it belongs to a different thread', () => {
        const rawBuffer = (lock as any).lockArray as Int32Array;
        Atomics.store(rawBuffer, 0, 1);
        Atomics.store(rawBuffer, 1, 999);

        // Attempting to release from current thread
        lock.releaseLock();

        // Buffer state must be remain untouched
        expect(Atomics.load(rawBuffer, 0)).toBe(1);
        expect(Atomics.load(rawBuffer, 1)).toBe(999);

        // Clean up
        Atomics.store(rawBuffer, 0, 0);
        Atomics.store(rawBuffer, 1, 0);
    });
});

describe('Lock Integration (Worker Threads)', () => {
    it('Should block the main thread until the worker releases the lock', (done) => {
        const workerScript = `
            const { parentPort, workerData } = require('worker_threads');
            const lockArray = new Int32Array(workerData.buffer);
            
            // Acquire lock in worker context
            Atomics.store(lockArray, 0, 1);
            Atomics.store(lockArray, 1, 999);
            
            parentPort.postMessage('LOCKED');

            setTimeout(() => {
                // Release lock after 200ms
                Atomics.store(lockArray, 1, 0);
                const oldValue = Atomics.exchange(lockArray, 0, 0);
                if (oldValue === 1) Atomics.notify(lockArray, 0, 1);
                parentPort.postMessage('RELEASED');
            }, 200);
        `;

        const lock = new Lock();
        const rawBuffer = (lock as any).lockArray.buffer;

        const worker = new Worker(workerScript, {
            eval: true,
            workerData: { buffer: rawBuffer }
        });

        worker.on('message', (msg) => {
            if (msg === 'LOCKED') {
                const start = Date.now();
                lock.waitLock(1000);
                const elapsed = Date.now() - start;

                expect(elapsed).toBeGreaterThanOrEqual(150);
                expect(lock.hasLock()).toBe(true);

                lock.releaseLock();
                worker.terminate();
                done();
            }
        })
    }, 5000);
});