const express = require('express');
const puppeteer = require('puppeteer-core');

const app = express();
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'html-to-image' });
});

// Main conversion endpoint
app.post('/convert', async (req, res) => {
  const { html, width = 1080, height = 1920 } = req.body;
  
  if (!html) {
    return res.status(400).json({ error: 'HTML content is required' });
  }

  let browser = null;
  
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, 
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({
      width: parseInt(width),
      height: parseInt(height),
      deviceScaleFactor: 1
    });

    // Load HTML
    await page.setContent(html, {
      waitUntil: ['load', 'networkidle0'],
      timeout: 30000
    });

    // Wait for fonts
    await page.evaluate(() => document.fonts.ready);
    
    // Screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
      encoding: 'base64'
    });

    await browser.close();

    res.json({
      success: true,
      image: screenshot,
      mimeType: 'image/png'
    });

  } catch (error) {
    if (browser) await browser.close();
    console.error('Conversion error:', error);
    res.status(500).json({
      error: 'Failed to convert HTML to image',
      details: error.stack || error.message
    });
  }

}); // <-- THESE were missing

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`HTML-to-Image service running on port ${PORT}`);
});
