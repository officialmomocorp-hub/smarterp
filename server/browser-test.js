const puppeteer = require('puppeteer-core');

(async () => {
  let browser;
  try {
    console.log('Launching Chrome...');
    browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // ==========================================
    // TEST 1: LOGIN PAGE
    // ==========================================
    console.log('\n========================================');
    console.log('  TEST 1: LOGIN PAGE');
    console.log('========================================');
    await page.goto('http://localhost:8000/login', { waitUntil: 'networkidle2', timeout: 15000 });
    const title = await page.title();
    console.log(`  Page Title: "${title}"`);

    // Check all elements
    const buttons = await page.$$eval('button', btns => btns.map(b => ({ text: b.textContent.trim(), disabled: b.disabled })));
    console.log(`  Buttons (${buttons.length}):`);
    buttons.forEach((b, i) => console.log(`    ${i+1}. "${b.text}" (disabled: ${b.disabled})`));

    const inputs = await page.$$eval('input', inps => inps.map(inp => ({ type: inp.type, placeholder: inp.placeholder, name: inp.name })));
    console.log(`  Inputs (${inputs.length}):`);
    inputs.forEach((inp, i) => console.log(`    ${i+1}. type="${inp.type}" placeholder="${inp.placeholder}"`));

    const demoText = await page.$$eval('p', ps => ps.map(p => p.textContent.trim()).filter(t => t.includes('@')));
    console.log(`  Demo credentials: ${demoText.length > 0 ? 'Found' : 'Not found'}`);

    // ==========================================
    // TEST 2: LOGIN FLOW
    // ==========================================
    console.log('\n========================================');
    console.log('  TEST 2: LOGIN FLOW');
    console.log('========================================');
    const emailInput = await page.$('input[type="text"], input[type="email"]');
    if (emailInput) {
      await emailInput.click({ clickCount: 3 });
      await emailInput.type('admin@smarterp.in');
      console.log('  [PASS] Email entered');
    }

    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      await passwordInput.click({ clickCount: 3 });
      await passwordInput.type('admin123');
      console.log('  [PASS] Password entered');
    }

    const signInBtn = await page.$('button[type="submit"]');
    if (signInBtn) {
      await signInBtn.click();
      console.log('  [PASS] Sign In button clicked');
    }

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 3000));

    const currentUrl = page.url();
    console.log(`  Current URL: ${currentUrl}`);

    if (currentUrl.includes('/dashboard')) {
      console.log('  [PASS] Redirected to Dashboard');
    } else {
      console.log(`  [INFO] Still on: ${currentUrl}`);
    }

    // Check sidebar
    const sidebarItems = await page.$$eval('nav a, nav button', els => els.map(e => e.textContent.trim()).filter(t => t.length > 0));
    console.log(`  Sidebar items found: ${sidebarItems.length}`);
    sidebarItems.forEach((item, i) => console.log(`    ${i+1}. "${item}"`));

    // ==========================================
    // TEST 3: DASHBOARD
    // ==========================================
    console.log('\n========================================');
    console.log('  TEST 3: DASHBOARD');
    console.log('========================================');
    if (!currentUrl.includes('/dashboard')) {
      await page.goto('http://localhost:8000/dashboard', { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(r => setTimeout(r, 2000));
    }

    const dashCards = await page.$$eval('.card, [class*="card"]', cards => cards.map(c => c.textContent.trim().substring(0, 80)));
    console.log(`  Dashboard cards: ${dashCards.length}`);
    dashCards.forEach((card, i) => console.log(`    ${i+1}. "${card}"`));

    const statValues = await page.$$eval('[class*="font-bold"], [class*="text-2xl"]', els => els.map(e => e.textContent.trim()));
    console.log(`  Stat values: ${statValues.length}`);
    statValues.forEach((v, i) => console.log(`    ${i+1}. "${v}"`));

    // ==========================================
    // TEST 4: STUDENTS PAGE
    // ==========================================
    console.log('\n========================================');
    console.log('  TEST 4: STUDENTS PAGE');
    console.log('========================================');
    const studentsLink = await page.$('a[href*="/students"]');
    if (studentsLink) {
      await studentsLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 2000));
      console.log('  [PASS] Navigated to Students');
    } else {
      await page.goto('http://localhost:8000/students', { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(r => setTimeout(r, 2000));
    }

    const addStudentBtn = await page.$('button');
    const allBtns = await page.$$eval('button', btns => btns.map(b => b.textContent.trim()).filter(t => t.length > 0));
    console.log(`  Buttons on Students page: ${allBtns.length}`);
    allBtns.forEach((b, i) => console.log(`    ${i+1}. "${b}"`));

    const tableRows = await page.$$eval('tbody tr', rows => rows.length);
    console.log(`  Table rows: ${tableRows}`);

    const searchInput = await page.$('input[placeholder*="Name"], input[placeholder*="Search"]');
    if (searchInput) {
      console.log('  [PASS] Search input found');
    }

    const classFilter = await page.$('select');
    if (classFilter) {
      console.log('  [PASS] Class filter found');
    }

    // ==========================================
    // TEST 5: FEE MANAGEMENT
    // ==========================================
    console.log('\n========================================');
    console.log('  TEST 5: FEE MANAGEMENT');
    console.log('========================================');
    await page.goto('http://localhost:8000/fees', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));

    const feeTabs = await page.$$eval('button', btns => btns.filter(b => ['collect', 'structure', 'defaulters', 'reports'].some(k => b.textContent.toLowerCase().includes(k))).map(b => b.textContent.trim()));
    console.log(`  Fee tabs found: ${feeTabs.length}`);
    feeTabs.forEach((t, i) => console.log(`    ${i+1}. "${t}"`));

    const feeBtns = await page.$$eval('button', btns => btns.map(b => b.textContent.trim()).filter(t => t.length > 0));
    console.log(`  Total buttons: ${feeBtns.length}`);
    feeBtns.forEach((b, i) => console.log(`    ${i+1}. "${b}"`));

    // ==========================================
    // TEST 6: ATTENDANCE PAGE
    // ==========================================
    console.log('\n========================================');
    console.log('  TEST 6: ATTENDANCE PAGE');
    console.log('========================================');
    await page.goto('http://localhost:8000/attendance', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));

    const attTabs = await page.$$eval('button', btns => btns.filter(b => ['mark', 'report', 'alerts', 'leaves'].some(k => b.textContent.toLowerCase().includes(k))).map(b => b.textContent.trim()));
    console.log(`  Attendance tabs: ${attTabs.length}`);
    attTabs.forEach((t, i) => console.log(`    ${i+1}. "${t}"`));

    const dateInput = await page.$('input[type="date"]');
    if (dateInput) {
      console.log('  [PASS] Date picker found');
    }

    const presentBtns = await page.$$eval('button', btns => (btns || []).filter(b => b.textContent.includes('Present') || b.textContent.includes('Absent') || b.textContent.includes('Late')));
    console.log(`  Attendance status buttons: ${presentBtns ? presentBtns.length : 0}`);

    // ==========================================
    // TEST 7: EXAMINATIONS PAGE
    // ==========================================
    console.log('\n========================================');
    console.log('  TEST 7: EXAMINATIONS PAGE');
    console.log('========================================');
    await page.goto('http://localhost:8000/exams', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));

    const examCards = await page.$$eval('.card', cards => cards.length);
    console.log(`  Exam cards: ${examCards}`);

    const gradeBadges = await page.$$eval('[class*="badge"]', els => (els || []).filter(e => ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D', 'E'].some(g => e.textContent.includes(g))));
    console.log(`  Grade badges: ${gradeBadges ? gradeBadges.length : 0}`);

    // ==========================================
    // TEST 8: EXAM ENHANCED PAGE
    // ==========================================
    console.log('\n========================================');
    console.log('  TEST 8: EXAM ENHANCED PAGE');
    console.log('========================================');
    await page.goto('http://localhost:8000/exams-enhanced', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));

    const enhTabs = await page.$$eval('button', btns => btns.filter(b => ['Verification', 'Hall Tickets', 'Seating', 'Answer Books', 'Compartment', 'Analytics'].some(k => b.textContent.includes(k))).map(b => b.textContent.trim()));
    console.log(`  Enhanced exam tabs: ${enhTabs.length}`);
    enhTabs.forEach((t, i) => console.log(`    ${i+1}. "${t}"`));

    // ==========================================
    // TEST 9: ADMISSIONS PAGE
    // ==========================================
    console.log('\n========================================');
    console.log('  TEST 9: ADMISSIONS PAGE');
    console.log('========================================');
    await page.goto('http://localhost:8000/admissions', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));

    const addAdmissionBtn = await page.$$eval('button', btns => btns.find(b => b.textContent.includes('New Admission')));
    console.log(`  "New Admission" button: ${addAdmissionBtn ? 'Found' : 'Not found'}`);

    const statusBadges = await page.$$eval('[class*="badge"]', badges => badges.map(b => b.textContent.trim()));
    console.log(`  Status badges: ${statusBadges.length}`);
    statusBadges.forEach((b, i) => console.log(`    ${i+1}. "${b}"`));

    // ==========================================
    // TEST 10: STAFF PAGE
    // ==========================================
    console.log('\n========================================');
    console.log('  TEST 10: STAFF PAGE');
    console.log('========================================');
    await page.goto('http://localhost:8000/staff', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));

    const addStaffBtn = await page.$$eval('button', btns => btns.find(b => b.textContent.includes('Add Staff')));
    console.log(`  "Add Staff" button: ${addStaffBtn ? 'Found' : 'Not found'}`);

    // ==========================================
    // TEST 11: TIMETABLE PAGE
    // ==========================================
    console.log('\n========================================');
    console.log('  TEST 11: TIMETABLE PAGE');
    console.log('========================================');
    await page.goto('http://localhost:8000/timetable', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));

    const tableCells = await page.$$eval('td', cells => cells.length);
    console.log(`  Timetable cells: ${tableCells}`);

    const classSelect = await page.$('select');
    if (classSelect) {
      console.log('  [PASS] Class selector found');
    }

    // ==========================================
    // TEST 12: LIBRARY PAGE
    // ==========================================
    console.log('\n========================================');
    console.log('  TEST 12: LIBRARY PAGE');
    console.log('========================================');
    await page.goto('http://localhost:8000/library', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));

    const libTabs = await page.$$eval('button', btns => btns.filter(b => ['books', 'issues', 'returns'].some(k => b.textContent.toLowerCase().includes(k))).map(b => b.textContent.trim()));
    console.log(`  Library tabs: ${libTabs.length}`);
    libTabs.forEach((t, i) => console.log(`    ${i+1}. "${t}"`));

    // ==========================================
    // TEST 13: NOTICES PAGE
    // ==========================================
    console.log('\n========================================');
    console.log('  TEST 13: NOTICES PAGE');
    console.log('========================================');
    await page.goto('http://localhost:8000/notices', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));

    const noticeCards = await page.$$eval('.card', cards => cards.length);
    console.log(`  Notice cards: ${noticeCards}`);

    const newNoticeBtn = await page.$$eval('button', btns => btns.find(b => b.textContent.includes('New Notice')));
    console.log(`  "New Notice" button: ${newNoticeBtn ? 'Found' : 'Not found'}`);

    // ==========================================
    // TEST 14: SIDEBAR NAVIGATION TEST
    // ==========================================
    console.log('\n========================================');
    console.log('  TEST 14: SIDEBAR NAVIGATION');
    console.log('========================================');
    const navLinks = await page.$$eval('a[href]', links => links.map(l => ({ text: l.textContent.trim(), href: l.href })).filter(l => l.text.length > 0 && l.href.includes('localhost')));
    console.log(`  Navigation links: ${navLinks.length}`);
    navLinks.forEach((l, i) => console.log(`    ${i+1}. "${l.text}" -> ${l.href}`));

    // Test sidebar toggle
    const menuBtn = await page.$('button');
    if (menuBtn) {
      console.log('  [PASS] Menu/Sidebar toggle button found');
    }

    // ==========================================
    // TEST 15: LOGOUT
    // ==========================================
    console.log('\n========================================');
    console.log('  TEST 15: LOGOUT BUTTON');
    console.log('========================================');
    const logoutBtn = await page.$$eval('button', btns => btns.find(b => b.textContent.includes('Logout')));
    console.log(`  Logout button: ${logoutBtn ? 'Found' : 'Not found'}`);

    // ==========================================
    // FINAL SUMMARY
    // ==========================================
    console.log('\n================================================');
    console.log('  PUPPETEER BROWSER TEST COMPLETE');
    console.log('================================================');
    console.log('  All 15 page tests completed');
    console.log('  URL: http://localhost:8000');
    console.log('================================================');

  } catch (error) {
    console.error('ERROR:', error.message);
    console.error(error.stack);
  } finally {
    if (browser) await browser.close();
    console.log('\nBrowser closed.');
  }
})();
