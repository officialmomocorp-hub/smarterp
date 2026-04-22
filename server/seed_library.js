const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');

async function seed() {
  const schoolId = '857c4583-a4d5-4cef-9136-7c2cdc7f5975';
  const books = [
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', category: 'Classic Literature', publisher: 'Scribner', copies: 5 },
    { title: 'Advanced Calculus', author: 'G.B. Thomas', isbn: '978-0201162905', category: 'Mathematics', publisher: 'Addison-Wesley', copies: 10 },
    { title: 'Principles of Physics', author: 'Halliday & Resnick', isbn: '978-1118230725', category: 'Science', publisher: 'Wiley', copies: 8 },
    { title: 'Brief History of Time', author: 'Stephen Hawking', isbn: '978-0553380163', category: 'Science', publisher: 'Bantam Books', copies: 4 },
    { title: 'Atomic Habits', author: 'James Clear', isbn: '978-0735211292', category: 'Self-Help', publisher: 'Avery', copies: 12 },
    { title: 'The India Story', author: 'Bimal Jalan', isbn: '978-9354890697', category: 'Non-Fiction', publisher: 'Rupa Publications', copies: 6 },
    { title: 'Harry Potter and the Sorcerers Stone', author: 'J.K. Rowling', isbn: '978-0590353427', category: 'Fiction', publisher: 'Scholastic', copies: 15 },
    { title: 'Python Crash Course', author: 'Eric Matthes', isbn: '978-1593279288', category: 'Computer Science', publisher: 'No Starch Press', copies: 7 }
  ];

  console.log('--- SEEDING LIBRARY DATA ---');

  for (const b of books) {
    const bookId = uuidv4();
    await prisma.libraryBook.create({
      data: {
        id: bookId,
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
    console.log(`Added: ${b.title}`);
  }

  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
