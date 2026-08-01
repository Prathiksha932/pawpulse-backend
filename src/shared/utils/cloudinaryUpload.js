import cloudinary, { cloudinaryReady } from '../../config/cloudinary.js';
import ApiError from './ApiError.js';

export const uploadBufferToCloudinary = (buffer, folder) => {
  if (!cloudinaryReady) {
    throw new ApiError(503, 'Image upload is not currently configured on this server');
  }
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  if (!cloudinaryReady || !publicId) return;
  await cloudinary.uploader.destroy(publicId);
};