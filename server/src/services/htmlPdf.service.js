const puppeteer = require('puppeteer');
const prisma = require('../config/database');
const path = require('path');
const fs = require('fs');

class HTMLPDFService {
  constructor() {
    this.primaryColor = '#1B2A4A'; // Deep Navy
    this.accentColor = '#C9A84C';  // Gold
    this.bodyFont = "'Noto Sans', sans-serif";
    this.headingFont = "'Poppins', sans-serif";
  }

  async getBaseTemplate(title, school, content) {
    const logoBase64 = school.logoUrl ? await this.imageToBase64(path.join(__dirname, '../../', school.logoUrl)) : '';
    const logoHtml = logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" class="school-logo" alt="Logo">` : '<div class="logo-placeholder"></div>';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
        <style>
          :root {
            --primary-color: ${this.primaryColor};
            --accent-color: ${this.accentColor};
            --text-color: #1f2937;
            --muted-color: #6b7280;
            --border-color: #e5e7eb;
            --bg-muted: #f8f9fc;
            --radius: 8px;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
          }

          body {
            font-family: ${this.bodyFont};
            color: var(--text-color);
            background: #fff;
            padding: 40px;
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            position: relative;
            overflow: hidden;
          }

          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            font-weight: bold;
            color: var(--primary-color);
            opacity: 0.04;
            white-space: nowrap;
            pointer-events: none;
            z-index: -1;
            text-transform: uppercase;
          }

