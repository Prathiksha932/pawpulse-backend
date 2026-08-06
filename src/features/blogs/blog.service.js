import { Blog } from './blog.model.js';
import ApiError from '../../shared/utils/ApiError.js';

const generateSlug = (title) =>
  title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

export const createBlog = async (authorId, { title, content, tags, isPublished }) => {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (await Blog.findOne({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  return Blog.create({
    title, content, tags, authorId, slug,
    isPublished: !!isPublished,
    publishedAt: isPublished ? new Date() : null,
  });
};

export const getPublishedBlogs = async ({ page = 1, limit = 10, search }) => {
  const filter = { isPublished: true };
  if (search) filter.$text = { $search: search };

  const skip = (page - 1) * limit;
  const [blogs, total] = await Promise.all([
    Blog.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit).populate('authorId', 'fullName'),
    Blog.countDocuments(filter),
  ]);

  return { blogs, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getBlogBySlug = async (slug) => {
  const blog = await Blog.findOne({ slug, isPublished: true }).populate('authorId', 'fullName');
  if (!blog) throw new ApiError(404, 'Blog post not found');
  return blog;
};