import { Utilities } from "../src/emulator/Utilities.js";

const utils = new Utilities();

describe('Utilities.computeDigest', () => {
    const stringTest = "Hello World";
    const numbersTest = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    it('Test MD5 Compare string', () => {
        const result = utils.computeDigest(Utilities.DigestAlgorithm.MD5, stringTest);
        const expected = [-79, 10, -115, -79, 100, -32, 117, 65, 5, -73, -87, -101, -25, 46, 63, -27];
        expect(result).toEqual(expected);
    });

    it('Test SHA1 Compare string', () => {
        const result = utils.computeDigest(Utilities.DigestAlgorithm.SHA_1, stringTest);
        const expected = [10, 77, 85, -88, -41, 120, -27, 2, 47, -85, 112, 25, 119, -59, -40, 64, -69, -60, -122, -48];
        expect(result).toEqual(expected);
    });

    it('Test SHA256 Compare string', () => {
        const result = utils.computeDigest(Utilities.DigestAlgorithm.SHA_256, stringTest);
        const expected = [-91, -111, -90, -44, 11, -12, 32, 64, 74, 1, 23, 51, -49, -73, -79, -112, -42, 44, 101, -65, 11, -51, -93, 43, 87, -78, 119, -39, -83, -97, 20, 110];
        expect(result).toEqual(expected);
    });

    it('Test SHA384 Compare string', () => {
        const result = utils.computeDigest(Utilities.DigestAlgorithm.SHA_384, stringTest);
        const expected = [-103, 81, 67, 41, 24, 107, 47, 106, -28, -95, 50, -98, 126, -26, -58, 16, -89, 41, 99, 99, 53, 23, 74, -58, -73, 64, -7, 2, -125, -106, -4, -56, 3, -48, -23, 56, 99, -89, -61, -39, 15, -122, -66, -18, 120, 47, 79, 63];
        expect(result).toEqual(expected);
    });

    it('Test SHA512 Compare string', () => {
        const result = utils.computeDigest(Utilities.DigestAlgorithm.SHA_512, stringTest);
        const expected = [44, 116, -3, 23, -19, -81, -40, 14, -124, 71, -80, -44, 103, 65, -18, 36, 59, 126, -73, 77, -46, 20, -102, 10, -79, -71, 36, 111, -77, 3, -126, -14, 126, -123, 61, -123, -123, 113, -98, 14, 103, -53, -38, 13, -86, -113, 81, 103, 16, 100, 97, 93, 100, 90, -30, 122, -53, 21, -65, -79, 68, 127, 69, -101];
        expect(result).toEqual(expected);
    });

    it('Test MD5 Compare numbers', () => {
        const result = utils.computeDigest(Utilities.DigestAlgorithm.MD5, numbersTest);
        const expected = [-123, -106, -63, -81, 85, -79, 75, 123, 50, 1, 18, -108, 79, -53, -123, 54];
        expect(result).toEqual(expected);
    });

    it('Test SHA1 Compare numbers', () => {
        const result = utils.computeDigest(Utilities.DigestAlgorithm.SHA_1, numbersTest);
        const expected = [-74, -59, 17, -121, 59, 7, -89, 53, 19, 22, 27, 20, 45, 52, 75, 123, -124, 92, -84, -17];
        expect(result).toEqual(expected);
    });

    it('Test SHA256 Compare numbers', () => {
        const result = utils.computeDigest(Utilities.DigestAlgorithm.SHA_256, numbersTest);
        const expected = [71, -28, -18, 127, 33, 31, 115, 38, 93, -47, 118, 88, -10, -30, 28, 19, 24, -67, 108, -127, -13, 117, -104, -30, 10, 39, 86, 41, -107, 66, -17, -49];
        expect(result).toEqual(expected);
    });

    it('Test SHA384 Compare numbers', () => {
        const result = utils.computeDigest(Utilities.DigestAlgorithm.SHA_384, numbersTest);
        const expected = [-6, -43, -10, 58, -31, -53, -55, 34, -7, -37, -30, 115, 122, 70, 122, 91, 119, -63, 111, 30, 81, 125, -28, -33, 89, -21, 66, 117, 3, 119, -72, -10, -38, -53, 108, 119, -19, -76, 75, -70, -98, -9, 58, 24, 63, -92, 97, 75];
        expect(result).toEqual(expected);
    });

    it('Test SHA512 Compare numbers', () => {
        const result = utils.computeDigest(Utilities.DigestAlgorithm.SHA_512, numbersTest);
        const expected = [-55, -97, -107, -58, -46, -72, -19, 90, 6, 89, 70, -32, -26, -92, -9, 106, 46, 123, -67, 95, -28, -40, -54, -110, 43, 127, 21, 55, -37, -15, 77, -78, 65, 69, 64, 63, 115, 106, 104, -99, 21, -91, -59, -25, 45, 39, 66, -66, -24, 84, 32, -27, 79, 120, 19, 67, -111, 37, 39, 63, 17, 45, 19, 58];
        expect(result).toEqual(expected);
    });
});


describe("Utilities.base64Encode", () => {
    const stringTest = "Hello test!"
    const numbersTest = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];

    it("Test encode string", () => {
        const result = utils.base64Encode(stringTest);
        const expected = 'SGVsbG8gdGVzdCE='
        expect(result).toEqual(expected);
    });

    it('Test encode numbers', () => {
        const result = utils.base64Encode(numbersTest);
        const expected = 'CQgHBgUEAwIBAA==';
        expect(result).toEqual(expected);
    });
});

describe("Utilities.base64Decode", () => {
    const stringTestBase64 = 'SGVsbG8gdGVzdCE='
    const numbersTestBase64 = 'CQgHBgUEAwIBAA==';

    it("Test decode string", () => {
        const result = String.fromCharCode(...utils.base64Decode(stringTestBase64));
        const expected = 'Hello test!'
        expect(result).toEqual(expected);
    });

    it('Test decode numbers', () => {
        const result = utils.base64Decode(numbersTestBase64);
        const expected = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
        expect(result).toEqual(expected);
    });
});

describe("Utilities.base64EncodeWebSafe", () => {
    const stringTest = " >?++"
    const numbersTest = [251, 255, 191];

    it("Test encode string", () => {
        const result = utils.base64EncodeWebSafe(stringTest);
        const expected = 'ID4_Kys='
        expect(result).toEqual(expected);
    });

    it('Test encode numbers', () => {
        const result = utils.base64EncodeWebSafe(numbersTest);
        const expected = '-_-_';
        expect(result).toEqual(expected);
    });
});

describe("Utilities.base64DecodeWebSafe", () => {
    const stringTest = 'ID4_Kys=';
    const numbersTest = '-_-_';

    it("Test decode string", () => {
        const result = String.fromCharCode(...utils.base64DecodeWebSafe(stringTest));
        const expected = " >?++"
        expect(result).toEqual(expected);
    });

    it('Test decode numbers', () => {
        const result = utils.base64DecodeWebSafe(numbersTest);
        const expected = [-5, -1, -65];
        expect(result).toEqual(expected);
    });
});