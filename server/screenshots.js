const puppeteer = require('puppeteer-core');

(async () => {
  let browser;
  try {
    console.log('Launching Chrome for screenshots...\n');
    browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      defaultViewport: { width: 1280, height: 800 },
    });

    const page = await browser.newPage();

    // Helper function
    async function screenshotPage(url, name, waitTime = 3000) {
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
        await new Promise(r => setTimeout(r, waitTime));
        const path = `C:\\Users\\Administrator\\Desktop\\Smarterp\\screenshots\\${name}.png`;
        await page.screenshot({ path, fullPage: true });
        console.log(`  [OK] ${name}`);
        return true;
      } catch (e) {
        console.log(`  [FAIL] ${name}: ${e.message.substring(0, 80)}`);
        return false;
      }
    }

    // Create screenshots directory
    const fs = require('fs');
    const dir = 'C:\\Users\\Administrator\\Desktop\\Smarterp\\screenshots';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    console.log('=== CAPTURING SCREENSHOTS ===\n');

    // 1. Login Page
    console.log('1. Login Page');
    await screenshotPage('http://localhost:8000/login', '01-login', 2000);

    // 2. Login with credentials
    console.log('2. Login Flow');
    await page.goto('http://localhost:8000/login', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
    const emailInput = await page.$('input[type="text"]');
    if (emailInput) {
      await emailInput.click({ clickCount: 3 });
      await emailInput.type('admin@smarterp.in');
    }
    const passInput = await page.$('input[type="password"]');
    if (passInput) {
      await passInput.click({ clickCount: 3 });
      await passInput.type('admin123');
    }
    const signInBtn = await page.$('button[type="submit"]');
    if (signInBtn) await signInBtn.click();
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: `${dir}\\02-dashboard.png`, fullPage: true });
    console.log('  [OK] Dashboard (after login)');

    // 3. Students Page
    console.log('3. Students Page');
    await screenshotPage('http://localhost:8000/students', '03-students', 3000);

    // 4. Fee Management
    console.log('4. Fee Management');
    await screenshotPage('http://localhost:8000/fees', '04-fees', 3000);

    // 5. Attendance Page
    console.log('5. Attendance Page');
    await screenshotPage('http://localhost:8000/attendance', '05-attendance', 3000);

    // 6. Examinations Page
    console.log('6. Examinations Page');
    await screenshotPage('http://localhost:8000/exams', '06-exams', 3000);

    // 7. Exam Enhanced Page
    console.log('7. Exam Enhanced Page');
    await screenshotPage('http://localhost:8000/exams-enhanced', '07-exam-enhanced', 3000);

    // 8. Admissions Page
    console.log('8. Admissions Page');
    await screenshotPage('http://localhost:8000/admissions', '08-admissions', 3000);

    // 9. Staff Page
    console.log('9. Staff Page');
    await screenshotPage('http://localhost:8000/staff', '09-staff', 3000);

    // 10. Timetable Page
    console.log('10. Timetable Page');
    await screenshotPage('http://localhost:8000/timetable', '10-timetable', 3000);

    // 11. Library Page
    console.log('11. Library Page');
    await screenshotPage('http://localhost:8000/library', '11-library', 3000);

    // 12. Notices Page
    console.log('12. Notices Page');
    await screenshotPage('http://localhost:8000/notices', '12-notices', 3000);

    // 13. Transport Page
    console.log('13. Transport Page');
    await screenshotPage('http://localhost:8000/transport', '13-transport', 3000);

    // 14. Hostel Page
    console.log('14. Hostel Page');
    await screenshotPage('http://localhost:8000/hostel', '14-hostel', 3000);

    // 15. Reports Page
    console.log('15. Reports Page');
    await screenshotPage('http://localhost:8000/reports', '15-reports', 3000);

    // 16. Academic Page
    console.log('16. Academic Page');
    await screenshotPage('http://localhost:8000/academic', '16-academic', 3000);

    // 17. Settings Page
    console.log('17. Settings Page');
    await screenshotPage('http://localhost:8000/settings', '17-settings', 3000);

    console.log('\n================================================');
    console.log('  ALL SCREENSHOTS CAPTURED');
    console.log(`  Location: ${dir}`);
    console.log('================================================');

  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    if (browser) await browser.close();
  }
})();
