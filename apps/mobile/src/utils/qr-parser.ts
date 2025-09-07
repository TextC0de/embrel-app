import { PassengerData, QRParseResult } from '../types';

/**
 * Enhanced QR Code parser for airline boarding passes
 * Supports multiple formats: IATA BCBP and other boarding pass formats
 */

/**
 * Generates a unique ID for passenger records
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Formats passenger name by simply replacing slash with space
 */
function formatPassengerName(rawName: string): string {
  if (!rawName) return rawName;
  
  try {
    // Simply replace forward slash with space (separates surname from given names)
    return rawName.replace('/', ' ').trim();
  } catch (error) {
    console.warn('Error formatting passenger name:', error);
    return rawName;
  }
}

/**
 * Validates flight number against allowed flights
 */
function validateFlight(flight: string, allowedFlights: string[] = ['3192']): boolean {
  if (!flight) return false;
  
  // Extract numeric part of flight (remove airline code)
  const numericFlight = flight.replace(/[A-Z]+/g, '').trim();
  
  // Check if any of the allowed flights match
  return allowedFlights.some(allowed => {
    // Handle both formats: "3192" and "JA3192"
    const allowedNumeric = allowed.replace(/[A-Z]+/g, '').trim();
    return numericFlight === allowedNumeric || flight === allowed;
  });
}

/**
 * Extracts flight number from various formats
 */
function extractFlightNumber(text: string): string | null {
  const flightPatterns = [
    /JA\d{4}/i,           // JA3192 (complete)
    /JA(\d{4})/i,         // JA3192 -> 3192 
    /\b(\d{4})\b/,        // 3192 standalone
    /[A-Z]{1,3}\d{3,4}/i  // General airline code + numbers (complete)
  ];

  for (const pattern of flightPatterns) {
    const match = text.match(pattern);
    if (match) {
      // Return the full match for complete patterns, or the captured group
      return match[1] || match[0];
    }
  }
  
  return null;
}

/**
 * Extracts passenger name from various formats
 */
function extractPassengerName(data: string): string | null {
  const namePatterns = [
    /([A-Z]+\/[A-Z]+)/g,           // SURNAME/FIRSTNAME
    /([A-Z]{2,}\/[A-Z]{2,})/g      // At least 2 chars each side
  ];

  for (const pattern of namePatterns) {
    const matches = data.match(pattern);
    if (matches && matches.length > 0) {
      return matches.reduce((longest, current) => 
        current.length > longest.length ? current : longest
      );
    }
  }
  
  return null;
}

/**
 * Extracts seat number from various formats including IATA BCBP
 */
function extractSeat(data: string): string | null {
  // IATA BCBP format: M1FERNANDEZ/MARIA     EQYT82Q RELAEPJA 3192 173Y003A0171 147
  // The actual seat (003A = 3A) is in the middle of the seat section
  if (data.startsWith('M1')) {
    // Try to extract seat from IATA BCBP format
    // Pattern: after flight number, look for pattern like 173Y003A0171 where 003A is the seat
    const bcbpSeatMatch = data.match(/\d{1,3}[A-Z](\d{3}[A-Z])/);
    if (bcbpSeatMatch?.[1]) {
      // Extract 003A and convert to 3A (remove leading zeros)
      const rawSeat = bcbpSeatMatch[1]; // 003A
      const seatNumber = rawSeat.replace(/^0+/, ''); // Remove leading zeros: 003A -> 3A
      return seatNumber;
    }
    
    // Fallback: Try to extract seat pattern like 142Y (for older formats)
    const fallbackMatch = data.match(/M1[A-Z\/\s]+\s+[A-Z0-9]+\s+[A-Z]+\s+\d{4}\s+(\d{1,3}[A-Z])/);
    if (fallbackMatch?.[1]) {
      return fallbackMatch[1]; // 142Y
    }
  }
  
  const seatPatterns = [
    /\b(\d{1,2}[A-F])\b/g,      // 1-2 digits + letter A-F
    /Silla\/Seat\s*(\w+)/i,      // "Silla/Seat 24C"
    /Seat\s*(\w+)/i              // "Seat 24C"
  ];

  for (const pattern of seatPatterns) {
    const matches = data.match(pattern);
    if (matches && matches.length > 0) {
      return matches[0].replace(/.*\s/, '');
    }
  }
  
  return null;
}

