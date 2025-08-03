// Test script to check if donation server action works
// Run this in the browser console or create a test endpoint

async function testDonation() {
  const formData = new FormData();
  formData.append('amount', '100');
  formData.append('name', 'Test User');
  formData.append('phoneNumber', '9999999999');
  formData.append('email', 'test@example.com');

  console.log('Testing donation with:', {
    amount: '100',
    name: 'Test User',
    phoneNumber: '9999999999',
    email: 'test@example.com'
  });

  try {
    // In a real scenario, this would be called from the form
    // const result = await initiateUPIDonation(formData);
    // console.log('Donation result:', result);
  } catch (error) {
    console.error('Donation test failed:', error);
  }
}

// Call the test
testDonation();