          /* Header Section */
          .header-band {
            background-color: var(--primary-color);
            color: white;
            padding: 20px 40px;
            margin: -40px -40px 30px -40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .school-info-header {
            display: flex;
            align-items: center;
            gap: 20px;
          }

          .school-logo {
            height: 60px;
            width: 60px;
            object-fit: contain;
            border-radius: 4px;
            background: white;
            padding: 5px;
          }

          .logo-placeholder {
            height: 60px;
            width: 60px;
            background: rgba(255,255,255,0.1);
            border-radius: 4px;
          }

          .school-name-group {
            display: flex;
            flex-direction: column;
          }

          .school-name {
            font-family: ${this.headingFont};
            font-size: 24px;
            font-weight: 700;
            line-height: 1.2;
            text-transform: uppercase;
          }

          .school-tagline {
            font-size: 11px;
            font-style: italic;
            opacity: 0.8;
          }

          .document-title {
            font-family: ${this.headingFont};
            font-size: 20px;
            font-weight: 600;
            color: var(--accent-color);
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .sub-header-details {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            font-size: 10px;
            color: var(--muted-color);
          }

          /* General Layout Styles */
          .grid-container {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }

          .section-card {
            background: white;
            border: 1px solid var(--border-color);
            border-radius: var(--radius);
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            padding: 20px;
          }

          .section-title {
            font-family: ${this.headingFont};
            font-size: 13px;
            font-weight: 700;
            color: var(--primary-color);
            border-bottom: 2px solid var(--accent-color);
            display: inline-block;
            margin-bottom: 15px;
            text-transform: uppercase;
          }

          /* Info Grid Utilities */
          .info-item {
            display: flex;
            margin-bottom: 8px;
            font-size: 11px;
          }

          .info-label {
            font-weight: 700;
            width: 35%;
            color: var(--muted-color);
            text-transform: uppercase;
            font-size: 9px;
          }

          .info-value {
            width: 65%;
            color: var(--text-color);
            font-weight: 600;
          }

          /* Table Styles */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 11px;
          }

          thead th {
            background-color: var(--primary-color);
            color: white;
            text-align: left;
            padding: 10px 15px;
            font-family: ${this.headingFont};
            font-weight: 600;
            text-transform: uppercase;
            font-size: 10px;
          }

          tbody tr:nth-child(even) {
            background-color: var(--bg-muted);
          }

          tbody td {
            padding: 10px 15px;
            border-bottom: 1px solid var(--border-color);
          }

          .text-right { text-align: right; }
          .text-center { text-align: center; }

          /* Footer Styles */
          .footer-section {
            position: absolute;
            bottom: 40px;
            left: 40px;
            right: 40px;
          }

          .footer-line {
            border-top: 1px solid var(--border-color);
            margin-bottom: 10px;
          }

          .school-footer-info {
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            color: var(--muted-color);
            font-weight: 600;
          }

          /* Badge Styles */
          .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            color: white;
          }
          .badge-green { background: #10b981; }
          .badge-red { background: #ef4444; }
          .badge-orange { background: #f59e0b; }

          /* Signature Styles */
          .signature-group {
            display: flex;
            justify-content: space-between;
            margin-top: 60px;
            padding: 0 20px;
          }

          .signature-block {
            text-align: center;
            width: 160px;
          }

          .signature-line {
            border-top: 1.5px solid var(--primary-color);
            margin-bottom: 8px;
          }

          .signature-label {
            font-size: 10px;
            font-weight: 700;
            color: var(--primary-color);
            text-transform: uppercase;
          }

          @media print {
            body { padding: 40px; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="watermark">${school.name}</div>
        
        <header class="header-band">
          <div class="school-info-header">
            ${logoHtml}
            <div class="school-name-group">
              <span class="school-name">${school.name}</span>
              <span class="school-tagline">Excellence in Education Since Enrollment</span>
            </div>
          </div>
          <div class="document-title">${title}</div>
        </header>

        <div class="sub-header-details">
          <div>Affiliation: ${school.affiliationNumber || 'N/A'} (CBSE Board)</div>
          <div>UDISE: ${school.udiseCode} | Website: ${school.website || 'www.smarterp.in'}</div>
        </div>

        <main>
          ${content}
        </main>

        <footer class="footer-section">
          <div class="footer-line"></div>
          <div class="school-footer-info">
            <span>${school.address}, ${school.city}, ${school.state} - ${school.pincode}</span>
            <span>Phone: ${school.phone} | Email: ${school.email}</span>
            <span>Printed via Smarterp.in</span>
          </div>
        </footer>
      </body>
      </html>
    `;
  }

  async imageToBase64(absolutePath) {
    try {
      if (fs.existsSync(absolutePath)) {
        const image = fs.readFileSync(absolutePath);
        return image.toString('base64');
      }
      return '';
    } catch (err) {
      console.error('Base64 error', err);
      return '';
    }
  }

  async generatePDF(html, res) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        printBackground: true
      });
      
      res.end(pdf);
    } catch (error) {
      console.error('Puppeteer PDF error:', error);
      res.status(500).json({ error: 'Failed to generate PDF' });
    } finally {
      if (browser) await browser.close();
    }
  }

  // FEATURE 1: FEE RECEIPT
  async generateFeeReceipt(paymentId, schoolId, res) {
    const payment = await prisma.feePayment.findUnique({
      where: { id: paymentId },
      include: {
        student: { include: { profile: true, class: true, section: true } },
        academicYear: true
      }
    });

    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    
    const content = `
      <div class="grid-container">
        <div class="section-card" style="grid-column: span 6;">
          <h3 class="section-title">Receipt Details</h3>
          <div class="info-item"><span class="info-label">Receipt No</span><span class="info-value">${payment.receiptNumber}</span></div>
          <div class="info-item"><span class="info-label">Date</span><span class="info-value">${new Date(payment.paymentDate).toLocaleDateString()}</span></div>
          <div class="info-item"><span class="info-label">Academic Year</span><span class="info-value">${payment.academicYear.name}</span></div>
          <div class="info-item"><span class="info-label">Mode</span><span class="info-value">${payment.paymentMode}</span></div>
        </div>
        <div class="section-card" style="grid-column: span 6;">
          <h3 class="section-title">Student Information</h3>
          <div class="info-item"><span class="info-label">Name</span><span class="info-value">${payment.student.profile.firstName} ${payment.student.profile.lastName}</span></div>
          <div class="info-item"><span class="info-label">Adm No</span><span class="info-value">${payment.student.studentId}</span></div>
          <div class="info-item"><span class="info-label">Class</span><span class="info-value">${payment.student.class.name} - ${payment.student.section.name}</span></div>
          <div class="info-item"><span class="info-label">Roll No</span><span class="info-value">${payment.student.rollNumber || 'N/A'}</span></div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Sl</th>
            <th>Fee Head / Particulars</th>
            <th class="text-right">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Tuition & Composite Fee</td>
            <td class="text-right">${parseFloat(payment.totalAmount).toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end;">
        <div class="section-card" style="width: 250px; background: var(--bg-muted); border: none;">
          <div class="info-item"><span class="info-label">Gross Amount</span><span class="info-value text-right">₹${parseFloat(payment.totalAmount).toLocaleString('en-IN')}</span></div>
          <div class="info-item"><span class="info-label" style="color: #ef4444;">Concession</span><span class="info-value text-right" style="color: #ef4444;">- ₹${parseFloat(payment.concessionAmount || 0).toLocaleString('en-IN')}</span></div>
          <div style="border-top: 1px solid #d1d5db; margin: 8px 0;"></div>
          <div class="info-item" style="font-size: 14px;"><span class="info-label">TOTAL PAID</span><span class="info-value text-right" style="color: var(--primary-color);">₹${parseFloat(payment.paidAmount).toLocaleString('en-IN')}</span></div>
        </div>
      </div>

      <div style="margin-top: 20px;">
        <p style="font-size: 10px; font-weight: 700; color: var(--muted-color);">NET AMOUNT IN WORDS: <span style="color: var(--primary-color); text-transform: uppercase;">${this.numberToWords(payment.paidAmount)} ONLY</span></p>
      </div>

      <div class="signature-group">
        <div class="signature-block">
          <div class="signature-line"></div>
          <div class="signature-label">Cashier Signature</div>
        </div>
        <div class="signature-block">
          <div class="signature-line"></div>
          <div class="signature-label">Officer-In-Charge</div>
        </div>
        <div class="signature-block">
          <div class="signature-line"></div>
          <div class="signature-label">Principal</div>
        </div>
      </div>
    `;

    const html = await this.getBaseTemplate('Fee Receipt', school, content);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="receipt-${payment.receiptNumber}.pdf"`);
    await this.generatePDF(html, res);
  }

  // FEATURE 2: REPORT CARD (PROGRESS REPORT)
  async generateReportCard(studentId, examId, schoolId, res) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { profile: true, class: true, section: true }
    });

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { academicYear: true }
    });

