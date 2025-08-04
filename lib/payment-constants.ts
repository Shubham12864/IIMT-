// Payment Configuration Constants
export const PAYMENT_CONFIG = {
  UPI_ID: "shubham.217@ptaxis",
  MERCHANT_NAME: "IIMT Group of Colleges",
  PAYMENT_TIMEOUT_MINUTES: 15
} as const;

// UPI Parameters for QR Code Generation
export const UPI_PARAMS = {
  CURRENCY: 'INR',
  MODE: '02', // UPI Payment Mode
  PURPOSE: '00' // Default purpose code
} as const;
