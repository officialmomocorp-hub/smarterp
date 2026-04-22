const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  generateFeeReceipt(payment, school, outputPath) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(outputPath);

      doc.pipe(stream);

      // School Header
      doc.fontSize(20).font('Helvetica-Bold').text(school.name, { align: 'center' });
      doc.fontSize(10).font('Helvetica').text(school.address, { align: 'center' });
      doc.text(`Phone: ${school.phone} | Email: ${school.email}`, { align: 'center' });
      doc.text(`UDISE Code: ${school.udiseCode}`, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).font('Helvetica-Bold').text('FEE RECEIPT', { align: 'center', underline: true });
      doc.moveDown(0.5);

      // Receipt Details
      doc.fontSize(10).font('Helvetica');
      doc.text(`Receipt No: ${payment.receiptNumber}`, { align: 'right' });
      doc.text(`Date: ${new Date(payment.paymentDate).toLocaleDateString('en-IN')}`, { align: 'right' });
      doc.moveDown(1);

      // Student Details
      doc.fontSize(12).font('Helvetica-Bold').text('Student Details');
      doc.fontSize(10).font('Helvetica');
      doc.text(`Name: ${payment.student.profile.firstName} ${payment.student.profile.lastName}`);
      doc.text(`Class: ${payment.student.class.name} - ${payment.student.section.name}`);
      doc.text(`Student ID: ${payment.student.studentId}`);
      doc.text(`Academic Year: ${payment.academicYear.name}`);
      doc.moveDown(0.5);

      // Payment Details
      doc.fontSize(12).font('Helvetica-Bold').text('Payment Details');
      doc.fontSize(10).font('Helvetica');
      doc.text(`Installment: ${payment.installmentNumber}`);
      doc.text(`Total Amount: Rs. ${payment.totalAmount.toFixed(2)}`);
      if (payment.concessionAmount > 0) {
        doc.text(`Concession: -Rs. ${payment.concessionAmount.toFixed(2)}`);
      }
      if (payment.gstAmount > 0) {
        doc.text(`GST: Rs. ${payment.gstAmount.toFixed(2)}`);
      }
      if (payment.lateFine > 0) {
        doc.text(`Late Fine: Rs. ${payment.lateFine.toFixed(2)}`);
      }
      doc.text(`Amount Paid: Rs. ${payment.paidAmount.toFixed(2)}`, { continued: false });
      doc.text(`Balance: Rs. ${payment.balanceAmount.toFixed(2)}`);
      doc.text(`Payment Mode: ${payment.paymentMode}`);
      if (payment.transactionId) {
        doc.text(`Transaction ID: ${payment.transactionId}`);
      }
      doc.moveDown(1);

      // Footer
      doc.fontSize(8).font('Helvetica').text('This is a computer-generated receipt.', { align: 'center' });
      doc.text('Smarterp - Indian School ERP System', { align: 'center' });

      doc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    });
  }

  generateReportCard(student, exam, marks, school, outputPath) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(outputPath);

      doc.pipe(stream);

      // Header
      doc.fontSize(18).font('Helvetica-Bold').text(school.name, { align: 'center' });
      doc.fontSize(10).font('Helvetica').text(school.address, { align: 'center' });
      doc.text(`UDISE: ${school.udiseCode} | Affiliation: ${school.affiliationNumber}`, { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).font('Helvetica-Bold').text('REPORT CARD', { align: 'center', underline: true });
      doc.fontSize(12).text(`${exam.name} - ${exam.academicYear.name}`, { align: 'center' });
      doc.moveDown(0.5);

      // Student Info
      doc.fontSize(10).font('Helvetica');
      doc.text(`Name: ${student.profile.firstName} ${student.profile.lastName}`);
      doc.text(`Class: ${student.class.name} - ${student.section.name}`);
      doc.text(`Roll No: ${student.rollNumber}`);
      doc.text(`Student ID: ${student.studentId}`);
      doc.moveDown(0.5);

      // Marks Table
      doc.fontSize(12).font('Helvetica-Bold').text('Academic Performance');
      doc.moveDown(0.3);

      const tableTop = doc.y;
      const colWidths = [200, 80, 80, 80, 80];
      const headers = ['Subject', 'Max Marks', 'Marks Obtained', 'Grade', 'Status'];

      doc.fontSize(9).font('Helvetica-Bold');
      let x = 50;
      headers.forEach((header, i) => {
        doc.text(header, x, tableTop, { width: colWidths[i], align: i === 0 ? 'left' : 'center' });
        x += colWidths[i];
      });

      doc.moveTo(50, tableTop + 15).lineTo(520, tableTop + 15).stroke();

      let y = tableTop + 20;
      doc.fontSize(9).font('Helvetica');

      marks.forEach((mark) => {
        x = 50;
        const rowData = [
          mark.subject.name,
          mark.maxMarks.toString(),
          mark.marksObtained?.toString() || '-',
          mark.grade || '-',
          parseFloat(mark.marksObtained || 0) >= mark.subject.passMarks ? 'PASS' : 'FAIL',
        ];

        rowData.forEach((cell, i) => {
          doc.text(cell, x, y, { width: colWidths[i], align: i === 0 ? 'left' : 'center' });
          x += colWidths[i];
        });

        y += 18;
      });

      doc.moveTo(50, y).lineTo(520, y).stroke();
      y += 10;

      // Summary
      const totalObtained = marks.reduce((sum, m) => sum + parseFloat(m.marksObtained || 0), 0);
      const totalMax = marks.reduce((sum, m) => sum + m.maxMarks, 0);
      const percentage = ((totalObtained / totalMax) * 100).toFixed(2);

      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(`Total: ${totalObtained}/${totalMax}  |  Percentage: ${percentage}%  |  Grade: ${this.calculateGrade(totalObtained, totalMax)}`, 50, y);

      doc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    });
  }

  calculateGrade(marks, max) {
    const pct = (marks / max) * 100;
    if (pct >= 91) return 'A1';
    if (pct >= 81) return 'A2';
    if (pct >= 71) return 'B1';
    if (pct >= 61) return 'B2';
    if (pct >= 51) return 'C1';
    if (pct >= 41) return 'C2';
    if (pct >= 33) return 'D';
    return 'E';
  }
}

module.exports = new PDFGenerator();
