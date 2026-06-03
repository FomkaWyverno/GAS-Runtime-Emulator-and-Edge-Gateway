
export async function asyncPool<T, R>(
    items: T[],
    concurrency: number,
    fn: (item: T) => Promise<R>
): Promise<R[]> {
    const results: R[] = [];
    const executing: Promise<any>[] = [];

    for (const item of items) {
        const p = Promise.resolve().then(() => fn(item));
        results.push(p as any);

        if (concurrency <= items.length) {
            const e: Promise<any> = p.then(() => executing.splice(executing.indexOf(e), 1));
            executing.push(e);

            if (executing.length >= concurrency) {
                await Promise.race(executing)
            }
        }
    }

    return Promise.all(results);
}