import crypto from 'node:crypto'
import { Blob } from './Blob.js';

const DigestAlgorithmEnum = {
    MD2: "md2",
    MD5: "md5",
    SHA_1: "sha1",
    SHA_256: "sha256",
    SHA_384: "sha384",
    SHA_512: "sha512"
};

const CharsetEnum = {
    US_ASCII: "ascii",
    UTF_8: "utf8"
}

type DigestAlgorithm = typeof DigestAlgorithmEnum[keyof typeof DigestAlgorithmEnum]
type Charset = typeof CharsetEnum[keyof typeof CharsetEnum]

export class Utilities {
    public static DigestAlgorithm = DigestAlgorithmEnum;

    public static Charset = CharsetEnum;

    /**
     * Compute a digest using the specified algorithm on the specified String value with the given character set.
     * @param algorithm A DigestAlgorithm to use.
     * @param value 	An input string value to compute a digest for.
     * @param charset   A Charset representing the input character set.
     * @returns A byte[] representing the output digest.
     */
    public static computeDigest(
        algorithm: DigestAlgorithm,
        value: string | number[],
        charset: Charset = Utilities.Charset.UTF_8
    ): number[] {
        if (algorithm === Utilities.DigestAlgorithm.MD2) throw new Error("Unsupported MD2 algorithm");

        const input = Array.isArray(value)
            ? Buffer.from(new Int8Array(value))
            : Buffer.from(value, charset as BufferEncoding);

        const hash = crypto.createHash(algorithm).update(input).digest();

        return Array.from(new Int8Array(hash));
    }

    /**
     * Generates a base-64 encoded string from the given string in a specific character set. 
     * A Charset is a way of encoding characters such that they can be encoded. 
     * These are typically done in a binary format, which can generally be incompatible with certain data transmission protocols. 
     * To make the data compatible, they are generally encoded into base 64, which is a common encoding accepted by a variety of tools that cannot accept binary data. 
     * Base 64 is commonly used in internet protocols such as email, HTTP, or in XML documents.
     * @param data The string of data to encode.
     * @param charset A Charset specifying the charset of the input.
     * @returns The base-64 encoded representation of the input string with the given Charset.
     */
    public static base64Encode(data: string | number[], charset: Charset = Utilities.Charset.UTF_8): string {
        const buffer = Array.isArray(data)
            ? Buffer.from(new Int8Array(data))
            : Buffer.from(data, charset as BufferEncoding)

        return buffer.toString('base64');
    }

    /**
     * Decodes a base-64 encoded string into a byte array in a specific character set.
     * @param encoded The string of data to decode.
     * @param charset A Charset specifying the charset of the input.
     * @returns Byte[] — The raw data represented by the base-64 encoded argument as a byte array.
     */
    public static base64Decode(encoded: string, charset: Charset = Utilities.Charset.UTF_8): number[] {
        const buffer = Buffer.from(encoded, 'base64');
        return Array.from(new Int8Array(buffer));
    }

    /**
     * Generates a base-64 web-safe encoded string from the given string in a specific character set.
     * A Charset is a way of encoding characters such that they can be encoded.
     * These are typically done in a binary format, which can generally be incompatible with certain data transmission protocols.
     * To make the data compatible, they are generally encoded into base 64, which is a common encoding accepted by a variety of tools that cannot accept binary data.
     * Base 64 web-safe is commonly used in internet protocols such as email, HTTP, or in XML documents.
     * @param data The string or numbers of data to encode.
     * @param charset A Charset specifying the charset of the input.
     * @returns The base-64 web-safe encoded representation of the input string with the given Charset.
     */
    public static base64EncodeWebSafe(data: string | number[], charset: Charset = Utilities.Charset.UTF_8): string {
        const base64 = Utilities.base64Encode(data, charset);
        return base64
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    }

