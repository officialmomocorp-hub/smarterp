const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

async function run() {
  const schoolId = '857c4583-a4d5-4cef-9136-7c2cdc7f5975';
  const email = 'info@dpsdemo.edu.in';
  const password = await bcrypt.hash('password123', 10);

  console.log('--- MASTER SEED START ---');

  // 1. Create User
  try {
    const existing = await prisma.user.findFirst({ where: { email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          id: uuidv4(),
          email,
          password,
          role: 'ADMIN',
          schoolId,
          phone: '9876543210',
          updatedAt: new Date(),
          profile: {
            create: {
              id: uuidv4(),
              firstName: 'DPS',
              lastName: 'Admin',
              dateOfBirth: new Date('1990-01-01'),
              gender: 'MALE',
              updatedAt: new Date()
            }
          }
        }
      });
      console.log('User created:', email);
    } else {
      console.log('User already exists');
    }
  } catch (e) {
    console.error('User seed failed:', e.message);
  }

  // 2. Clear and Seed Library
  try {
    await prisma.bookIssue.deleteMany({ where: { schoolId } });
    await prisma.libraryBook.deleteMany({ where: { schoolId } });
    
    const books = [
      { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', category: 'Classic Literature', publisher: 'Scribner', copies: 5 },
      { title: 'Advanced Calculus', author: 'G.B. Thomas', isbn: '978-0201162905', category: 'Mathematics', publisher: 'Addison-Wesley', copies: 10 },
      { title: 'Physics for Scientists', author: 'Halliday', isbn: '978-1118230725', category: 'Science', publisher: 'Wiley', copies: 8 },
      { title: 'Atomic Habits', author: 'James Clear', isbn: '978-0735211292', category: 'Self-Help', publisher: 'Avery', copies: 12 },
    ];

    for (const b of books) {
      await prisma.libraryBook.create({
        data: {
          id: uuidv4(),
          schoolId,
          title: b.title,
          author: b.author,
          isbn: b.isbn,
          category: b.category,
          publisher: b.publisher,
          totalCopies: b.copies,
          availableCopies: b.copies,
          status: 'AVAILABLE',
          updatedAt: new Date()
        }
      });
    }
    console.log('Library seeded with 4 books');
  } catch (e) {
    console.error('Library seed failed:', e.message);
  }

  process.exit(0);
}

run();
