# Cloudinary Setup Instructions

## 1. Environment Variables
Add these to your `.env.local` file:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret  # Server-side only (NO NEXT_PUBLIC_ prefix!)

# Keep existing API URLs
NEXT_PUBLIC_PRODUCT_API_URL=http://localhost:8081
NEXT_PUBLIC_ORDER_API_URL=http://localhost:8083
NEXT_PUBLIC_USER_API_URL=http://localhost:8082
```

**Important:** 
- `CLOUDINARY_API_SECRET` should NOT have `NEXT_PUBLIC_` prefix
- This keeps the secret on the server-side only (more secure)
- The API route at `/api/upload` uses this secret safely

## 2. Cloudinary Dashboard Setup

1. **Sign up/Sign in** to [Cloudinary Dashboard](https://cloudinary.com/console)

2. **Get your credentials:**
   - Go to Settings → Account → Cloud name
   - Go to Settings → Security → API Key & Secret

3. **Create Upload Preset (Optional but Recommended):**
   - Go to Settings → Upload → Upload presets
   - Click "Add upload preset"
   - Name: `product_images`
   - Signing mode: Unsigned
   - Folder: `products` (optional)
   - Allowed formats: jpg, jpeg, png, gif, webp
   - Access mode: Public
   - Click Save
   
   **Note:** The upload preset is optional because we now use a secure API route as the primary upload method.

## 3. Update Environment
Replace the placeholder values in `.env.local`:
- `your_cloud_name` → Your Cloudinary cloud name (e.g., `dym23fggk`)
- `your_api_key` → Your Cloudinary API key (e.g., `212577517727531`)
- `your_api_secret` → Your Cloudinary API secret (keep this secret!)

## 4. Upload Methods (Automatic Fallback)

The system tries multiple upload methods in this order:

1. **API Route Upload (Primary - Most Secure)**
   - File is sent to `/api/upload` Next.js API route
   - API route uses Cloudinary SDK server-side with API secret
   - API secret never exposed to browser
   - ✅ Recommended for production

2. **Unsigned Preset Upload (Fallback)**
   - Direct upload to Cloudinary using `product_images` preset
   - No API secret needed
   - Requires preset creation in Cloudinary dashboard
   - ✅ Works if API route fails

3. **Error with Instructions**
   - If both methods fail, provides helpful setup instructions

## 5. Features Implemented

✅ **Secure Server-Side Upload API**
- `/api/upload` route handles uploads server-side
- API secret stays on server (never in browser)
- File validation (type, size limits)
- Automatic image optimization

✅ **Frontend Cloudinary Upload**
- Direct file upload via API route
- Image preview while uploading
- Error handling and toast notifications
- Support for all major image formats (JPEG, PNG, GIF, WebP)
- Max file size: 5MB

✅ **Product Creation & Editing**
- Both add and edit product pages use Cloudinary
- Immediate preview with Cloudinary URLs
- Automatic fallback to preset upload if API fails

✅ **Image Optimization**
- Automatic image compression (quality: auto)
- Format conversion (fetch_format: auto)
- Max dimensions: 1000x1000 (preserves aspect ratio)
- CDN distribution

## 6. Benefits of Cloudinary

- **Scalability**: No storage limits on your server
- **Performance**: Global CDN delivery
- **Optimization**: Automatic image compression and format conversion
- **Security**: Server-side API secret, signed URLs
- **Analytics**: Image usage statistics
- **Transformations**: On-the-fly image resizing and effects

## 7. Usage

When users upload images:
1. File is selected from user's device
2. Uploaded to `/api/upload` Next.js API route
3. API route validates and uploads to Cloudinary server-side
4. Cloudinary returns a secure URL
5. URL is stored in your database
6. Images are served from Cloudinary's CDN

No more 404 errors for missing local files!

## 8. Troubleshooting

**Upload fails with "Upload preset not found":**
- This means the fallback method is being used
- Create the `product_images` preset in Cloudinary dashboard (see step 2.3)
- OR ensure your Next.js dev server is running for the API route

**Upload fails with "Failed to upload image":**
- Check that all environment variables are set correctly
- Verify `CLOUDINARY_API_SECRET` doesn't have `NEXT_PUBLIC_` prefix
- Check browser console for detailed error messages
- Restart your Next.js dev server after changing `.env.local`

**Image doesn't appear after upload:**
- Check browser console for the returned URL
- Verify the URL starts with `https://res.cloudinary.com/`
- Check Cloudinary dashboard → Media Library to see uploaded images
