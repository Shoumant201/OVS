import * as pdfjs from "pdfjs-dist"

// Initialize PDF.js worker using CDN
import { GlobalWorkerOptions } from "pdfjs-dist"

// Set the worker source to CDN
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

/**
 * Extract text content from a PDF buffer
 * @param buffer PDF file as Buffer
 * @returns Extracted text content
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: buffer })
    const pdf = await loadingTask.promise

    let fullText = ""

    // Iterate through each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()

      // Extract text from the page
      const pageText = textContent.items.map((item: any) => item.str).join(" ")

      fullText += pageText + "\n"
    }

    return fullText
  } catch (error) {
    console.error("Error extracting text from PDF:", error)
    throw new Error("Failed to extract text from PDF")
  }
}

/**
 * Convert Nepali digits to English digits
 * @param input String containing Nepali digits
 * @returns String with Nepali digits converted to English
 */
function convertNepaliDigitsToEnglish(input: string): string {
  if (!input) return input
  const nepaliDigits = "०१२३४५६७८९"
  return input.replace(/[०-९]/g, (d) => String(nepaliDigits.indexOf(d)))
}

/**
 * Convert Nepali date (BS) to Gregorian date (AD)
 * This is a simplified conversion - for accurate conversion,
 * consider using a dedicated Nepali date conversion library
 * @param nepaliDate Date in Nepali calendar format (YYYY-MM-DD)
 * @returns Approximate Gregorian date
 */
