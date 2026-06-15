import { supabaseClient } from './db';

export const storage = {
  /**
   * Uploads an image file. If Supabase is configured, uploads it to the 'recipe-images' bucket.
   * Otherwise, converts it to a Base64 string for mock persistence.
   * Note: This function is designed to run in client-side components.
   */
  async uploadImage(file: File): Promise<string> {
    const isSupabaseConfigured = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    if (isSupabaseConfigured && supabaseClient) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `recipes/${fileName}`;

        const { error: uploadError } = await supabaseClient.storage
          .from('recipe-images')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabaseClient.storage
          .from('recipe-images')
          .getPublicUrl(filePath);

        return urlData.publicUrl;
      } catch (err) {
        console.error('Supabase storage upload error, falling back to base64:', err);
        return this.fileToBase64(file);
      }
    } else {
      // Local development fallback: Base64 Data URL
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
