import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Post from '../models/Post.js';

export const createPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { title, content, tags, coverImageUrl } = req.body;
    const post = await Post.create({ title, content, tags, coverImageUrl, author: req.user.id });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const { q, tag, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (q) filter.$text = { $search: q };
    if (tag) filter.tags = tag;
    const posts = await Post.find(filter)
      .populate('author', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Post.countDocuments(filter);
    res.json({ items: posts, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
    const post = await Post.findById(id)
      .populate('author', 'name avatarUrl')
      .populate('comments.user', 'name avatarUrl');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const { title, content, tags, coverImageUrl } = req.body;
    post.title = title ?? post.title;
    post.content = content ?? post.content;
    post.tags = tags ?? post.tags;
    post.coverImageUrl = coverImageUrl ?? post.coverImageUrl;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    await post.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const idx = post.likes.findIndex((u) => u.toString() === req.user.id);
    if (idx >= 0) post.likes.splice(idx, 1);
    else post.likes.push(req.user.id);
    await post.save();
    res.json({ likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const idx = post.bookmarks.findIndex((u) => u.toString() === req.user.id);
    if (idx >= 0) post.bookmarks.splice(idx, 1);
    else post.bookmarks.push(req.user.id);
    await post.save();
    res.json({ bookmarks: post.bookmarks.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.comments.push({ user: req.user.id, text });
    await post.save();
    const populated = await Post.findById(id).populate('comments.user', 'name avatarUrl');
    const last = populated.comments[populated.comments.length - 1];
    res.status(201).json(last);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    comment.text = text;
    comment.updatedAt = new Date();
    await post.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.user.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    comment.deleteOne();
    await post.save();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const reactToPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    if (!emoji) return res.status(400).json({ message: 'emoji is required' });
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    // One reaction per user per post: toggle if same emoji, replace if different
    const idx = post.reactions.findIndex((r) => r.user.toString() === req.user.id);
    if (idx >= 0) {
      if (post.reactions[idx].emoji === emoji) {
        post.reactions.splice(idx, 1);
      } else {
        post.reactions[idx].emoji = emoji;
      }
    } else {
      post.reactions.push({ user: req.user.id, emoji });
    }
    await post.save();
    const counts = post.reactions.reduce((acc, r) => { acc[r.emoji] = (acc[r.emoji] || 0) + 1; return acc; }, {});
    res.json({ reactions: counts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getReactions = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const counts = post.reactions.reduce((acc, r) => { acc[r.emoji] = (acc[r.emoji] || 0) + 1; return acc; }, {});
    res.json({ reactions: counts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const repost = async (req, res) => {
  try {
    const { id } = req.params;
    const original = await Post.findById(id);
    if (!original) return res.status(404).json({ message: 'Original post not found' });
    const newPost = await Post.create({
      title: original.title,
      content: original.content,
      tags: original.tags,
      coverImageUrl: original.coverImageUrl,
      author: req.user.id,
      repostOf: original._id,
    });
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
