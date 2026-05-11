import crypto from 'node:crypto'

type DigestAlgorithm = typeof Utilities.DigestAlgorithm[keyof typeof Utilities.DigestAlgorithm]
type Charset = typeof Utilities.Charset[keyof typeof Utilities.Charset]

export class Utilities {
    public static readonly DigestAlgorithm = {
        MD2: "md2",
        MD5: "md5",
        SHA_1: "sha1",
        SHA_256: "sha256",
        SHA_384: "sha384",
        SHA_512: "sha512"
    } as const

    public static readonly Charset = {
        US_ASCII: "ascii",
        UTF_8: "utf8"
    } as const;

    /**
     * Compute a digest using the specified algorithm on the specified String value with the given character set.
     * @param algorithm A DigestAlgorithm to use.
     * @param value 	An input string value to compute a digest for.
     * @param charset   A Charset representing the input character set.
     * @returns A byte[] representing the output digest.
     */
    computeDigest(
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
    base64Encode(data: string | number[], charset: Charset = Utilities.Charset.UTF_8): string {
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
    base64Decode(encoded: string, charset: Charset = Utilities.Charset.UTF_8): number[] {
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
    base64EncodeWebSafe(data: string | number[], charset: Charset = Utilities.Charset.UTF_8): string {
        const base64 = this.base64Encode(data, charset);
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
    base64DecodeWebSafe(encoded: string, charset: Charset = Utilities.Charset.UTF_8): number[] {
        const standartBase64 = encoded
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        return this.base64Decode(standartBase64, charset);
    }

    /**
     * Get a UUID as a string (equivalent to using the java.util.UUID.randomUUID() method).
     * This identifier is not guaranteed to be unique across all time and space.
     * As such, do not use in situations where guaranteed uniqueness is required.
     * @returns A string representation of the UUID.
     */
    getUuid(): string {
        return crypto.randomUUID();
    }
}