    const marks = await prisma.mark.findMany({
      where: { studentId, examId },
      include: { subject: true }
    });

    const school = await prisma.school.findUnique({ where: { id: schoolId } });

    let totalObtained = 0, totalMax = 0, failedCount = 0;
    const tableRows = marks.map((m, i) => {
      totalObtained += m.marksObtained;
      totalMax += m.maxMarks;
      if (m.marksObtained < m.subject.passMarks) failedCount++;
      
      return `
        <tr>
          <td>${i+1}</td>
          <td style="font-weight: 700;">${m.subject.name.toUpperCase()}</td>
          <td class="text-center">${m.maxMarks}</td>
          <td class="text-center">${m.subject.passMarks}</td>
          <td class="text-center" style="font-weight: 700; ${m.marksObtained < m.subject.passMarks ? 'color: #ef4444;' : ''}">${m.marksObtained}</td>
          <td class="text-center">${m.grade || '-'}</td>
        </tr>
      `;
    }).join('');

    const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(2) : 0;
    const resColor = failedCount === 0 ? 'badge-green' : 'badge-red';
    const resText = failedCount === 0 ? 'PASSED / PROMOTED' : 'DETENTED / FAILED';

    const content = `
      <div class="grid-container">
        <div class="section-card" style="grid-column: span 12;">
          <h3 class="section-title">Academic Session 2025-26 - Profile</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <div class="info-item"><span class="info-label">Student Name</span><span class="info-value">${student.profile.firstName} ${student.profile.lastName}</span></div>
              <div class="info-item"><span class="info-label">Father's Name</span><span class="info-value">${student.parents?.[0]?.parent?.fatherName || 'N/A'}</span></div>
              <div class="info-item"><span class="info-label">Adm ID / Roll No</span><span class="info-value">${student.studentId} / ${student.rollNumber || '00'}</span></div>
            </div>
            <div>
              <div class="info-item"><span class="info-label">Class & Section</span><span class="info-value">${student.class.name} - ${student.section.name}</span></div>
              <div class="info-item"><span class="info-label">Exam Title</span><span class="info-value">${exam.name}</span></div>
              <div class="info-item"><span class="info-label">Attendance</span><span class="info-value">192 / 210 Days</span></div>
            </div>
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th width="40">Sl</th>
            <th>Scholastic Subject</th>
            <th class="text-center">Max Marks</th>
            <th class="text-center">Pass Marks</th>
            <th class="text-center">Obtained</th>
            <th class="text-center">Grade</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="section-card" style="margin-bottom: 30px; background: var(--bg-muted);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 13px;">
            <p><strong>Grand Total:</strong> ${totalObtained} / ${totalMax}</p>
            <p><strong>Aggregate Percentage:</strong> ${percentage}%</p>
          </div>
          <div style="text-align: right;">
            <div class="badge ${resColor}" style="padding: 10px 20px; font-size: 16px;">${resText}</div>
          </div>
        </div>
      </div>

      <div class="section-card">
        <h3 class="section-title">Co-Scholastic & Behavioral Observations</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; font-size: 11px;">
           <p><strong>Discipline:</strong> Grade A</p>
           <p><strong>Punctuality:</strong> Grade A+</p>
           <p><strong>Handwriting:</strong> Grade B</p>
           <p><strong>Social Skills:</strong> Grade A</p>
           <p><strong>Art & Culture:</strong> Grade B</p>
           <p><strong>Sports:</strong> Grade A</p>
        </div>
      </div>

      <div class="signature-group">
        <div class="signature-block"><div class="signature-line"></div><div class="signature-label">Class Teacher</div></div>
        <div class="signature-block"><div class="signature-line"></div><div class="signature-label">Office Seal</div></div>
        <div class="signature-block"><div class="signature-line"></div><div class="signature-label">Principal</div></div>
      </div>
    `;

