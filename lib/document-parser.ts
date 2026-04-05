/**
 * Document parsing pipeline for PDF, DOCX, PPTX, and plain-text files.
 *
 * Uses `pdf-parse` for PDF files and `officeparser` for Office documents
 * (DOCX, PPTX, XLSX). Falls back to raw text extraction for plain-text
 * formats (TXT, MD, CSV, JSON, HTML, XML).
 */

export type ParseResult = {
    text: string;
    pageCount: number | null;
    mimeType: string;
    parserUsed: 'pdf-parse' | 'officeparser' | 'text' | 'none';
    truncated: boolean;
};

/** Maximum extracted text length forwarded to the AI pipeline. */
const MAX_TEXT_LENGTH = 120_000;

const TEXT_EXTENSIONS = ['.txt', '.md', '.csv', '.json', '.html', '.xml'];

const OFFICE_MIME_TYPES = new Set([
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/msword', // .doc (legacy — officeparser supports it)
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.ms-excel', // .xls
]);

const OFFICE_EXTENSIONS = new Set(['.docx', '.pptx', '.xlsx', '.doc', '.ppt', '.xls']);

function getExtension(fileName: string): string {
    const dotIndex = fileName.lastIndexOf('.');
    return dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : '';
}

function isPlainText(file: File): boolean {
    if (file.type.startsWith('text/')) {
        return true;
    }

    return TEXT_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
}

function isOfficeDocument(file: File): boolean {
    if (OFFICE_MIME_TYPES.has(file.type)) {
        return true;
    }

    return OFFICE_EXTENSIONS.has(getExtension(file.name));
}

function isPdf(file: File): boolean {
    if (file.type === 'application/pdf') {
        return true;
    }

    return getExtension(file.name) === '.pdf';
}

function truncateText(text: string): { text: string; truncated: boolean } {
    if (text.length <= MAX_TEXT_LENGTH) {
        return { text, truncated: false };
    }

    return { text: text.slice(0, MAX_TEXT_LENGTH), truncated: true };
}

/**
 * Parse a PDF file into text using `pdf-parse`.
 */
async function parsePdf(buffer: Buffer): Promise<ParseResult> {
    // pdf-parse is a CommonJS module, use dynamic import
    const pdfParse = (await import('pdf-parse')).default;
    const result = await pdfParse(buffer);

    const { text, truncated } = truncateText(result.text?.trim() ?? '');

    return {
        text,
        pageCount: result.numpages ?? null,
        mimeType: 'application/pdf',
        parserUsed: 'pdf-parse',
        truncated,
    };
}

/**
 * Parse a DOCX/PPTX/XLSX file into text using `officeparser`.
 */
async function parseOfficeDocument(buffer: Buffer, mimeType: string): Promise<ParseResult> {
    const officeparser = await import('officeparser');
    const rawText: string = await officeparser.parseOfficeAsync(buffer);

    const { text, truncated } = truncateText(rawText?.trim() ?? '');

    return {
        text,
        pageCount: null,
        mimeType,
        parserUsed: 'officeparser',
        truncated,
    };
}

/**
 * Read a plain-text file directly from its buffer.
 */
async function parsePlainText(buffer: Buffer, mimeType: string): Promise<ParseResult> {
    const raw = buffer.toString('utf-8');
    const { text, truncated } = truncateText(raw.trim());

    return {
        text,
        pageCount: null,
        mimeType: mimeType || 'text/plain',
        parserUsed: 'text',
        truncated,
    };
}

/**
 * Top-level entry point for document parsing.
 *
 * Accepts a File and extracts text using the appropriate parser
 * based on MIME type and file extension. The returned text is
 * ready to be forwarded to the AI extraction pipeline.
 */
export async function parseDocument(file: File): Promise<ParseResult> {
    const buffer = Buffer.from(await file.arrayBuffer());

    if (isPdf(file)) {
        return parsePdf(buffer);
    }

    if (isOfficeDocument(file)) {
        return parseOfficeDocument(buffer, file.type || 'application/octet-stream');
    }

    if (isPlainText(file)) {
        return parsePlainText(buffer, file.type);
    }

    // Unsupported format — return empty result so the caller can
    // continue with metadata-only flow instead of erroring out.
    return {
        text: '',
        pageCount: null,
        mimeType: file.type || 'application/octet-stream',
        parserUsed: 'none',
        truncated: false,
    };
}
