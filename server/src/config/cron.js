const cron = require('node-cron');
const prisma = require('../config/database');
const { logger } = require('../utils/logger');

// Run daily at 9 AM - Check for fee defaulters and send reminders
cron.schedule('0 9 * * *', async () => {
  logger.info('Running daily fee reminder job...');

  try {
    const currentYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true },
    });

    if (!currentYear) return;

    const overduePayments = await prisma.feePayment.findMany({
      where: {
        academicYearId: currentYear.id,
        status: { in: ['PENDING', 'OVERDUE'] },
        dueDate: { lt: new Date() },
        balanceAmount: { gt: 0 },
      },
      include: {
        student: {
          include: {
            profile: true,
            parents: { include: { parent: true } },
          },
        },
      },
    });

    logger.info(`Found ${overduePayments.length} overdue fee payments`);

    for (const payment of overduePayments) {
      const parentPhone = payment.student.parents?.[0]?.parent?.fatherPhone;
      if (parentPhone) {
        logger.info(`Fee reminder for student ${payment.student.studentId} - Parent: ${parentPhone}`);
        // SMS integration would go here
        // await sendSMS(parentPhone, `Dear Parent, fee payment of Rs.${payment.balanceAmount} is overdue for ${payment.student.profile.firstName}. Please pay at earliest.`);
      }
    }

    // Update overdue status
    await prisma.feePayment.updateMany({
      where: {
        status: 'PENDING',
        dueDate: { lt: new Date() },
      },
      data: { status: 'OVERDUE' },
    });

    logger.info('Fee reminder job completed');
  } catch (error) {
    logger.error(`Fee reminder job failed: ${error.message}`);
  }
});

// Run daily at 8 AM - Check attendance alerts
cron.schedule('0 8 * * *', async () => {
  logger.info('Running daily attendance alert job...');

  try {
    const currentYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true },
    });

    if (!currentYear) return;

    const students = await prisma.student.findMany({
      where: {
        academicYearId: currentYear.id,
        status: 'ACTIVE',
      },
      include: {
        profile: true,
        parents: { include: { parent: true } },
      },
    });

    let alertCount = 0;

    for (const student of students) {
      const attendance = await prisma.attendance.findMany({
        where: { studentId: student.id },
      });

      const total = attendance.length;
      const present = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;

      if (total > 20) {
        const percentage = (present / total) * 100;
        if (percentage < 75) {
          const parentPhone = student.parents?.[0]?.parent?.fatherPhone;
          if (parentPhone) {
            logger.info(`Attendance alert for ${student.studentId} - ${percentage.toFixed(2)}%`);
            // await sendSMS(parentPhone, `Dear Parent, ${student.profile.firstName}'s attendance is ${percentage.toFixed(2)}%. Minimum 75% required.`);
            alertCount++;
          }
        }
      }
    }

    logger.info(`Attendance alert job completed. ${alertCount} alerts sent.`);
  } catch (error) {
    logger.error(`Attendance alert job failed: ${error.message}`);
  }
});

// Run daily at midnight - Check vehicle certificate expiries
cron.schedule('0 0 * * *', async () => {
  logger.info('Running vehicle certificate expiry check...');

  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringVehicles = await prisma.vehicle.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { fitnessExpiry: { lte: thirtyDaysFromNow } },
          { insuranceExpiry: { lte: thirtyDaysFromNow } },
          { driverLicenseExpiry: { lte: thirtyDaysFromNow } },
        ],
      },
    });

    if (expiringVehicles.length > 0) {
      logger.warn(`${expiringVehicles.length} vehicles have expiring certificates`);
      // Send notification to transport in-charge
    }

    logger.info('Vehicle certificate check completed');
  } catch (error) {
    logger.error(`Vehicle certificate check failed: ${error.message}`);
  }
});

// Run on 1st of every month - Generate monthly salary
cron.schedule('0 2 1 * *', async () => {
  logger.info('Running monthly salary calculation job...');

  try {
    const activeStaff = await prisma.staff.findMany({
      where: { status: 'Active' },
    });

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    for (const staff of activeStaff) {
      const existing = await prisma.salary.findFirst({
        where: {
          staffId: staff.id,
          month: currentMonth,
          year: currentYear,
        },
      });

      if (!existing) {
        const basicPay = parseFloat(staff.basicPay);
        const da = basicPay * 0.17;
        const hra = basicPay * 0.08;
        const ta = 1000;
        const grossSalary = basicPay + da + hra + ta;
        const pfEmployee = basicPay * 0.12;
        const pfEmployer = basicPay * 0.12;
        const esi = grossSalary <= 21000 ? grossSalary * 0.0075 : 0;
        const professionalTax = 200;
        const totalDeductions = pfEmployee + esi + professionalTax;
        const netSalary = grossSalary - totalDeductions;

        await prisma.salary.create({
          data: {
            staffId: staff.id,
            userId: staff.userId || 'system',
            month: currentMonth,
            year: currentYear,
            basicPay,
            da,
            hra,
            ta,
            grossSalary,
            pfEmployee,
            pfEmployer,
            esi,
            professionalTax,
            totalDeductions,
            netSalary,
          },
        });

        logger.info(`Salary record created for ${staff.staffId}`);
      }
    }

    logger.info('Monthly salary calculation completed');
  } catch (error) {
    logger.error(`Salary calculation job failed: ${error.message}`);
  }
});

// Run every hour - Check and update biometric attendance sync
cron.schedule('0 * * * *', async () => {
  // Biometric sync would go here
  // This would connect to biometric device API
  // and sync attendance data
});

logger.info('Cron jobs initialized');

module.exports = {};
