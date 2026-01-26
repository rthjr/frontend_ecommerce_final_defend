// Test Cloudinary credentials directly
export async function testCloudinaryCredentials() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dym23fggk';
  
  let apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  let apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  // Extract from URL if available
  if (cloudinaryUrl) {
    const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
    if (match) {
      apiKey = match[1];
      apiSecret = match[2];
      console.log('✅ Extracted credentials from URL');
      console.log('Cloud Name:', match[3]);
      console.log('API Key:', apiKey?.substring(0, 8) + '...');
    } else {
      console.log('❌ Could not parse CLOUDINARY_URL');
    }
  }
  
  console.log('Environment check:');
  console.log('CLOUDINARY_URL exists:', !!cloudinaryUrl);
  console.log('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:', cloudName);
  console.log('API Key exists:', !!apiKey);
  console.log('API Secret exists:', !!apiSecret);
  
  return { cloudName, apiKey, apiSecret };
}
