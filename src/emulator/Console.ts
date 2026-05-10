class ConsoleEmulator {
    /**
     * Дублюємо логіку Console.log із Google Apps Script
     * @param message повідомлення або об'єкт
     * @param args додаткові аргументи
     */
    log(message: any, ...args: any[]): void {
        console.log(message, ...args);
    }
}

export { ConsoleEmulator as Console }