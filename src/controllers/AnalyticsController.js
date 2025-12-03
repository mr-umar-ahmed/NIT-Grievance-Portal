const Grievance = require('../models/Grievance');
const moment = require('moment');
const generatePDF = require('../utils/pdfExporter');
const generateCSV = require('../utils/csvExporter');

exports.summary = async (req, res, next) => {
  try {
    const totalGrievances = await Grievance.countDocuments();
    const openGrievances = await Grievance.countDocuments({ status: 'OPEN' });
    const assignedGrievances = await Grievance.countDocuments({ status: 'ASSIGNED' });
    const resolvedGrievances = await Grievance.countDocuments({ status: 'RESOLVED' });
    const closedGrievances = await Grievance.countDocuments({ status: 'CLOSED' });

    res.status(200).json({
      success: true,
      data: {
        total: totalGrievances,
        open: openGrievances,
        assigned: assignedGrievances,
        resolved: resolvedGrievances,
        closed: closedGrievances
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.categories = async (req, res, next) => {
  try {
    const categoryData = await Grievance.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: categoryData
    });
  } catch (error) {
    next(error);
  }
};

exports.userType = async (req, res, next) => {
  try {
    const userTypeData = await Grievance.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $group: {
          _id: '$userDetails.role',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: userTypeData
    });
  } catch (error) {
    next(error);
  }
};

exports.monthly = async (req, res, next) => {
  try {
    const sixMonthsAgo = moment().subtract(6, 'months').startOf('month').toDate();

    const monthlyData = await Grievance.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const formattedData = monthlyData.map(item => ({
      month: moment(`${item._id.year}-${item._id.month}`, 'YYYY-M').format('MMM YYYY'),
      count: item.count
    }));

    res.status(200).json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    next(error);
  }
};

exports.exportCSV = async (req, res, next) => {
  try {
    const grievances = await Grievance.find()
      .populate('user', 'name role')
      .populate('assignedTo', 'name')
      .lean();

    const csv = generateCSV(grievances);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=grievances_${moment().format('YYYY-MM-DD')}.csv`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

exports.exportPDF = async (req, res, next) => {
  try {
    const grievances = await Grievance.find()
      .populate('user', 'name role')
      .populate('assignedTo', 'name')
      .lean();

    const pdfBuffer = await generatePDF(grievances);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=grievances_${moment().format('YYYY-MM-DD')}.pdf`);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
