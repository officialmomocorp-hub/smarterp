const prisma = require('../config/database');
const { AppError } = require('../utils/appError');

class ExamService {
  async createExam(data, schoolId) {
    const exam = await prisma.exam.create({
      data: {
        schoolId,
        name: data.name,
        type: data.type,
        classId: data.classId,
        academicYearId: data.academicYearId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        maxMarks: data.maxMarks || 100,
        passMarks: data.passMarks || 33,
        weightage: data.weightage || 100,
        isCce: data.isCce || false,
      },
      include: { class: true },
    });

    if (data.subjects && data.subjects.length > 0) {
      for (const subject of data.subjects) {
        await prisma.examSubject.create({
          data: {
            examId: exam.id,
            subjectId: subject.subjectId,
            maxMarks: subject.maxMarks || exam.maxMarks,
            passMarks: subject.passMarks || exam.passMarks,
          },
        });
      }
    }

    return exam;
  }

  async enterMarks(data, enteredBy, schoolId) {
    const { examId, studentId, subjectId, marksObtained } = data;

    // Security Fix: Verify exam ownership
    const examSubject = await prisma.examSubject.findFirst({
      where: { 
        examId, 
        subjectId,
        exam: { schoolId }
      },
      include: { exam: true },
    });

    if (!examSubject) {
      throw new AppError('Exam subject not found', 404);
    }

    const grade = this.calculateGrade(marksObtained, examSubject.maxMarks);

    const mark = await prisma.mark.upsert({
      where: {
        examId_studentId_subjectId: {
          examId,
          studentId,
          subjectId,
        },
      },
      update: {
        marksObtained,
        grade,
        enteredBy,
      },
      create: {
        examId,
        studentId,
        subjectId,
        marksObtained,
        maxMarks: examSubject.maxMarks,
        grade,
        enteredBy,
      },
    });

    return mark;
  }

  async bulkEnterMarks(data, enteredBy, schoolId) {
    const { examId, marks } = data;
    const results = [];

    for (const markData of marks) {
      const mark = await this.enterMarks({
        examId,
        studentId: markData.studentId,
        subjectId: markData.subjectId,
        marksObtained: markData.marksObtained,
      }, enteredBy, schoolId);

      results.push(mark);
    }

    return results;
  }

  async getStudentResult(studentId, examId, schoolId) {
    const marks = await prisma.mark.findMany({
      where: { 
        studentId, 
        examId,
        exam: { schoolId }
      },
      include: { subject: true, exam: true },
    });

    if (marks.length === 0) {
      throw new AppError('No marks found for this student', 404);
    }

    let totalObtained = 0;
    let totalMax = 0;
    let failedSubjects = [];

    for (const mark of marks) {
      totalObtained += parseFloat(mark.marksObtained || 0);
      totalMax += mark.maxMarks;

      if (parseFloat(mark.marksObtained || 0) < mark.subject.passMarks) {
        failedSubjects.push(mark.subject.name);
      }
    }

    const percentage = totalMax > 0 ? (totalObtained / totalMax * 100).toFixed(2) : 0;
    const overallGrade = this.calculateGrade(totalObtained, totalMax);

    const rank = await this.calculateRank(studentId, examId, totalObtained);

    const totalStudents = await prisma.mark.groupBy({
      by: ['studentId'],
      where: { examId },
      _count: true,
    });

    return {
      studentId,
      examId,
      marks,
      totalObtained,
      totalMax,
      percentage,
      overallGrade,
      rank,
      totalStudents: totalStudents.length,
      failedSubjects,
      result: failedSubjects.length > 0 ? 'FAIL' : 'PASS',
    };
  }

  async generateMeritList(examId, classId, schoolId) {
    const students = await prisma.student.findMany({
      where: { classId, schoolId, status: 'ACTIVE' },
      include: { profile: true, section: true },
    });

    const results = [];

    for (const student of students) {
      try {
        const result = await this.getStudentResult(student.id, examId);
        results.push({
          student: {
            id: student.id,
            studentId: student.studentId,
            name: `${student.profile.firstName} ${student.profile.lastName}`,
            rollNumber: student.rollNumber,
            section: student.section.name,
          },
          ...result,
        });
      } catch (e) {
        continue;
      }
    }

    results.sort((a, b) => {
      if (a.result === 'PASS' && b.result === 'FAIL') return -1;
      if (a.result === 'FAIL' && b.result === 'PASS') return 1;
      return parseFloat(b.percentage) - parseFloat(a.percentage);
    });

    results.forEach((r, index) => {
      r.rank = index + 1;
    });

    return results;
  }

  async getFailedStudentList(examId, classId, schoolId) {
    const meritList = await this.generateMeritList(examId, classId, schoolId);
    return meritList.filter(r => r.result === 'FAIL');
  }

  async publishResults(examId, schoolId) {
    await prisma.exam.update({
      where: { id: examId, schoolId },
      data: { resultsPublished: true },
    });

    return { message: 'Results published successfully' };
  }

  calculateGrade(marksObtained, maxMarks) {
    const percentage = (marksObtained / maxMarks) * 100;

    if (percentage >= 91) return 'A1';
    if (percentage >= 81) return 'A2';
    if (percentage >= 71) return 'B1';
    if (percentage >= 61) return 'B2';
    if (percentage >= 51) return 'C1';
    if (percentage >= 41) return 'C2';
    if (percentage >= 33) return 'D';
    return 'E';
  }

  async calculateRank(studentId, examId, totalMarks) {
    const allMarks = await prisma.mark.groupBy({
      by: ['studentId'],
      where: { examId },
      _sum: { marksObtained: true },
    });

    allMarks.sort((a, b) => (b._sum.marksObtained || 0) - (a._sum.marksObtained || 0));

    const rank = allMarks.findIndex(m => m.studentId === studentId) + 1;
    return rank || null;
  }
}

module.exports = new ExamService();
