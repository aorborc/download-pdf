import chromium from "chrome-aws-lambda";
import playwright from "playwright-core";

export default async function generatePdf(req, res) {
  try {
    const browser = await playwright.chromium.launch({
      args: [...chromium.args, "--font-render-hinting=none"], // This way fix rendering issues with specific fonts
      executablePath:
        process.env.NODE_ENV === "production"
          ? await chromium.executablePath
          : "/opt/homebrew/bin/chromium",
      headless:
        process.env.NODE_ENV === "production" ? chromium.headless : true,
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    // This is the path of the url which shall be converted to a pdf file
    const pdfUrl = req.query.url || "https://aorborc.com";
    //timeout is set to 30 seconds, change to 0 to disable timeout
    await page.goto(pdfUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    const path = `${Date.now()}.pdf`;
    const pdf = await page.pdf({
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