    /**
     * Decodes a base-64 web-safe encoded string into a byte array in a specific character set.
     * @param encoded The string of web-safe data to decode.
     * @param charset A Charset specifying the charset of the input.
     * @returns The raw data represented by the base-64 web-safe encoded argument as a byte array.
     */
    public static base64DecodeWebSafe(encoded: string, charset: Charset = Utilities.Charset.UTF_8): number[] {
        const standartBase64 = encoded
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        return Utilities.base64Decode(standartBase64, charset);
    }

    /**
     * Get a UUID as a string (equivalent to using the java.util.UUID.randomUUID() method).
     * This identifier is not guaranteed to be unique across all time and space.
     * As such, do not use in situations where guaranteed uniqueness is required.
     * @returns A string representation of the UUID.
     */
    public static getUuid(): string {
        return crypto.randomUUID();
    }

    /**
     * Formats date according to specification described in Java SE SimpleDateFormat class.
     * Please visit the specification at http://docs.oracle.com/javase/7/docs/api/java/text/SimpleDateFormat.html
     */
    public static formatDate(date: Date, timeZone: string, format: string): string {
        const options: Intl.DateTimeFormatOptions = {
            timeZone,
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
        };

        const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(date);
        const values: Record<keyof Intl.DateTimeFormatPartTypesRegistry, string> = parts.reduce((acc, p) => (acc[p.type] = p.value, acc), {} as any);

        const longMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
        const shortMonth = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);

        const hours24 = parseInt(values.hour, 10);
        const hours12 = hours24 % 12 || 12;

        const map: { [key: string]: string } = {
            'yyyy': values.year,
            'yy': values.year.slice(-2),
            'MMMM': longMonth,
            'MMM': shortMonth,
            'MM': values.month,
            'M': parseInt(values.month, 10).toString(),
            'dd': values.day,
            'd': parseInt(values.day, 10).toString(),
            'HH': values.hour,
            'H': hours24.toString(),
            'hh': hours12.toString().padStart(2, '0'),
            'h': hours12.toString(),
            'mm': values.minute,
            'ss': values.second,
            'a': hours24 >= 12 ? 'PM' : 'AM'
        };

        const regex = new RegExp(Object.keys(map).join('|'), 'g');

