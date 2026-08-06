import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    coverImage: { url: { type: String, default: '' }, publicId: { type: String, default: '' } },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [String],
    isPublished: { type: Boolean, default: false },
    publishedAt: Date,
  },
  { timestamps: true }
);

blogSchema.index({ title: 'text', content: 'text' });

export const Blog = mongoose.model('Blog', blogSchema);