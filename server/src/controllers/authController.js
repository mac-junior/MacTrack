import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { validateEmail, validatePassword } from '../utils/validation.js';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    
    if (!validatePassword(password)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    if (username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters long' });
    }
    
    // Check if user exists
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    
    // Create user
    const user = await User.create({ username, email, password });
    
    res.status(201).json({
      success: true,
      user,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide identifier and password' });
    }
    
    // Find user by email or username
    let user = await User.findByEmail(identifier);
    if (!user) {
      user = await User.findByUsername(identifier);
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isPasswordValid = await User.comparePassword(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      },
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};