/**
 * Extracts sequence number from various formats including IATA BCBP
 */
function extractSequence(data: string): string | null {
  // IATA BCBP format: M1FERNANDEZ/MARIA     EQYT82Q RELAEPJA 3192 173Y003A0171 147
  // The sequence number (0171) is in the seat section after the seat number
  if (data.startsWith('M1')) {
    // Try to extract sequence from IATA BCBP format
    // Look for pattern like 173Y003A0171 where 0171 is the sequence
    const bcbpSeqMatch = data.match(/\d{1,3}[A-Z]\d{3}[A-Z](\d{3,4})/);
    if (bcbpSeqMatch?.[1]) {
      // Remove leading zeros and return
      return bcbpSeqMatch[1].replace(/^0+/, '') || bcbpSeqMatch[1]; // 171
    }
    
    // Fallback: Look for 3-digit number near the end: 147>5180
    const fallbackMatch = data.match(/(\d{3})(?:>|\s)/);
    if (fallbackMatch?.[1]) {
      return fallbackMatch[1]; // 147
    }
  }
  
  const seqPatterns = [
    /SEQ\s*(\d{2,4})/i,          // SEQ 149, SEQ 171, etc.
    /\b(\d{3,4})\s*$/,           // 3-4 digits at end
    /(\d{3,4})(?=[^0-9]*$)/      // Last 3-4 digit sequence
  ];

  for (const pattern of seqPatterns) {
    const match = data.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Extracts PNR from various formats including IATA BCBP
 */
function extractPNR(data: string): string | null {
  // IATA BCBP format: M1FERNANDEZ/MARIA     EQYT82Q RELAEPJA 3192
  // The PNR is usually after the passenger name, before the airline code
  if (data.startsWith('M1')) {
    // Pattern: M1NAME/NAME     PNR AIRLINE
    const bcbpMatch = data.match(/M1[A-Z\/\s]+\s+([A-Z0-9]{5,7})\s+[A-Z]+/);
    if (bcbpMatch?.[1]) {
      return bcbpMatch[1]; // EQYT82Q
    }
  }
  
  const pnrPatterns = [
    /PNR\s*([A-Z0-9]{4,8})/i,    // PNR XXXXX
    /\b([A-Z]{2}\d{4})\b/,       // QY020, etc.
    /\b([A-Z0-9]{5,7})\b/        // General alphanumeric 5-7 chars
  ];

  for (const pattern of pnrPatterns) {
    const match = data.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Main QR parsing function - supports multiple formats
 */
export function parseQRCode(
  data: string, 
  allowedFlights: string[],
  barcodeType: string
): QRParseResult {
  try {
    console.log('🔍 [QR] Parsing QR data:', data.substring(0, 50) + '...');
    console.log('🔍 [QR] Barcode type:', barcodeType);
    
    if (!data || data.length < 10) {
      return {
        isValid: false,
        parsed: null,
        error: 'El código QR es muy corto o está vacío'
      };
    }

    // Quick validation: only process QR codes and PDF417 (boarding passes)
    if (barcodeType) {
      const normalizedType = barcodeType.toLowerCase();
      const isValidType = normalizedType.includes('qr') || 
                         normalizedType.includes('pdf417') || 
                         normalizedType.includes('pdf') ||
                         normalizedType === 'qr' ||
                         normalizedType === 'pdf417';
      
      if (!isValidType) {
        return {
          isValid: false,
          parsed: null,
          error: `Tipo de código no soportado: ${barcodeType}. Solo se aceptan códigos QR y PDF417`
        };
      }
    }

    // Detect boarding pass format
    const isIATABCBP = data.startsWith('M1') || data.startsWith('M2');
    const isPDF417BoardingPass = barcodeType && 
                                 barcodeType.toLowerCase().includes('pdf') && 
                                 data.includes('/');
    
    console.log('🔍 [QR] Format detection:', { isIATABCBP, isPDF417BoardingPass, type: barcodeType });

    // Try to extract components
    const passenger = extractPassengerName(data);
    const pnr = extractPNR(data);
    const flight = extractFlightNumber(data);
    const seat = extractSeat(data);
    const seq = extractSequence(data);

    console.log('🔍 [QR] Extracted:', { passenger, pnr, flight, seat, seq });
    console.log('🔍 [QR] Allowed flights:', allowedFlights);

    // Additional validation: ensure this looks like a boarding pass
    if (!isIATABCBP && !isPDF417BoardingPass) {
      // If it's not a recognized boarding pass format, be more strict
      if (!passenger || !flight) {
        console.log('❌ [QR] Not a boarding pass - missing passenger or flight');
        return {
          isValid: false,
          parsed: null,
          error: 'Este código no parece ser una tarjeta de embarque válida. Verifica que sea el código QR correcto'
        };
      }
    }

    // Validate required fields
    if (!passenger) {
      console.log('❌ [QR] Missing passenger name');
      return {
        isValid: false,
        parsed: null,
        error: 'No se encontró el nombre del pasajero en el código QR'
      };
    }

    if (!flight) {
      console.log('❌ [QR] Missing flight number');
      return {
        isValid: false,
        parsed: null,
        error: 'No se encontró el número de vuelo en el código QR'
      };
    }

    if (!validateFlight(flight, allowedFlights)) {
      console.log(`❌ [QR] Flight ${flight} not in allowed list: ${allowedFlights.join(', ')}`);
      return {
        isValid: false,
        parsed: null,
        error: `El vuelo ${flight} no está permitido. Se esperaba: ${allowedFlights.join(', ')}`
      };
    }

    // Create passenger data
    const passengerData: PassengerData = {
      id: generateId(),
      passenger: formatPassengerName(passenger),
      pnr: pnr || 'N/A',
      route: 'REL-EZE', // Default route
      flight: flight,
      seat: seat || 'N/A',
      seq: seq || '000',
      timestamp: Date.now(),
      rawData: data
    };

    console.log('✅ [QR] Successfully parsed passenger:', passengerData.passenger);

    return {
      isValid: true,
      parsed: passengerData
    };

  } catch (error) {
    console.error('❌ [QR] Parse error:', error);
    return {
      isValid: false,
      parsed: null,
      error: `Error al procesar el código: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}

/**
 * Utility to check if QR data looks like a valid boarding pass
 */
export function isValidQRFormat(data: string, barcodeType?: string): boolean {
  if (!data || data.length < 10) return false;
  
  // Strong indicators for boarding passes
  const isIATABCBP = data.startsWith('M1') || data.startsWith('M2');
  const isPDF417BoardingPass = barcodeType && 
                               barcodeType.toLowerCase().includes('pdf') && 
                               data.includes('/');
  
  // If it's a recognized format, it's likely valid
  if (isIATABCBP || isPDF417BoardingPass) {
    return true;
  }
  
  // For other QR codes, check for common boarding pass indicators
  const indicators = [
    /[A-Z]+\/[A-Z]+/,        // Name with slash
    /\d{4}/,                 // Flight number
    /SEQ/i,                  // Sequence
    /PNR/i                   // PNR
  ];

  // Require at least 2 indicators for non-standard formats
  const matchCount = indicators.filter(pattern => pattern.test(data)).length;
  return matchCount >= 2;
}

/**
 * Format passenger name for display
 */
export function formatNameForDisplay(passenger: PassengerData): string {
  return formatPassengerName(passenger.passenger);
} 