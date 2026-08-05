export default class DateUtil {

    /**
     * Перевіряє, чи є об'єкт екземпляром Date (працює навіть для Node.js VM Sandbox)
     */
    public static isDateObject(val: any): val is Date {
        if (!val || typeof val !== 'object') return false;

        return Object.prototype.toString.call(val) === '[object Date]'
            || typeof (val as any).getTime === 'function';
    }

    /**
     * Парсить будь-який формат дати (ISO, EU/UA, US, GMT) у валідний об'єкт Date.
     * Якщо рядок не є датою або дата невалідна — повертає null.
     */
    public static parseDate(val: any): Date | null {
        if (val === null || val === undefined || val === '') return null;

        if (this.isDateObject(val)) {
            const time = val.getTime();
            return isNaN(time) ? null : val;
        }

        if (typeof val !== 'string') return null;

        const trimmed = val.trim();
        if (!trimmed) return null;

        const parseDateMatch = (match: RegExpMatchArray, isUS = false): Date | undefined => {
            const firstNum = parseInt(match[1], 10);
            const secondNum = parseInt(match[2], 10);
            
            const day = isUS ? secondNum : firstNum;
            const month = isUS ? firstNum : secondNum;

            const year = parseInt(match[3], 10);
            const hours = parseInt(match[4] || '0', 10);
            const minutes = parseInt(match[5] || '0', 10);
            const seconds = parseInt(match[6] || '0', 10);

            if (month >= 1 && month <= 12
                && day >= 1 && day <= 31
                && hours >= 0 && hours <= 24
                && minutes >= 0 && minutes <= 60
                && seconds >= 0 && seconds <= 60) {

                const date = new Date(year, month - 1, day, hours, minutes, seconds);
                if (!isNaN(date.getTime())) return date;
            }
        }

        // 1. ЄВРОПЕЙСЬКИЙ ФОРМАТ (Розділювач — КРАПКА: DD.MM.YYYY)
        const euRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:[\sT](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;
        const euMatch = trimmed.match(euRegex);

        if (euMatch) {
            const date = parseDateMatch(euMatch, false);
            if (date) return date;
        }

        // 2. АМЕРИКАНСЬКИЙ ФОРМАТ (Розділювач — СЛЕШ: MM/DD/YYYY)
        const usRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[\sT](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;
        const usMatch = trimmed.match(usRegex);

        if (usMatch) {
            const date = parseDateMatch(usMatch, true);
            if (date) return date;
        }

        // 3. ISO / Native JS Parsing (YYYY-MM-DD або GMT)
        if (isNaN(Number(trimmed))) {
            const parsed = new Date(trimmed);
            if (!isNaN(parsed.getTime())) return parsed;
        }

        return null;
    }
}