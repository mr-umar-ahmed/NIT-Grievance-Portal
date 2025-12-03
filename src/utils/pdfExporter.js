const PDFDocument = require('pdfkit');
const moment = require('moment');

const generatePDF = (grievances) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      doc.fontSize(20).text('Grievance Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Generated on: ${moment().format('MMMM DD, YYYY HH:mm')}`, { align: 'center' });
      doc.moveDown(2);

      doc.fontSize(12).text(`Total Grievances: ${grievances.length}`, { align: 'left' });
      doc.moveDown(2);

      grievances.forEach((grievance, index) => {
        if (doc.y > 700) {
          doc.addPage();
        }

        doc.fontSize(11).fillColor('#000080').text(`${index + 1}. ${grievance.ticketId}`, { continued: false });
        doc.fontSize(10).fillColor('#000000');
        doc.text(`Title: ${grievance.title}`);
        doc.text(`Category: ${grievance.category}`);
        doc.text(`Priority: ${grievance.priority}`);
        doc.text(`Status: ${grievance.status}`);
        doc.text(`User: ${grievance.user?.name || 'N/A'} (${grievance.user?.role || 'N/A'})`);
        doc.text(`Created: ${moment(grievance.createdAt).format('MMM DD, YYYY')}`);
        
        if (grievance.assignedTo) {
          doc.text(`Assigned To: ${grievance.assignedTo.name}`);
        }
        
        doc.moveDown(1.5);
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generatePDF;