    const html = await this.getBaseTemplate('Progress Report Card', school, content);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="reportcard-${student.studentId}.pdf"`);
    await this.generatePDF(html, res);
  }

  // FEATURE 3: TRANSFER CERTIFICATE (TC)
  async generateTC(studentId, schoolId, res) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { 
        profile: true, 
        class: true, 
        section: true, 
        academicYear: true,
        parents: { include: { parent: true } }
      }
    });

    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    const tcNo = `TC/${new Date().getFullYear()}/${student.studentId.split('-').pop()}`;

    const content = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="font-family: ${this.headingFont}; color: var(--primary-color); border-bottom: 2px double var(--accent-color); display: inline-block; padding: 0 40px 5px;">SCHOOL LEAVING CERTIFICATE</h2>
        <p style="font-size: 11px; color: var(--muted-color); margin-top: 5px;">(Issued by the School Administration as per Record)</p>
      </div>

      <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 12px; margin-bottom: 30px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
        <span>Sl No: ${tcNo}</span>
        <span>Admission No: ${student.studentId}</span>
      </div>

      <div style="line-height: 2.2; font-size: 13px;">
        <p>1. Name of the candidate: <span style="font-weight: 700; border-bottom: 1px dotted #000; padding: 0 10px;">${student.profile.firstName} ${student.profile.lastName}</span></p>
        <p>2. Mother's Name: <span style="font-weight: 700; border-bottom: 1px dotted #000; padding: 0 10px;">${student.parents?.[0]?.parent?.motherName?.toUpperCase() || 'N/A'}</span></p>
        <p>3. Father's Name: <span style="font-weight: 700; border-bottom: 1px dotted #000; padding: 0 10px;">${student.parents?.[0]?.parent?.fatherName?.toUpperCase() || 'N/A'}</span></p>
        <p>4. Nationality: <span style="font-weight: 700; border-bottom: 1px dotted #000; padding: 0 10px;">INDIAN</span></p>
        <p>5. Whether belongs to SC/ST/OBC: <span style="font-weight: 700; border-bottom: 1px dotted #000; padding: 0 10px;">${student.profile.casteCategory || 'GENERAL'}</span></p>
        <p>6. Date of Birth (in Figures): <span style="font-weight: 700; border-bottom: 1px dotted #000; padding: 0 10px;">${student.profile.dateOfBirth.toLocaleDateString()}</span></p>
        <p>7. Class in which student last studied: <span style="font-weight: 700; border-bottom: 1px dotted #000; padding: 0 10px;">${student.class.name} (${student.section.name})</span></p>
        <p>8. School/Board Annual Examination last taken: <span style="font-weight: 700; border-bottom: 1px dotted #000; padding: 0 10px;">PASSED - ${student.academicYear.name}</span></p>
        <p>9. Whether qualified for promotion: <span style="font-weight: 700; border-bottom: 1px dotted #000; padding: 0 10px;">YES</span></p>
        <p>10. General Conduct: <span style="font-weight: 700; border-bottom: 1px dotted #000; padding: 0 10px;">EXCELLENT / GOOD</span></p>
        <p>11. Date of Application for TC: <span style="font-weight: 700; border-bottom: 1px dotted #000; padding: 0 10px;">${new Date().toLocaleDateString()}</span></p>
        <p>12. Reason for leaving the school: <span style="font-weight: 700; border-bottom: 1px dotted #000; padding: 0 10px;">PARENT REQUEST / MIGRATION</span></p>
      </div>

      <div style="margin-top: 50px; text-align: center; font-weight: 700; color: var(--muted-color); font-size: 11px;">
        Certified that the above information is as per the office records of the institution.
      </div>

      <div class="signature-group" style="margin-top: 80px;">
        <div class="signature-block"><div class="signature-line"></div><div class="signature-label">Prepared By</div></div>
        <div class="signature-block"><div class="signature-line"></div><div class="signature-label">Checked By</div></div>
        <div class="signature-block"><div class="signature-line"></div><div class="signature-label">Principal (With Seal)</div></div>
      </div>
    `;

