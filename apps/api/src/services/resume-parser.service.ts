import path from 'path';

/**
 * Resume text extraction.
 *
 * The old implementation converted the raw file bytes to ASCII, which only
 * "worked" for uncompressed PDFs (almost none) and never for DOCX (a zip).
 * That produced garbage text, so the analyzer had nothing real to score.
 * This service uses real parsers: pdf-parse for PDF, mammoth for DOCX.
 */

export class ResumeParseError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 422) {
    super(message);
    this.name = 'ResumeParseError';
    this.statusCode = statusCode;
  }
}

// Minimum characters of real text needed for a meaningful analysis.
export const MIN_RESUME_TEXT_LENGTH = 80;
// Cap to keep LLM prompt + DB row reasonable.
export const MAX_RESUME_TEXT_LENGTH = 20000;

function cleanText(text: string): string {
  return text
    .replace(/\u0000/g, '') // Postgres cannot store NUL bytes
    .replace(/^\s*-- \d+ of \d+ --\s*$/gm, '') // page markers added by pdf-parse
    .replace(/\r\n?/g, '\n')
    .replace(/[\u2022\u25CF\u25AA\u25E6\u2023\u2043\uF0B7\uF0A7]/g, '•') // normalise bullet glyphs
    .replace(/[ \t\u00A0]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function extractPdf(buffer: Buffer): Promise<string> {
  // pdf-parse v2 (modern pdf.js). v1 bundled a 2018 pdf.js that fails on many real-world PDFs.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PDFParse } = require('pdf-parse') as typeof import('pdf-parse');
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    return result.text || '';
  } catch (err: any) {
    if (/password/i.test(err?.message || '') || err?.name === 'PasswordException') {
      throw new ResumeParseError('This PDF is password-protected. Please upload an unlocked copy.');
    }
    throw new ResumeParseError('Could not read this PDF. The file may be corrupted — try re-exporting it.');
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

async function extractDocx(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mammoth = require('mammoth') as {
    extractRawText: (o: { buffer: Buffer }) => Promise<{ value: string }>;
  };
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch {
    throw new ResumeParseError('Could not read this DOCX file. Try saving it again or export it as PDF.');
  }
}

export async function extractResumeText(buffer: Buffer, fileName: string): Promise<string> {
  const ext = path.extname(fileName).toLowerCase();

  let raw: string;
  if (ext === '.pdf') {
    raw = await extractPdf(buffer);
  } else if (ext === '.docx') {
    raw = await extractDocx(buffer);
  } else if (ext === '.doc') {
    throw new ResumeParseError('Legacy .doc files are not supported. Please save as .docx or PDF and upload again.', 415);
  } else {
    throw new ResumeParseError('Unsupported file type. Please upload a PDF or DOCX.', 415);
  }

  const text = cleanText(raw);

  if (text.length < MIN_RESUME_TEXT_LENGTH) {
    throw new ResumeParseError(
      'No readable text found in this file. It looks like a scanned/image-only resume — export a text-based PDF (e.g. from Word, Google Docs or Overleaf) and try again.'
    );
  }

  return text.slice(0, MAX_RESUME_TEXT_LENGTH);
}
