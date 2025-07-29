const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true
  });
  
  const page = await browser.newPage();
  
  const logs = [];
  
  // Capture console logs
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[HOOK-') || text.includes('[VERIFY]') || text.includes('[PROXY]') || text.includes('===')) {
      logs.push({
        type: msg.type(),
        text: text,
        args: msg.args().map(arg => arg.toString())
      });
      console.log(text);
    }
  });
  
  // Navigate to the app
  await page.goto('http://127.0.0.1:3005', { waitUntil: 'networkidle0' });
  
  // Wait for hooks to execute
  await page.waitForTimeout(5000);
  
  // Run analysis
  const analysis = await page.evaluate(() => {
    if (window.generateHookAnalysisReport) {
      return window.generateHookAnalysisReport();
    }
    return {
      executionLog: window.__HOOK_EXECUTION_LOG || [],
      allHookCalls: window.__ALL_HOOK_CALLS || []
    };
  });
  
  // Save results
  fs.writeFileSync('hook-analysis-results.json', JSON.stringify({
    logs,
    analysis
  }, null, 2));
  
  console.log('\nAnalysis saved to hook-analysis-results.json');
  
  // Keep browser open for manual inspection
  // await browser.close();
})();