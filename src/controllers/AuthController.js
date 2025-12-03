const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendUserSignupNotification } = require('../utils/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      department,
      course,
      rollNumber,
      year,
      address,
      idProofType,
      idProofNumber,
      linkedStudentRoll
    } = req.body;

    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      department,
      course,
      rollNumber,
      year,
      address,
      idProofType,
      idProofNumber,
      linkedStudentRoll,
      isApproved: role === 'ADMIN' ? true : false
    });

    // Send email notification to admin for new user signup
    if (role !== 'ADMIN') {
      try {
        await sendUserSignupNotification(user);
      } catch (emailError) {
        console.error('Failed to send signup notification email:', emailError);
        // Don't block registration if email fails
      }
    }

    res.status(201).json({
      success: true,
      message: role === 'ADMIN' 
        ? 'Admin account created successfully' 
        : 'Registration successful. Please wait for admin approval.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isApproved && user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval. Please contact admin.'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
