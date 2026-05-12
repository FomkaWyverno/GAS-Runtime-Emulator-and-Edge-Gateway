export class Blob {
    private bytes: Buffer;
    private contentType: string | null;
    private name: string | null;

    constructor(data: string | number[] | Buffer, contentType: string | null = null, name: string | null) {
        this.contentType = contentType;
        this.name = name;

        if (Buffer.isBuffer(data)) {
            this.bytes = data;
        } else if (Array.isArray(data)) {
            this.bytes = Buffer.from(new Int8Array(data));
        } else {
            this.bytes = Buffer.from(data, 'utf-8');
        }
    }

    public getBytes(): number[] {
        return Array.from(new Int8Array(this.bytes));
    }

    public setBytes(data: number[]): Blob {
        this.bytes = Buffer.from(new Int8Array(data));
        return this;
    }

    public setContentType(contentType: string | null): Blob {
        this.contentType = contentType;
        return this;
    }

    public getName(): string | null {
        return this.name;
    }

    public setName(name: string | null): Blob {
        this.name = name;
        return this;
    }

    public getDataAsString(charset: string = 'UTF-8'): string {
        const encoding = charset.toLowerCase().replace('-', '') as BufferEncoding;

        try {
            return this.bytes.toString(encoding);
        } catch {
            return this.bytes.toString('utf8');
        }
    }

    public setDataFromString(string: string, charset: string = 'UTF-8'): Blob {
        const encoding = charset.toLowerCase().replace('-', '') as BufferEncoding;
        this.bytes = Buffer.from(string, encoding);
        return this;
    }

    public copyBlob(): Blob {
        return new Blob(Buffer.from(this.bytes), this.contentType, this.name);
    }

    public getAs(contentType: string): Blob {
        const copy = this.copyBlob();
        copy.setContentType(contentType);
        return copy;
    }

    public isGoogleType(): boolean {
        return false;
    }

    public setContentTypeFromExtension(): Blob {
        if (this.name && this.name.includes('.')) {
            const ext = this.name.split('.').pop()?.toLowerCase();

            const mimeMap: Record<string, string> = {
                'json': 'application/json',
                'txt': 'text/plain',
                'html': 'text/html',
                'pdf': 'application/pdf',
                'png': 'image/png',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg'
            }

            if (ext && mimeMap[ext]) {
                this.contentType = mimeMap[ext];
            }
        }
        
        return this;
    }

}