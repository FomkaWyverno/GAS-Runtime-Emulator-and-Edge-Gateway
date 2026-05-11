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
     * Пряме хешування через crypto
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

    base64Encode(data: string | number[], charset: Charset = Utilities.Charset.UTF_8): string {
        const buffer = Array.isArray(data)
            ? Buffer.from(new Int8Array(data))
            : Buffer.from(data, charset as BufferEncoding)

        return buffer.toString('base64');
    }

    base64Decode(encoded: string, charset: Charset = Utilities.Charset.UTF_8): number[] {
        const buffer = Buffer.from(encoded, 'base64');
        return Array.from(new Int8Array(buffer));
    }

    base64EncodeWebSafe(data: string | number[], charset: Charset = Utilities.Charset.UTF_8): string {
        const base64 = this.base64Encode(data, charset);
        return base64
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    }

    base64DecodeWebSafe(encoded: string, charset: Charset = Utilities.Charset.UTF_8): number[] {
        const standartBase64 = encoded
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        return this.base64Decode(standartBase64, charset);
    }
}