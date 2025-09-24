import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import { firebaseAuth } from '../utils/firebase.js'; // in progress

function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}
//register controller
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });
    const user = await User.create({ name, email, password });
    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, bio: user.bio, avatarUrl: user.avatarUrl },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//login controller
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });
    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, bio: user.bio, avatarUrl: user.avatarUrl },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Placeholder for Google OAuth (implement with Passport or Google APIs)
export const googleOAuth = async (_req, res) => {
  res.status(501).json({ message: 'Google OAuth not implemented in boilerplate' });
};

export const loginWithFirebase = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'idToken is required' });
    const decoded = await firebaseAuth.verifyIdToken(idToken);
    const { uid, email, name, picture } = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || decoded.displayName || 'User',
      picture: decoded.picture,
    };
    if (!email) return res.status(400).json({ message: 'Email missing from Firebase token' });
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: uid + Math.random().toString(36).slice(2), // placeholder; not used for Firebase sign-in
        avatarUrl: picture || '',
        googleId: uid,
      });
    } else {
      // update fields that may come from Firebase
      user.googleId = user.googleId || uid;
      if (picture && !user.avatarUrl) user.avatarUrl = picture;
      if (!user.name && name) user.name = name;
      await user.save();
    }
    const token = signToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, bio: user.bio, avatarUrl: user.avatarUrl } });
  } catch (err) {
    res.status(401).json({ message: err.message || 'Invalid Firebase token' });
  }
};
