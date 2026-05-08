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
  
  // Fill login
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'pauloneto@tonolucro.com.br');
  await page.type('input[type="password"]', 'senha123');
  await page.click('button[type="submit"]');

  await page.waitForTimeout(3000);
  await browser.close();
})();
