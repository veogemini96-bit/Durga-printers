import { supabase } from './supabase';

export interface UploadResult {
  url: string;
  path: string;
}

export const uploadProductImage = async (
  file: File,
  productId?: string
): Promise<UploadResult> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = productId ? `${productId}/${fileName}` : fileName;

  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(data.path);

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
};

export const deleteProductImage = async (path: string): Promise<void> => {
  const { error } = await supabase.storage.from('product-images').remove([path]);

  if (error) {
    throw error;
  }
};

export const uploadMultipleProductImages = async (
  files: File[],
  productId?: string
): Promise<UploadResult[]> => {
  const uploadPromises = files.map((file) => uploadProductImage(file, productId));
  return Promise.all(uploadPromises);
};