        return format.replace(regex, matched => map[matched]);
    }

    /**
     * Парсить рядок дати за специфікацією Java SE SimpleDateFormat.
     * @param dateString - рядок, який треба розпарсити (наприклад, "2026-06-06 14:30:00")
     * @param timeZone - таймзона (наприклад, "Europe/Kyiv")
     * @param format - паттерн формату (наприклад, "yyyy-MM-dd HH:mm:ss")
     * @returns Date | null
     */
    public static parseDate(dateString: string, timeZone: string, format: string): Date | null {
        if (!dateString || !format) throw new Error(`parseDate: dateString or format is empty (dateString="${dateString}", format="${format}")`);

        const runToPattern = (run: string): string => {
            switch (run) {
                case 'yyyy': return '(?<year>\\d{4})';
                case 'yy': return '(?<year>\\d{2})';
                case 'MMMM':
                case 'MMM': return '(?<monthName>[a-zA-Zа-яА-Я]+)';
                case 'MM': return '(?<month>\\d{2})';
                case 'M': return '(?<month>\\d{1,2})';
                case 'dd': return '(?<day>\\d{2})';
                case 'd': return '(?<day>\\d{1,2})';
                case 'HH': return '(?<hour>\\d{2})';
                case 'H': return '(?<hour>\\d{1,2})';
                case 'hh': return '(?<hour12>\\d{2})';
                case 'h': return '(?<hour12>\\d{1,2})';
                case 'mm': return '(?<minute>\\d{2})';
                case 'ss': return '(?<second>\\d{2})';
                case 'a': return '(?<ampm>AM|PM|am|pm)';
                default:
                    // невідомий run (напр. 'a' поза токеном 'a'? тут run завжди однолітерний або з довідника вище) —
                    // на випадок появи літери, що не входить у жоден кейс, екрануємо посимвольно
                    return run.replace(/[a-zA-Z]/g, c => c).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            }
        };

        let regexPattern = '';
        let i = 0;
        while (i < format.length) {
            const ch = format[i];
            if (/[a-zA-Zа-яА-Я]/.test(ch)) {
                let j = i + 1;
                while (j < format.length && format[j] === ch) j++;
                regexPattern += runToPattern(format.slice(i, j));
                i = j;
            } else {
                regexPattern += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                i++;
            }
        }

        let regex: RegExp;
        try {
            regex = new RegExp(`^${regexPattern}$`);
        } catch {
            throw new Error(`parseDate: "${dateString}" does not match format "${format}"`);
        }

        const match = dateString.match(regex);
        if (!match || !match.groups) throw new Error(`parseDate: "${dateString}" does not match format "${format}"`);

        const groups = match.groups;

        let year = groups['year'] ? parseInt(groups['year'], 10) : new Date().getFullYear();
        if (year < 100) {
            year += year >= 70 ? 1900 : 2000;
        }

        let month = 0;
        if (groups['month']) {
            month = parseInt(groups['month'], 10) - 1;
        } else if (groups['monthName']) {
            const monthsEn = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
            const monthsShortEn = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

            const lowerName = groups['monthName'].toLowerCase();
            let foundIdx = monthsEn.findIndex(m => m.startsWith(lowerName));
            if (foundIdx === -1) {
                foundIdx = monthsShortEn.findIndex(m => m.startsWith(lowerName));
            }
            if (foundIdx !== -1) month = foundIdx;
        }

        const day = groups['day'] ? parseInt(groups['day'], 10) : 1;

        let hour = 0;
        if (groups['hour']) {
            hour = parseInt(groups['hour'], 10);
        } else if (groups['hour12']) {
            hour = parseInt(groups['hour12'], 10);
            const ampm = groups['ampm'] ? groups['ampm'].toUpperCase() : '';
            if (ampm === 'PM' && hour < 12) hour += 12;
            if (ampm === 'AM' && hour === 12) hour = 0;
        }

        const minute = groups['minute'] ? parseInt(groups['minute'], 10) : 0;
        const second = groups['second'] ? parseInt(groups['second'], 10) : 0;

        const isoString = `${String(year).padStart(4, '0')}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}.000Z`;
        const utcDate = new Date(isoString);

        if (isNaN(utcDate.getTime())) throw new Error(`parseDate: parsed date is invalid for "${dateString}" with format "${format}"`);
        if (!timeZone) return utcDate;

        try {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone,
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric', second: 'numeric',
                hour12: false
            });

            const parts = formatter.formatToParts(utcDate);
            const partValues: Record<string, string> = parts.reduce((acc, p) => {
                acc[p.type] = p.value;
                return acc;
            }, {} as Record<string, string>);

            const tzYear = parseInt(partValues['year'] || '0', 10);
            const tzMonth = parseInt(partValues['month'] || '1', 10) - 1;
            const tzDay = parseInt(partValues['day'] || '1', 10);
            const tzHour = parseInt(partValues['hour'] || '0', 10);
            const tzMinute = parseInt(partValues['minute'] || '0', 10);
            const tzSecond = parseInt(partValues['second'] || '0', 10);

            const tzDateAsUtc = Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute, tzSecond);
            const targetAsUtc = Date.UTC(year, month, day, hour, minute, second);

            const diffMs = targetAsUtc - tzDateAsUtc;

            return new Date(utcDate.getTime() + diffMs);
        } catch (e) {
            return utcDate;
        }
    }

    /**
     * Create a new Blob object from a string, content type, and name.
     * Blobs are used in many Apps Script APIs that take binary data as input.
     * @param data The string for the blob, assumed UTF-8.
     * @param contentType The content type of the blob - can be null.
     * @param name The name of the blob - can be null.
     * @returns The newly created Blob.
     */
    public static newBlob(
        data: string | number[],
        contentType: string | null = null,
        name: string | null = null
    ): Blob {
        return new Blob(data, contentType, name);
    }
}