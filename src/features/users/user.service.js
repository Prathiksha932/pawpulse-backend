import { uploadBufferToCloudinary, deleteFromCloudinary } from '../../shared/utils/cloudinaryUpload.js';

export const updateAvatar = async (currentUser, fileBuffer) => {
  if (currentUser.avatar?.publicId) {
    await deleteFromCloudinary(currentUser.avatar.publicId);
  }

  const result = await uploadBufferToCloudinary(fileBuffer, 'pawpulse/avatars');

  currentUser.avatar = { url: result.secure_url, publicId: result.public_id };
  await currentUser.save({ validateBeforeSave: false });

  return currentUser;
};