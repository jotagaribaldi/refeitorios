const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  page.on('console', msg => {
    console.log('CONSOLE:', msg.text());
  });

  await page.goto('http://localhost:5174/refeitorios/');
  
  await page.evaluate(() => {
    localStorage.setItem('mtoken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMWM2NzU4NS0wMWNkLTQ1ZGMtODY0ZS1mMWEyYTlhMmUxMjEiLCJlbWFpbCI6Im1hcml6YUBzdXByZW1hLmV0aS5iciIsInJvbGUiOiJGSVNDQUwiLCJ0ZW5hbnRJZCI6ImYzZWY4MGI1LTk3NTUtNDU0Zi1iOGFjLWEzNGU4NzQ1ZTZjMiIsImlhdCI6MTc3ODE4MTg5OSwiZXhwIjoxNzc4Nzg2Njk5fQ.abb0Q35l_GcWShi5AchPsF9VSsNzmBIzdwJOdz66peg');
    localStorage.setItem('muser', JSON.stringify({id: '01c67585-01cd-45dc-864e-f1a2a9a2e121', email: 'mariza@suprema.eti.br', role: 'FISCAL'}));
  });

  await page.reload();
  await page.waitForTimeout(3000);
  
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  console.log('BODY HTML LENGTH:', bodyHTML.length);
  console.log('BODY HTML:', bodyHTML.substring(0, 1000));
  
  await page.screenshot({ path: 'test_dark.png' });
  await browser.close();
})();
