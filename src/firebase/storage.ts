import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

export interface UploadProgressCallback {
  (progressPercent: number): void;
}

export async function uploadPhotoToStorage(
  userId: string,
  file: File,
  onProgress?: UploadProgressCallback
): Promise<string> {
  // Validate format and size (max 10MB)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    throw new Error('Unsupported image format. Please upload JPG, PNG, or WEBP.');
  }

  const MAX_SIZE_MB = 10;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`File is too large. Maximum allowed size is ${MAX_SIZE_MB}MB.`);
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `stories/${userId}/${Date.now()}_${cleanFileName}`;
  const storageRef = ref(storage, path);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(Math.round(progress));
        }
      },
      (error) => {
        console.warn('Firebase Storage upload failed, falling back to Data URL: ', error);
        // Fallback to reading file as data URL if storage rules or quota error occurs
        const reader = new FileReader();
        reader.onload = () => {
          if (onProgress) onProgress(100);
          resolve(reader.result as string);
        };
        reader.onerror = () => reject(error);
        reader.readAsDataURL(file);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          if (onProgress) onProgress(100);
          resolve(downloadUrl);
        } catch (err) {
          // If download url fails, fallback to base64
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(err);
          reader.readAsDataURL(file);
        }
      }
    );
  });
}

export function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const mimeType = file.type || 'image/jpeg';
      // Strip data url prefix (e.g. data:image/jpeg;base64,)
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve({ base64, mimeType });
    };
    reader.onerror = (error) => reject(error);
  });
}
