import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import { logger } from '../utils/logger.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  logger.warn('Supabase URL or Key is not configured. File uploads to Supabase will fail.');
}

const BUCKET_NAME = 'vault-files';

export const uploadFile = async (file, userId) => {
  if (!supabase) throw new Error('Supabase is not configured');

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  // Sanitize filename: remove spaces and special chars
  const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const filePath = `${userId}/${uniqueSuffix}-${safeName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    logger.error('Supabase upload error', { message: error.message, statusCode: error.statusCode });
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  return filePath;
};

/**
 * Get a public URL for a file (bucket must be set to public in Supabase).
 * Falls back to a signed URL if public URL fails.
 */
export const getFileUrl = async (filePath, expiresIn = 3600) => {
  if (!supabase || !filePath) return null;

  // Try public URL first (works if bucket is public)
  const { data: publicData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  if (publicData?.publicUrl) {
    return publicData.publicUrl;
  }

  // Fallback to signed URL (works if bucket is private)
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    logger.error('Supabase getSignedUrl error', { message: error.message });
    return null;
  }

  return data.signedUrl;
};

// Keep old export name for backwards compatibility
export const getSignedUrl = getFileUrl;

export const deleteFile = async (filePath) => {
  if (!supabase || !filePath) return;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    logger.error('Supabase deleteFile error', { message: error.message });
  }
};
