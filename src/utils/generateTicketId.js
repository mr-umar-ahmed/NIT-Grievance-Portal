const moment = require('moment');

const generateTicketId = (role) => {
  const timestamp = moment().format('YYMMDDHHmmss');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  let prefix = 'GR';
  
  if (role === 'ALUMNI') {
    prefix = 'AL';
  } else if (role === 'STUDENT') {
    prefix = 'ST';
  } else if (role === 'PARENT') {
    prefix = 'PR';
  } else if (role === 'STAFF') {
    prefix = 'SF';
  }
  
  return `${prefix}-${timestamp}-${random}`;
};

module.exports = generateTicketId;
