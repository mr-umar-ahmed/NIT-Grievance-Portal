const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['STUDENT', 'PARENT', 'ALUMNI', 'STAFF', 'FACULTY', 'ADMIN'],
    required: [true, 'Please specify a role']
  },
  department: {
    type: String,
    trim: true
  },
  course: {
    type: String,
    trim: true
  },
  rollNumber: {
    type: String,
    trim: true,
    sparse: true
  },
  year: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  idProofType: {
    type: String,
    trim: true
  },
  idProofNumber: {
    type: String,
    trim: true
  },
  linkedStudentRoll: {
    type: String,
    trim: true
  },
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
