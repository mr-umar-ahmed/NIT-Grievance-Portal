const { Parser } = require('json2csv');
const moment = require('moment');

const generateCSV = (grievances) => {
  try {
    const fields = [
      { label: 'Ticket ID', value: 'ticketId' },
      { label: 'Title', value: 'title' },
      { label: 'Category', value: 'category' },
      { label: 'Priority', value: 'priority' },
      { label: 'Status', value: 'status' },
      { label: 'User Name', value: 'user.name' },
      { label: 'User Role', value: 'user.role' },
      { label: 'Assigned To', value: 'assignedTo.name' },
      { label: 'Created At', value: (row) => moment(row.createdAt).format('YYYY-MM-DD HH:mm') },
      { label: 'Assigned At', value: (row) => row.assignedAt ? moment(row.assignedAt).format('YYYY-MM-DD HH:mm') : '' },
      { label: 'Resolved At', value: (row) => row.resolvedAt ? moment(row.resolvedAt).format('YYYY-MM-DD HH:mm') : '' },
      { label: 'Closed At', value: (row) => row.closedAt ? moment(row.closedAt).format('YYYY-MM-DD HH:mm') : '' }
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(grievances);
    return csv;
  } catch (error) {
    throw error;
  }
};

module.exports = generateCSV;
