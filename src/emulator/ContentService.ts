
export enum MimeType {
    CSV = 'text/csv',
    ICAL = 'text/calendar',
    JAVASCRIPT = 'text/javascript',
    JSON = 'application/json',
    TEXT = 'text/plain',
    VCARD = 'text/vcard'
}

export class TextOutput {
    private content: string = "";
    private mimeType: MimeType = MimeType.TEXT;

    constructor(content?: string) {
        if (content !== undefined) {
            this.content = content;
        }
    }

    public getContent(): string {
        return this.content;
    }

    public setContent(content: string): TextOutput {
        this.content = content;
        return this;
    }

    public getMimeType(): MimeType {
        return this.mimeType;
    }

    public setMimeType(mimeType: MimeType): TextOutput {
        this.mimeType = mimeType;
        return this;
    }

    public append(content: string): TextOutput {
        this.content += content;
        return this;
    }
}

export class ContentService {
    private constructor() {}

    public static readonly MimeType = MimeType;

    /**
     * Create a new TextOutput object that can serve the given content.
     * @param content the content to serve.
     * @returns the new TextOutput object.
     */
    public static createTextOutput(content?: string): TextOutput {
        return new TextOutput(content);
    }
}