function convertNepaliToGregorianDate(nepaliDate: string): string {
  if (!nepaliDate || !nepaliDate.match(/^\d{4}-\d{2}-\d{2}$/)) return nepaliDate

  // Convert Nepali digits if present
  nepaliDate = convertNepaliDigitsToEnglish(nepaliDate)

  // Extract year, month, day
  const [year, month, day] = nepaliDate.split("-").map(Number)

  // Simple approximation: Nepali year is ~56-57 years ahead of Gregorian
  // This is a rough approximation and will not be accurate for all dates
  const gregorianYear = year - 57

  // Return approximate Gregorian date
  // For accurate conversion, use a dedicated Nepali date conversion library
  return `${gregorianYear}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
}

/**
 * Extract data from text using regex patterns
 * @param text Extracted text from PDF
 * @returns Object containing extracted fields
 */
export function extractDataFromText(text: string): Record<string, string | null> {
  // Define regex patterns for Nepali National ID cards
  const patterns = {
    // ID number can be in format 023-456-2130 or ०२३-४५६-२१३० (Nepali digits)
    idNumber: /(?:(\d{3}-\d{3}-\d{4})|(०[०-९]{2}-[०-९]{3}-[०-९]{4}))/i,

    // Full name can be in format "Surname Given Name" or separate fields
    surname: /SURNAME\s+([A-Za-z\s]+)/i,
    givenName: /GIVEN NAME\s+([A-Za-z\s]+)/i,
    fullName: /NAME[:\s]*([A-Za-z\s]+)/i,

    // Date of birth in format 1978-02-05 or २०३४-१०-२३ (Nepali calendar)
    dobGregorian: /DATE OF (?:BIRTH|GATH)[:\s]*(\d{4}-\d{2}-\d{2}|\d{2}[/.-]\d{2}[/.-]\d{4})/i,
    dobNepali: /(?:जन्म मिति|२०३४-१०-२३)[:\s]*([०-९]{4}-[०-९]{2}-[०-९]{2}|\d{4}-\d{2}-\d{2})/i,

    // Gender/Sex field
    gender: /SEX[:\s]*([MF])/i,

    // Nationality field
    nationality: /(?:NATIONALITY|ONALITY)[:\s]*([A-Za-z]+)/i,

    // Parent names
    mothersName: /MOTHER'S NAME[:\s]*([A-Za-z\s]+)/i,
    fathersName: /FATHER'S NAME[:\s]*([A-Za-z\s]+)/i,

    // Issue date
    issueDate: /(?:DATE OF ISSUE|जरी बिति)[:\s]*(\d{2}-\d{2}-\d{4}|\d{2}[/.-]\d{2}[/.-]\d{4})/i,
  }

  const extractedData: Record<string, string | null> = {}

  // Extract each field using its pattern
  Object.entries(patterns).forEach(([field, pattern]) => {
    const match = text.match(pattern)
    extractedData[field] = match ? match[1] || match[2] || "" : null
  })

  // Process full name from surname and given name if available
  if (extractedData.surname && extractedData.givenName) {
    extractedData.fullName = `${extractedData.givenName} ${extractedData.surname}`.trim()
  }

  // Process ID number
  if (extractedData.idNumber && extractedData.idNumber.match(/[०-९]/)) {
    extractedData.nepaliIdNumber = extractedData.idNumber
    extractedData.idNumber = convertNepaliDigitsToEnglish(extractedData.idNumber)
  }

  // Process date of birth
  if (extractedData.dobNepali) {
    const nepaliDate = convertNepaliDigitsToEnglish(extractedData.dobNepali)
    extractedData.dobNepali = nepaliDate
    extractedData.dob = convertNepaliToGregorianDate(nepaliDate)
  } else if (extractedData.dobGregorian) {
    // Standardize date format if needed
    extractedData.dob = extractedData.dobGregorian
  }

  return extractedData
}

/**
 * Specialized function for extracting data from Nepali ID cards
 * @param text Extracted text from PDF
 * @returns Object containing extracted fields
 */
export function extractNepalIdData(text: string): Record<string, string | null> {
  // First use the general extraction function
  const data = extractDataFromText(text)

  // Additional processing specific to Nepali IDs

  // Try to extract ID number with more specific patterns if not found
  if (!data.idNumber) {
    // Look for patterns like "023-456-2130" or similar
    const idMatches = text.match(/(\d{3}[\s-]?\d{3}[\s-]?\d{4})/g)
    if (idMatches && idMatches.length > 0) {
      // Format the ID number with dashes
      data.idNumber = idMatches[0].replace(/\s/g, "").replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")
    }

    // Look for Nepali digits
    const nepaliIdMatches = text.match(/([०-९]{3}[\s-]?[०-९]{3}[\s-]?[०-९]{4})/g)
    if (nepaliIdMatches && nepaliIdMatches.length > 0) {
      data.nepaliIdNumber = nepaliIdMatches[0]
      // Convert to English digits and format
      const englishDigits = convertNepaliDigitsToEnglish(nepaliIdMatches[0])
      data.idNumber = englishDigits.replace(/\s/g, "").replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")
    }
  }

  // Try to extract name with more specific patterns if not found
  if (!data.fullName) {
    // Look for name patterns in different formats
    const nameMatches = text.match(/(?:NAME|नाम)[:\s]*([A-Za-z\s]+)/i)
    if (nameMatches && nameMatches[1]) {
      data.fullName = nameMatches[1].trim()
    }
  }

  // Try to extract date of birth with more specific patterns if not found
  if (!data.dob) {
    // Look for date patterns in different formats
    const dobMatches = text.match(/(?:BIRTH|DOB|जन्म)[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i)
    if (dobMatches && dobMatches[1]) {
      // Standardize date format
      const [day, month, year] = dobMatches[1].split(/[/-]/).map(Number)
      data.dob = `${year < 100 ? "19" + year : year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
    }
  }

  return data
}

/**
 * Extract all possible data from text using multiple extraction methods
 * @param text Extracted text from PDF
 * @returns Object containing all extracted fields
 */
export function extractAllPossibleData(text: string): Record<string, string | null> {
  // Combine results from both extraction methods
  const generalData = extractDataFromText(text)
  const nepalData = extractNepalIdData(text)

  // Merge the results, preferring nepalData when both have values
  const combinedData: Record<string, string | null> = { ...generalData }

  Object.entries(nepalData).forEach(([key, value]) => {
    if (value) combinedData[key] = value
  })

  return combinedData
}
