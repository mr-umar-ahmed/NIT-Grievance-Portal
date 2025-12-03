const User = require('../models/User');
const Grievance = require('../models/Grievance');
const Notification = require('../models/Notification');
const { sendApprovalNotification, sendRejectionNotification } = require('../utils/emailService');

exports.getPendingUsers = async (req, res, next) => {
  try {
    const pendingUsers = await User.find({ 
      isApproved: false,
      role: { $ne: 'ADMIN' }
    }).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingUsers.length,
      data: pendingUsers
    });
  } catch (error) {
    next(error);
  }
};

exports.approveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isApproved = true;
    await user.save();

    await Notification.create({
      user: user._id,
      message: `Your account has been approved. You can now login.`,
      type: 'success'
    });

    // Send approval email to user
    try {
      await sendApprovalNotification(user);
    } catch (emailError) {
      console.error('Failed to send approval notification email:', emailError);
      // Don't block approval if email fails
    }

    res.status(200).json({
      success: true,
      message: 'User approved successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

exports.rejectUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Send rejection email before deleting user
    try {
      await sendRejectionNotification(user);
    } catch (emailError) {
      console.error('Failed to send rejection notification email:', emailError);
      // Don't block rejection if email fails
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User rejected and deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllGrievances = async (req, res, next) => {
  try {
    const grievances = await Grievance.find()
      .populate('user', 'name email role')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: grievances.length,
      data: grievances
    });
  } catch (error) {
    next(error);
  }
};

exports.assignGrievance = async (req, res, next) => {
  try {
    const { staffId } = req.body;
    
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    const staff = await User.findById(staffId);

    if (!staff || staff.role !== 'STAFF') {
      return res.status(400).json({
        success: false,
        message: 'Invalid staff member'
      });
    }

    grievance.assignedTo = staffId;
    grievance.status = 'ASSIGNED';
    grievance.assignedAt = new Date();
    await grievance.save();

    await Notification.create({
      user: grievance.user,
      message: `Your grievance ${grievance.ticketId} has been assigned to ${staff.name}`,
      type: 'info'
    });

    await Notification.create({
      user: staffId,
      message: `You have been assigned grievance ${grievance.ticketId}`,
      type: 'info'
    });

    const populatedGrievance = await Grievance.findById(grievance._id)
      .populate('user', 'name email role')
      .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      message: 'Grievance assigned successfully',
      data: populatedGrievance
    });
  } catch (error) {
    next(error);
  }
};

exports.getStaffList = async (req, res, next) => {
  try {
    const staff = await User.find({ 
      role: 'STAFF',
      isApproved: true 
    }).select('name email department');

    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff
    });
  } catch (error) {
    next(error);
  }
};
