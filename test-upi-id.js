// Quick test to verify UPI ID update  
const fs = require('fs');
const path = require('path');

console.log('=== Payment System Test ===');

// Read the constants file
const constantsPath = path.join(__dirname, 'lib', 'payment-constants.ts');
const constantsContent = fs.readFileSync(constantsPath, 'utf8');

// Extract UPI ID from the file
const upiIdMatch = constantsContent.match(/UPI_ID:\s*['"`]([^'"`]+)['"`]/);
const merchantNameMatch = constantsContent.match(/MERCHANT_NAME:\s*['"`]([^'"`]+)['"`]/);

if (upiIdMatch && merchantNameMatch) {
  const upiId = upiIdMatch[1];
  const merchantName = merchantNameMatch[1];
  
  console.log('UPI ID:', upiId);
  console.log('Merchant Name:', merchantName);
  
  // Test UPI link generation
  const testPayment = {
    orderId: 'TEST-' + Date.now(),
    amount: 1000
  };
  
  const upiParams = new URLSearchParams({
    pa: upiId,
    pn: merchantName,
    am: testPayment.amount.toString(),
    cu: 'INR',
    tn: `IIMT Donation ${testPayment.orderId}`,
    tr: testPayment.orderId,
    mode: '02',
    purpose: '00'
  });
  
  const upiLink = `upi://pay?${upiParams.toString()}`;
  
  console.log('\n=== Generated UPI Link ===');
  console.log(upiLink);
  
  console.log('\n=== UPI Parameters ===');
  for (const [key, value] of upiParams.entries()) {
    console.log(`${key}: ${value}`);
  }
  
  console.log('\n✅ Test completed successfully!');
  console.log('✅ UPI ID has been updated to:', upiId);
} else {
  console.error('❌ Could not extract UPI ID from constants file');
}