    const html = await this.getBaseTemplate('Transfer Certificate', school, content);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="TC-${student.studentId}.pdf"`);
    await this.generatePDF(html, res);
  }

  // FEATURE 4: SALARY SLIP
  async generateSalarySlip(salaryId, schoolId, res) {
    const salary = await prisma.salary.findUnique({
      where: { id: salaryId },
      include: { staff: true }
    });

    const school = await prisma.school.findUnique({ where: { id: schoolId } });

    const content = `
      <div class="grid-container">
        <div class="section-card" style="grid-column: span 12;">
          <h3 class="section-title">employee details</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <div class="info-item"><span class="info-label">Name</span><span class="info-value">${salary.staff.qualification || 'Staff'}</span></div>
              <div class="info-item"><span class="info-label">ID</span><span class="info-value">${salary.staff.staffId}</span></div>
              <div class="info-item"><span class="info-label">Department</span><span class="info-value">${salary.staff.department || 'General'}</span></div>
            </div>
            <div>
              <div class="info-item"><span class="info-label">Designation</span><span class="info-value">${salary.staff.designation || 'Staff'}</span></div>
              <div class="info-item"><span class="info-label">Month</span><span class="info-value">${salary.month} / ${salary.year}</span></div>
              <div class="info-item"><span class="info-label">Bank</span><span class="info-value">HDFC Bank Acc XXXX</span></div>
            </div>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px;">
        <div>
          <h3 class="section-title">Earnings</h3>
          <table>
             <thead><tr><th>Description</th><th class="text-right">Amount (₹)</th></tr></thead>
             <tbody>
                <tr><td>Basic Salary</td><td class="text-right">${salary.basicPay.toLocaleString('en-IN')}</td></tr>
                <tr><td>H.R.A.</td><td class="text-right">${salary.hra.toLocaleString('en-IN')}</td></tr>
                <tr><td>Other Allowances</td><td class="text-right">${(salary.ta || 0) + (salary.da || 0)}</td></tr>
                <tr style="font-weight: 700;"><td>GROSS EARNINGS</td><td class="text-right">${salary.grossSalary.toLocaleString('en-IN')}</td></tr>
             </tbody>
          </table>
        </div>
        <div>
          <h3 class="section-title">Deductions</h3>
          <table>
             <thead><tr><th>Description</th><th class="text-right">Amount (₹)</th></tr></thead>
             <tbody>
                <tr><td>Provident Fund</td><td class="text-right">${salary.pfEmployee.toLocaleString('en-IN')}</td></tr>
                <tr><td>TDS</td><td class="text-right">${(salary.incomeTax || 0).toLocaleString('en-IN')}</td></tr>
                <tr><td>Other Deductions</td><td class="text-right">${(salary.esi || 0) + (salary.professionalTax || 0)}</td></tr>
                <tr style="font-weight: 700; color: #ef4444;"><td>TOTAL DEDUCTIONS</td><td class="text-right">${salary.totalDeductions.toLocaleString('en-IN')}</td></tr>
             </tbody>
          </table>
        </div>
      </div>

