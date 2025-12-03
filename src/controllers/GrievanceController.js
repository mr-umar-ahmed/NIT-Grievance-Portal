const Grievance = require('../models/Grievance');
const Notification = require('../models/Notification');
const generateTicketId = require('../utils/generateTicketId');

exports.createGrievance = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;

    const ticketId = generateTicketId(req.user.role);

    const grievance = await Grievance.create({
      user: req.user._id,
      title,
      description,
      category,
      priority: priority || 'Medium',
      ticketId,
      status: 'OPEN'
    });

    await Notification.create({
      user: req.user._id,
      message: `Your grievance ${ticketId} has been created successfully`,
      type: 'success'
    });

    const populatedGrievance = await Grievance.findById(grievance._id)
      .populate('user', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Grievance created successfully',
      data: populatedGrievance
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyGrievances = async (req, res, next) => {
  try {
    const grievances = await Grievance.find({ user: req.user._id })
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

exports.getAssignedToMe = async (req, res, next) => {
  try {
    const grievances = await Grievance.find({ assignedTo: req.user._id })
      .populate('user', 'name email role')
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

exports.getGrievance = async (req, res, next) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .populate('user', 'name email role phone')
      .populate('assignedTo', 'name email');

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    if (
      req.user.role !== 'ADMIN' &&
      req.user.role !== 'STAFF' &&
      grievance.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this grievance'
      });
    }

    res.status(200).json({
      success: true,
      data: grievance
    });
  } catch (error) {
    next(error);
  }
};

exports.resolveGrievance = async (req, res, next) => {
  try {
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    if (
      req.user.role !== 'ADMIN' &&
      grievance.assignedTo?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to resolve this grievance'
      });
    }

    grievance.status = 'RESOLVED';
    grievance.resolvedAt = new Date();
    await grievance.save();

    await Notification.create({
      user: grievance.user,
      message: `Your grievance ${grievance.ticketId} has been resolved`,
      type: 'success'
    });

    const populatedGrievance = await Grievance.findById(grievance._id)
      .populate('user', 'name email role')
      .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      message: 'Grievance resolved successfully',
      data: populatedGrievance
    });
  } catch (error) {
    next(error);
  }
};

exports.reopenGrievance = async (req, res, next) => {
  try {
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    if (grievance.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reopen this grievance'
      });
    }

    if (grievance.status !== 'RESOLVED' && grievance.status !== 'CLOSED') {
      return res.status(400).json({
        success: false,
        message: 'Only resolved or closed grievances can be reopened'
      });
    }

    grievance.status = 'ASSIGNED';
    grievance.resolvedAt = null;
    grievance.closedAt = null;
    await grievance.save();

    if (grievance.assignedTo) {
      await Notification.create({
        user: grievance.assignedTo,
        message: `Grievance ${grievance.ticketId} has been reopened`,
        type: 'warning'
      });
    }

    const populatedGrievance = await Grievance.findById(grievance._id)
      .populate('user', 'name email role')
      .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      message: 'Grievance reopened successfully',
      data: populatedGrievance
    });
  } catch (error) {
    next(error);
  }
};

exports.closeGrievance = async (req, res, next) => {
  try {
    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: 'Grievance not found'
      });
    }

    if (grievance.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to close this grievance'
      });
    }

    if (grievance.status !== 'RESOLVED') {
      return res.status(400).json({
        success: false,
        message: 'Only resolved grievances can be closed'
      });
    }

    grievance.status = 'CLOSED';
    grievance.closedAt = new Date();
    await grievance.save();

    if (grievance.assignedTo) {
      await Notification.create({
        user: grievance.assignedTo,
        message: `Grievance ${grievance.ticketId} has been closed by the user`,
        type: 'info'
      });
    }

    const populatedGrievance = await Grievance.findById(grievance._id)
      .populate('user', 'name email role')
      .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      message: 'Grievance closed successfully',
      data: populatedGrievance
    });
  } catch (error) {
    next(error);
  }
};
