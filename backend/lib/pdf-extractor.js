import pdfjs from 'pdfjs-dist/legacy/build/pdf.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { getDocument } = pdfjs;

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// For pdfjs-dist 2.16.x, we need to handle the worker differently
// First, let's create a NodeCanvasFactory for Node.js environment
const NodeCanvasFactory = {
  create(width, height) {
    return {
      width,
      height,
      getContext() {
        return {
          fillRect: () => {},
          drawImage: () => {},
          getImageData: () => ({ data: new Uint8Array(0) }),
          putImageData: () => {},
          createImageData: () => ({ data: new Uint8Array(0) }),
          setTransform: () => {},
          drawText: () => {},
          scale: () => {},
          transform: () => {},
          rect: () => {},
          clip: () => {},
        };
      },
      toBuffer() {
        return Buffer.from([]);
      },
      toDataURL() {
        return '';
      },
    };
  },
  reset() {},
};

// Instead of setting GlobalWorkerOptions, we'll use the disableWorker option
// This is a workaround for Node.js environments with this version of pdfjs-dist

/**
 * Extract text content from a PDF buffer
 * @param {Buffer} buffer PDF file as Buffer
 * @returns {Promise<string>} Extracted text content
 */
export async function extractTextFromPdf(buffer) {
  try {
    // Load the PDF document with worker disabled
    const loadingTask = getDocument({
      data: buffer,
      canvasFactory: NodeCanvasFactory,
      disableWorker: true,
    });
    
    
    const pdf = await loadingTask.promise;

    let fullText = '';

    // Iterate through each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Extract text from the page
      const pageText = textContent.items.map((item) => item.str).join(' ');

      fullText += pageText + '\n';
    }

    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
}

// The rest of your functions remain unchanged
export function convertNepaliDigitsToEnglish(input) {
  if (!input) return input;
  const nepaliDigits = '०१२३४५६७८९';
  return input.replace(/[०-९]/g, (d) => String(nepaliDigits.indexOf(d)));
}

export function convertNepaliToGregorianDate(nepaliDate) {
  if (!nepaliDate || !nepaliDate.match(/^\d{4}-\d{2}-\d{2}$/)) return nepaliDate;

  // Convert Nepali digits if present
  nepaliDate = convertNepaliDigitsToEnglish(nepaliDate);

  // Extract year, month, day
  const [year, month, day] = nepaliDate.split('-').map(Number);

  // Simple approximation: Nepali year is ~56-57 years ahead of Gregorian
  const gregorianYear = year - 57;

  return `${gregorianYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

export function extractDataFromText(text) {
  // Define regex patterns for Nepali National ID cards
  const patterns = {
    idNumber: /(?:(\d{3}-\d{3}-\d{4})|(०[०-९]{2}-[०-९]{3}-[०-९]{4}))/i,
    surname: /SURNAME\s+([A-Za-z\s]+)/i,
    givenName: /GIVEN NAME\s+([A-Za-z\s]+)/i,
    fullName: /NAME[:\s]*([A-Za-z\s]+)/i,
    dobGregorian: /DATE OF (?:BIRTH|GATH)[:\s]*(\d{4}-\d{2}-\d{2}|\d{2}[/.-]\d{2}[/.-]\d{4})/i,
    dobNepali: /(?:जन्म मिति|२०३४-१०-२३)[:\s]*([०-९]{4}-[०-९]{2}-[०-९]{2}|\d{4}-\d{2}-\d{2})/i,
    gender: /SEX[:\s]*([MF])/i,
    nationality: /(?:NATIONALITY|ONALITY)[:\s]*([A-Za-z]+)/i,
    mothersName: /MOTHER'S NAME[:\s]*([A-Za-z\s]+)/i,
    fathersName: /FATHER'S NAME[:\s]*([A-Za-z\s]+)/i,
    issueDate: /(?:DATE OF ISSUE|जरी बिति)[:\s]*(\d{2}-\d{2}-\d{4}|\d{2}[/.-]\d{2}[/.-]\d{4})/i,
  };

  const extractedData = {};

  // Extract each field using its pattern
  Object.entries(patterns).forEach(([field, pattern]) => {
    const match = text.match(pattern);
    extractedData[field] = match ? match[1] || match[2] || '' : null;
  });

  // Process full name from surname and given name if available
  if (extractedData.surname && extractedData.givenName) {
    extractedData.fullName = `${extractedData.givenName} ${extractedData.surname}`.trim();
  }

  // Process ID number
  if (extractedData.idNumber && extractedData.idNumber.match(/[०-९]/)) {
    extractedData.nepaliIdNumber = extractedData.idNumber;
    extractedData.idNumber = convertNepaliDigitsToEnglish(extractedData.idNumber);
  }

  // Process date of birth
  if (extractedData.dobNepali) {
    const nepaliDate = convertNepaliDigitsToEnglish(extractedData.dobNepali);
    extractedData.dobNepali = nepaliDate;
    extractedData.dob = convertNepaliToGregorianDate(nepaliDate);
  } else if (extractedData.dobGregorian) {
    // Standardize date format if needed
    extractedData.dob = extractedData.dobGregorian;
  }

  return extractedData;
}

export function extractNepalIdData(text) {
  // First use the general extraction function
  const data = extractDataFromText(text);

  // Additional processing specific to Nepali IDs
  if (!data.idNumber) {
    const idMatches = text.match(/(\d{3}[\s-]?\d{3}[\s-]?\d{4})/g);
    if (idMatches && idMatches.length > 0) {
      data.idNumber = idMatches[0].replace(/\s/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }

    const nepaliIdMatches = text.match(/([०-९]{3}[\s-]?[०-९]{3}[\s-]?[०-९]{4})/g);
    if (nepaliIdMatches && nepaliIdMatches.length > 0) {
      data.nepaliIdNumber = nepaliIdMatches[0];
      const englishDigits = convertNepaliDigitsToEnglish(nepaliIdMatches[0]);
      data.idNumber = englishDigits.replace(/\s/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
  }

  if (!data.fullName) {
    const nameMatches = text.match(/(?:NAME|नाम)[:\s]*([A-Za-z\s]+)/i);
    if (nameMatches && nameMatches[1]) {
      data.fullName = nameMatches[1].trim();
    }
  }

  if (!data.dob) {
    const dobMatches = text.match(/(?:BIRTH|DOB|जन्म)[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i);
    if (dobMatches && dobMatches[1]) {
      const [day, month, year] = dobMatches[1].split(/[/-]/).map(Number);
      data.dob = `${year < 100 ? '19' + year : year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
  }

  return data;
}

export function extractAllPossibleData(text) {
  // Combine results from both extraction methods
  const generalData = extractDataFromText(text);
  const nepalData = extractNepalIdData(text);

  // Merge the results, preferring nepalData when both have values
  const combinedData = { ...generalData };

  Object.entries(nepalData).forEach(([key, value]) => {
    if (value) combinedData[key] = value;
  });

  return combinedData;
}