export interface ExtractedFileResult {
  text: string;
  fileName: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'md' | 'image';
  pageCount?: number;
}

/**
 * Extracts plain text from user uploaded files (.pdf, .docx, .txt, .md).
 * Dynamically imports pdfjs-dist and mammoth only when needed to optimize startup
 * and avoid global scope collisions.
 */
export async function extractTextFromFile(file: File): Promise<ExtractedFileResult> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  // Check if image
  if (['png', 'jpg', 'jpeg', 'webp', 'heic'].includes(ext)) {
    return {
      text: '',
      fileName: file.name,
      fileType: 'image',
    };
  }

  // 1. PDF extraction
  if (ext === 'pdf') {
    try {
      const pdfjsLib = await import('pdfjs-dist');

      // Configure worker if needed
      try {
        if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.0.379'}/build/pdf.worker.min.mjs`;
        }
      } catch {
        // Continue if worker fails or already set
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
      }

      const trimmed = fullText.trim();
      if (!trimmed) {
        throw new Error('PDF contains no readable text or is a scanned image');
      }

      return {
        text: trimmed,
        fileName: file.name,
        fileType: 'pdf',
        pageCount: pdf.numPages,
      };
    } catch (err: any) {
      console.error('PDF extraction failed:', err);
      throw new Error(`Failed to read PDF: ${err.message || 'Corrupt file'}`);
    }
  }

  // 2. DOCX extraction using mammoth
  if (ext === 'docx') {
    try {
      const mammothModule = await import('mammoth');
      const mammoth = (mammothModule as any).default || mammothModule;
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const trimmed = result.value.trim();
      if (!trimmed) {
        throw new Error('DOCX document is empty');
      }
      return {
        text: trimmed,
        fileName: file.name,
        fileType: 'docx',
      };
    } catch (err: any) {
      console.error('DOCX extraction failed:', err);
      throw new Error(`Failed to read DOCX: ${err.message || 'Corrupt file'}`);
    }
  }

  // 3. Plain text or Markdown
  if (ext === 'txt' || ext === 'md') {
    try {
      const text = await file.text();
      const trimmed = text.trim();
      if (!trimmed) {
        throw new Error('Text file is empty');
      }
      return {
        text: trimmed,
        fileName: file.name,
        fileType: ext as 'txt' | 'md',
      };
    } catch (err: any) {
      console.error('Text extraction failed:', err);
      throw new Error(`Failed to read text file: ${err.message}`);
    }
  }

  throw new Error('Unsupported file type');
}