      <div class="section-card" style="background: var(--primary-color); color: white;">
         <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 16px; font-weight: 700; font-family: ${this.headingFont}; text-transform: uppercase;">Net Payable Salary</span>
            <span style="font-size: 24px; font-weight: 700; color: var(--accent-color);">₹${salary.netSalary.toLocaleString('en-IN')}</span>
         </div>
         <p style="font-size: 10px; margin-top: 10px; opacity: 0.8; text-transform: uppercase;">Amount in words: ${this.numberToWords(salary.netSalary)} Only</p>
      </div>

      <div class="signature-group" style="margin-top: 60px;">
        <div class="signature-block"><div class="signature-line"></div><div class="signature-label">Employee Signature</div></div>
        <div class="signature-block"></div>
        <div class="signature-block"><div class="signature-line"></div><div class="signature-label">Officer-In-Charge</div></div>
      </div>
    `;

    const html = await this.getBaseTemplate('Salary Slip', school, content);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="salary-${salary.staff.staffId}.pdf"`);
    await this.generatePDF(html, res);
  }

  // FEATURE 5: STUDENT ID CARD
  async generateIDCard(studentId, schoolId, res) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { 
        profile: true, 
        class: true, 
        section: true, 
        academicYear: true,
        parents: { include: { parent: true } }
      }
    });

    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    const logoBase64 = school.logoUrl ? await this.imageToBase64(path.join(__dirname, '../../', school.logoUrl)) : '';
    const logoHtml = logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" class="school-logo">` : '';

    const photoBase64 = student.profile?.photoUrl ? await this.imageToBase64(path.join(__dirname, '../../', student.profile.photoUrl)) : '';
    const photoHtml = photoBase64 ? `<img src="data:image/png;base64,${photoBase64}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">` : `
                <div class="photo-icon">👤</div>
                PASTE PHOTO
              `;

    const cardHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Noto+Sans:wght@400;700&display=swap" rel="stylesheet">
        <style>
          :root {
            --primary: ${this.primaryColor};
            --accent: ${this.accentColor};
          }
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: 'Noto Sans', sans-serif;
            background: #f0f2f5;
            display: flex;
            justify-content: center;
          }
          .id-card {
            width: 350px;
            height: 220px;
            border-radius: 12px;
            background: white;
            padding: 0;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
            border: 1px solid #e2e8f0;
          }
          .card-header {
            background-color: var(--primary);
            padding: 10px 15px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 3px solid var(--accent);
          }
          .school-logo {
            height: 32px;
            width: 32px;
            object-fit: contain;
            background: white;
            border-radius: 4px;
            padding: 2px;
          }
          .school-name-text {
            color: white;
            font-family: 'Poppins', sans-serif;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            line-height: 1.2;
            letter-spacing: 0.5px;
          }
          .card-body {
            display: flex;
            padding: 12px 15px;
            gap: 15px;
            flex: 1;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          }
          .student-photo-frame {
            width: 85px;
            height: 105px;
            background: #f1f5f9;
            border: 1.5px solid #e2e8f0;
            border-radius: 6px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            color: #94a3b8;
            font-weight: 700;
            overflow: hidden;
          }
          .photo-icon { font-size: 24px; margin-bottom: 2px; opacity: 0.5; }
          
          .id-details {
            display: flex;
            flex-direction: column;
            gap: 3px;
            flex: 1;
          }
          .student-name {
            font-family: 'Poppins', sans-serif;
            font-size: 14px;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 4px;
            text-transform: uppercase;
            border-bottom: 1.5px solid var(--accent);
            width: fit-content;
            padding-bottom: 1px;
          }
          .detail-row {
            display: flex;
            font-size: 9px;
            line-height: 1.4;
          }
          .detail-label {
            width: 60px;
            color: #64748b;
            font-weight: 700;
            text-transform: uppercase;
          }
          .detail-value {
            color: #1e293b;
            font-weight: 600;
          }
          .card-footer {
            background-color: var(--primary);
            padding: 5px 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .footer-text { 
            font-size: 8px; 
            color: white; 
            font-weight: 700; 
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .barcode-area {
            position: absolute;
            bottom: 35px;
            right: 15px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .barcode-mock {
            width: 60px;
            height: 15px;
            background: repeating-linear-gradient(90deg, #333, #333 1px, transparent 1px, transparent 3px);
            opacity: 0.3;
          }
          .id-num { font-size: 7px; color: #94a3b8; font-family: monospace; margin-top: 2px; }
        </style>
      </head>
      <body>
        <div class="id-card">
           <div class="card-header">
              ${logoHtml || '<div style="font-size: 20px;">🏫</div>'}
              <div class="school-name-text">${school.name}<br><span style="font-size: 7px; font-weight: 400; opacity: 0.8;">${school.city}, ${school.state}</span></div>
           </div>
           <div class="card-body">
              <div class="student-photo-frame">
                ${photoHtml}
              </div>
              <div class="id-details">
                 <div class="student-name">${student.profile.firstName} ${student.profile.lastName}</div>
                 <div class="detail-row"><span class="detail-label">Admission ID</span><span class="detail-value">${student.studentId}</span></div>
                 <div class="detail-row"><span class="detail-label">Class & Sec</span><span class="detail-value">${student.class.name} - ${student.section.name}</span></div>
                 <div class="detail-row"><span class="detail-label">Roll No</span><span class="detail-value">${student.rollNumber || 'N/A'}</span></div>
                 <div class="detail-row"><span class="detail-label">Blood Grp</span><span class="detail-value">${student.profile.bloodGroup || 'N/A'}</span></div>
                 <div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">${student.profile.phone || '99XXXXXXXX'}</span></div>
              </div>
              <div class="barcode-area">
                <div class="barcode-mock"></div>
                <div class="id-num">#${student.studentId.split('-').pop()}</div>
              </div>
           </div>
           <div class="card-footer">
              <span class="footer-text">Student Identity Card</span>
              <span class="footer-text" style="opacity: 0.8;">Session 2025-26</span>
           </div>
        </div>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'application/pdf');
    await this.generatePDF(cardHtml, res);
  }

  // FEATURE 6: ADMIT CARD (HALL TICKET)
  async generateAdmitCard(studentId, examId, schoolId, res) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        profile: true,
        class: true,
        section: true,
      }
    });

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        schedules: { include: { subject: true }, orderBy: { date: 'asc' } },
      }
    });

    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    const logoBase64 = school.logoUrl ? await this.imageToBase64(path.join(__dirname, '../../', school.logoUrl)) : '';
    const logoHtml = logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" class="school-logo" style="height: 50px;">` : '';

    const scheduleRows = exam.schedules.map(s => `
      <tr>
        <td>${new Date(s.date).toLocaleDateString('en-IN')}</td>
        <td>${s.dayOfWeek}</td>
        <td style="font-weight: 700;">${s.subject.name}</td>
        <td>${s.startTime} - ${s.endTime}</td>
      </tr>
    `).join('');

    const content = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="font-family: ${this.headingFont}; color: var(--primary-color); letter-spacing: 2px;">HALL TICKET / ADMIT CARD</h2>
        <p style="font-size: 12px; font-weight: 700; color: var(--accent-color);">${exam.name.toUpperCase()} - ACADEMIC SESSION 2025-26</p>
      </div>

      <div class="section-card" style="margin-bottom: 30px; border: 2px solid var(--primary-color);">
        <div style="display: flex; gap: 30px;">
          <div style="width: 110px; height: 130px; border: 2px dashed var(--border-color); display: flex; align-items: center; justify-content: center; font-size: 10px; color: var(--muted-color); border-radius: 4px;">
            AFFIX PHOTO
          </div>
          <div style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <div class="info-item"><span class="info-label">Candidate Name</span><span class="info-value">${student.profile.firstName} ${student.profile.lastName}</span></div>
              <div class="info-item"><span class="info-label">Admission ID</span><span class="info-value">${student.studentId}</span></div>
              <div class="info-item"><span class="info-label">Class / Sec</span><span class="info-value">${student.class.name} - ${student.section.name}</span></div>
            </div>
            <div>
              <div class="info-item"><span class="info-label">Roll Number</span><span class="info-value">${student.rollNumber || 'TBA'}</span></div>
              <div class="info-item"><span class="info-label">Date of Birth</span><span class="info-value">${student.profile.dateOfBirth.toLocaleDateString()}</span></div>
              <div class="info-item"><span class="info-label">Aadhar No</span><span class="info-value">XXXX-XXXX-${student.profile.aadharNumber?.slice(-4) || '0000'}</span></div>
            </div>
          </div>
        </div>
      </div>

      <h3 class="section-title">Examination Schedule</h3>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Day</th>
            <th>Subject Name</th>
            <th>Exam Timing</th>
          </tr>
        </thead>
        <tbody>
          ${scheduleRows}
        </tbody>
      </table>

      <div class="section-card" style="background: #fffdf0; border: 1px solid #ffeeba;">
        <h3 class="section-title" style="border-bottom-color: #856404; color: #856404;">Important Instructions</h3>
        <ol style="font-size: 10px; padding-left: 20px; line-height: 1.6; color: #856404;">
          <li>Students must carry this Hall Ticket and School ID Card to the exam hall.</li>
          <li>Report at least 30 minutes before the commencement of the examination.</li>
          <li>No candidate will be allowed to enter the hall after 15 minutes of start time.</li>
          <li>Electronic gadgets, smartwatches, and mobile phones are strictly prohibited.</li>
          <li>Maintain strict silence and discipline in the examination hall.</li>
        </ol>
      </div>

      <div class="signature-group" style="margin-top: 80px;">
        <div class="signature-block"><div class="signature-line"></div><div class="signature-label">Candidate's Signature</div></div>
        <div class="signature-block"><div class="signature-line"></div><div class="signature-label">Office Seal</div></div>
        <div class="signature-block"><div class="signature-line"></div><div class="signature-label">Principal</div></div>
      </div>
    `;

    const html = await this.getBaseTemplate('Hall Ticket', school, content);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="hallticket-${student.studentId}.pdf"`);
    await this.generatePDF(html, res);
  }


  numberToWords(num) {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    
    const inWords = (n) => {
      if ((n = n.toString()).length > 9) return 'overflow';
      let n_arr = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!n_arr) return '';
      let str = '';
      str += (n_arr[1] != 0) ? (a[Number(n_arr[1])] || b[n_arr[1][0]] + ' ' + a[n_arr[1][1]]) + 'crore ' : '';
      str += (n_arr[2] != 0) ? (a[Number(n_arr[2])] || b[n_arr[2][0]] + ' ' + a[n_arr[2][1]]) + 'lakh ' : '';
      str += (n_arr[3] != 0) ? (a[Number(n_arr[3])] || b[n_arr[3][0]] + ' ' + a[n_arr[3][1]]) + 'thousand ' : '';
      str += (n_arr[4] != 0) ? (a[Number(n_arr[4])] || b[n_arr[4][0]] + ' ' + a[n_arr[4][1]]) + 'hundred ' : '';
      str += (n_arr[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n_arr[5])] || b[n_arr[5][0]] + ' ' + a[n_arr[5][1]]) : '';
      return str.trim();
    };
    return inWords(Math.floor(num));
  }
}

module.exports = new HTMLPDFService();
