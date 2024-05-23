import chrome from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

export default async function generatePdf(req, res) {
  try {
    const options = process.env.AWS_REGION
    ? {
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless
      }
    : {
        args: [],
        executablePath:
          process.platform === 'win32'
            ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
            : process.platform === 'linux'
            ? '/usr/bin/google-chrome'
            : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      };
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    // This is the path of the url which shall be converted to a pdf file
    const pdfUrl = req.query.url || "https://aorborc.com";
    //timeout is set to 30 seconds, change to 0 to disable timeout
    console.log(pdfUrl);
   console.log(req.query.landscape);
    await page.goto(pdfUrl, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });
    const path = `/tmp/${Date.now()}.pdf`;
    const pdf = await page.pdf({
      landscape: req.query.landscape?true:false,
      path,
      printBackground: true,
      format: "a4",
    });
    await browser.close();
    res.setHeader("Content-Type", "application/pdf");
    const fs = require("fs");
    fs.unlink(path, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    return res.status(200).send(pdf);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
}
