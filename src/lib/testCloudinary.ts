import { uploadImageUnsigned } from '@/lib/cloudinaryUpload';

// Test function to try different upload presets
export async function testCloudinaryUpload(file: File): Promise<string> {
  const presets = ['unsigned', 'ml_default', 'preset1', 'preset2'];
  
  for (const preset of presets) {
    try {
      console.log(`Trying preset: ${preset}`);
      const result = await uploadImageUnsigned(file, preset, 'test');
      console.log(`Success with preset: ${preset}`);
      return result;
    } catch (error) {
      console.log(`Failed with preset ${preset}:`, error);
    }
  }
  
  throw new Error('All presets failed');
}
