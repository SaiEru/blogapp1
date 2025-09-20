import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Post from '../models/Post.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id || req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { name, bio, avatarUrl, location, website, birthday, occupation } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    if (birthday !== undefined) user.birthday = birthday ? new Date(birthday) : undefined;
    if (occupation !== undefined) user.occupation = occupation;
    await user.save();
    res.json({ id: user._id, name: user.name, email: user.email, bio: user.bio, avatarUrl: user.avatarUrl, location: user.location, website: user.website, birthday: user.birthday, occupation: user.occupation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const posts = await Post.find({ author: userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const filename = req.file.filename;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/uploads/${filename}`;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.avatarUrl = url;
    await user.save();
    res.json({ avatarUrl: url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
