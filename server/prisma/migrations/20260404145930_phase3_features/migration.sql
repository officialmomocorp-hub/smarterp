-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT,
    "reference" TEXT,
    "paymentMode" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RTEQuota" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "totalSeats" INTEGER NOT NULL,
    "rteSeats" INTEGER NOT NULL,
    "filledSeats" INTEGER NOT NULL DEFAULT 0,
    "reimbursementAmount" REAL,
    "reimbursementStatus" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Syllabus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "chapterName" TEXT NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "description" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LessonPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "period" INTEGER NOT NULL,
    "objectives" TEXT,
    "methodology" TEXT,
    "resources" TEXT,
    "assessment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "WhatsAppMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "recipientIds" TEXT NOT NULL,
    "messageType" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "variables" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "sentAt" DATETIME,
    "messageId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MeritList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "percentage" REAL NOT NULL,
    "totalMarks" REAL NOT NULL,
    "maxMarks" REAL NOT NULL,
    "certificateGenerated" BOOLEAN NOT NULL DEFAULT false,
    "certificateUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CharacterCertificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "fromYear" TEXT NOT NULL,
    "toYear" TEXT NOT NULL,
    "classStudied" TEXT NOT NULL,
    "character" TEXT NOT NULL,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdfUrl" TEXT
);

-- CreateTable
CREATE TABLE "SiblingLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "primaryStudentId" TEXT NOT NULL,
    "siblingStudentId" TEXT NOT NULL,
    "discountPercentage" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "LedgerEntry_schoolId_type_date_idx" ON "LedgerEntry"("schoolId", "type", "date");

-- CreateIndex
CREATE INDEX "LedgerEntry_schoolId_category_idx" ON "LedgerEntry"("schoolId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "RTEQuota_schoolId_academicYearId_classId_key" ON "RTEQuota"("schoolId", "academicYearId", "classId");

-- CreateIndex
CREATE INDEX "Syllabus_schoolId_classId_subjectId_idx" ON "Syllabus"("schoolId", "classId", "subjectId");

-- CreateIndex
CREATE INDEX "LessonPlan_teacherId_date_idx" ON "LessonPlan"("teacherId", "date");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_schoolId_status_idx" ON "WhatsAppMessage"("schoolId", "status");

-- CreateIndex
CREATE INDEX "WhatsAppMessage_messageType_idx" ON "WhatsAppMessage"("messageType");

-- CreateIndex
CREATE INDEX "MeritList_schoolId_examId_classId_idx" ON "MeritList"("schoolId", "examId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "MeritList_examId_studentId_key" ON "MeritList"("examId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterCertificate_certificateNumber_key" ON "CharacterCertificate"("certificateNumber");

-- CreateIndex
CREATE INDEX "CharacterCertificate_schoolId_studentId_idx" ON "CharacterCertificate"("schoolId", "studentId");

-- CreateIndex
CREATE INDEX "SiblingLink_schoolId_idx" ON "SiblingLink"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "SiblingLink_primaryStudentId_siblingStudentId_key" ON "SiblingLink"("primaryStudentId", "siblingStudentId");
