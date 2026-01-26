import { cloudinary } from './cloudinary';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
}

export async function uploadImageToCloudinary(
  file: File,
  folder: string = 'products'
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file); // Send the actual file, not base64
    formData.append('upload_preset', 'product_images'); // Use the correct preset
    formData.append('folder', folder);
    
    // Upload to Cloudinary
    fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        reject(new Error(data.error.message));
      } else {
        resolve({
          secure_url: data.secure_url,
          public_id: data.public_id,
          format: data.format,
          bytes: data.bytes,
          width: data.width,
          height: data.height,
        });
      }
    })
    .catch(error => reject(error));
  });
}

// Simple unsigned upload method
export async function uploadImageUnsigned(
  file: File,
  uploadPreset: string = 'unsigned', // Try with default unsigned preset
  folder: string = 'products'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dym23fggk';
    
    console.log('=== UNSIGNED UPLOAD ATTEMPT ===');
    console.log('Cloud Name:', cloudName);
    console.log('Upload Preset:', uploadPreset);
    console.log('Folder:', folder);
    console.log('File:', file.name, file.type, file.size);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    if (folder) {
      formData.append('folder', folder);
    }
    
    // Log FormData contents (without the actual file)
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      if (key !== 'file') {
        console.log(`  ${key}:`, value);
      } else {
        console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
      }
    }
    
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    console.log('Upload URL:', uploadUrl);
    
    fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    })
    .then(response => {
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      return response.json();
    })
    .then(data => {
      console.log('=== CLOUDINARY RESPONSE ===');
      console.log('Full response:', JSON.stringify(data, null, 2));
      
      if (data.error) {
        console.error('Cloudinary error details:', {
          message: data.error.message,
          code: data.error.http_code || data.error.code,
          more_info: data.error.more_info_url
        });
        reject(new Error(`Cloudinary error [${uploadPreset}]: ${data.error.message}`));
      } else {
        console.log('✅ Upload successful!');
        console.log('Secure URL:', data.secure_url);
        resolve(data.secure_url);
      }
    })
    .catch(error => {
      console.error('=== UPLOAD ERROR ===');
      console.error('Network error:', error);
      reject(error);
    });
  });
}

// Signed upload method (no preset needed)
export async function uploadImageSigned(
  file: File,
  folder: string = 'products'
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Parse Cloudinary URL if available
    const cloudinaryUrl = process.env.CLOUDINARY_URL;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dym23fggk';
    
    let apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    let apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    // Extract credentials from CLOUDINARY_URL if available
    if (cloudinaryUrl && !apiKey && !apiSecret) {
      const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
      if (match) {
        apiKey = match[1];
        apiSecret = match[2];
        console.log('Extracted from URL - API Key:', apiKey?.substring(0, 8) + '...');
        console.log('Extracted Cloud Name:', match[3]);
      }
    }
    
    console.log('=== SIGNED UPLOAD ATTEMPT ===');
    console.log('Cloud Name:', cloudName);
    console.log('API Key:', apiKey?.substring(0, 8) + '...');
    console.log('Folder:', folder);
    console.log('File:', file.name, file.type, file.size);
    
    if (!cloudName || !apiKey || !apiSecret) {
      reject(new Error('Cloudinary credentials not found. Check CLOUDINARY_URL or individual env vars'));
      return;
    }

    // Create timestamp and proper signature
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Build parameters to sign (only include folder if specified)
    const params: string[] = [`timestamp=${timestamp}`];
    if (folder) {
      params.push(`folder=${folder}`);
    }
    
    // Create string to sign: params + api_secret
    const stringToSign = params.join('&') + apiSecret;
    
    // Create SHA-1 signature using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(stringToSign);
    
    crypto.subtle.digest('SHA-1', data).then(hashBuffer => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', apiKey);
      formData.append('signature', signature);
      if (folder) {
        formData.append('folder', folder);
      }
      
      console.log('FormData for signed upload:');
      console.log('  timestamp:', timestamp);
      console.log('  api_key:', apiKey?.substring(0, 8) + '...');
      console.log('  signature:', signature);
      console.log('  folder:', folder);
      console.log('  stringToSign:', stringToSign);
      
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      console.log('Upload URL:', uploadUrl);
      
      fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      })
      .then(response => {
        console.log('Response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('=== SIGNED UPLOAD RESPONSE ===');
        console.log('Full response:', JSON.stringify(data, null, 2));
        
        if (data.error) {
          console.error('Cloudinary error details:', {
            message: data.error.message,
            code: data.error.http_code || data.error.code
          });
          reject(new Error(`Cloudinary signed error: ${data.error.message}`));
        } else {
          console.log('✅ Signed upload successful!');
          console.log('Secure URL:', data.secure_url);
          resolve(data.secure_url);
        }
      })
      .catch(error => {
        console.error('=== SIGNED UPLOAD ERROR ===');
        console.error('Network error:', error);
        reject(error);
      });
    }).catch(error => {
      reject(new Error('Failed to generate signature: ' + error.message));
    });
  });
}

// Upload via Next.js API route (RECOMMENDED - Most Secure)
// API secret stays on server, never exposed to browser
export async function uploadImageViaAPI(
  file: File,
  folder: string = 'products'
): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log('=== API ROUTE UPLOAD ===');
    console.log('File:', file.name, file.type, file.size);
    console.log('Folder:', folder);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    .then(response => {
      console.log('API Response status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('API Response:', data);
      
      if (data.error) {
        reject(new Error(`Upload failed: ${data.error}`));
      } else if (data.success && data.url) {
        console.log('✅ Upload successful via API route!');
        console.log('Secure URL:', data.url);
        resolve(data.url);
      } else {
        reject(new Error('Unexpected response from upload API'));
      }
    })
    .catch(error => {
      console.error('=== API UPLOAD ERROR ===');
      console.error('Network error:', error);
      reject(error);
    });
  });
}

// Try multiple upload methods (API route first, then fallbacks)
export async function uploadImageToCloudinaryAny(
  file: File,
  folder: string = 'products'
): Promise<string> {
  // Method 1: Upload via API route (RECOMMENDED - API secret stays on server)
  try {
    console.log('Method 1: Trying API route upload (most secure)...');
    return await uploadImageViaAPI(file, folder);
  } catch (error: any) {
    console.log('API route upload failed:', error.message);
    console.log('Falling back to direct Cloudinary upload...');
    
    // Method 2: Try unsigned upload with product_images preset (requires preset in dashboard)
    try {
      console.log('Method 2: Trying unsigned upload with product_images preset...');
      return await uploadImageUnsigned(file, 'product_images', folder);
    } catch (presetError: any) {
      console.log('product_images preset not found:', presetError.message);
      
      // Method 3: Final error with helpful instructions
      throw new Error(
        `All upload methods failed. To fix this:\n\n` +
        `Option 1 (Recommended): Create Cloudinary upload preset\n` +
        `  1. Go to Cloudinary Dashboard → Settings → Upload → Upload presets\n` +
        `  2. Create preset named "product_images" with "Unsigned" mode\n` +
        `  3. Set folder to "products"\n\n` +
        `Option 2: Check that your Next.js dev server is running\n` +
        `  - The /api/upload endpoint needs the server to be active\n\n` +
        `Last error: ${presetError.message}`
      );
    }
  }
}
