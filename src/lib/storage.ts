import { supabaseClient } from './db';

export const storage = {
  /**
   * Uploads an image file. If Supabase is configured, uploads it to the 'recipe-images' bucket.
   * Otherwise, converts it to a Base64 string for mock persistence.
   * Note: This function is designed to run in client-side components.
   */
  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to upload image to server');
      }

      const data = await res.json();
      return data.url; // This will be the Cloudinary URL, or local base64 if credentials are missing
    } catch (err) {
      console.error('Upload error, falling back to client-side base64:', err);
      return this.fileToBase64(file);
    }
  },

  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file contents'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
};
