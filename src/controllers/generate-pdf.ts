


// export const generatePDF = async (body: any, callback: any): Promise<any> => {
//     let browser = null;
//     let pdf = null;

//     /* eslint-disable @typescript-eslint/no-var-requires */
//     const chromium = require('@sparticuz/chromium');
//     const puppeteer = require('puppeteer-core');

//     try {
//         const executablePath = await chromium.executablePath;
//         console.log('executablePath', executablePath)

//         browser = await puppeteer.launch({
//             args: chromium.args,
//             executablePath,
//             headless: true,
//             ignoreHTTPSErrors: true,
//         });

//         const page = await browser.newPage();

//         await page.setContent("<html><body><p>Test</p></body></html>", {
//             waitUntil: "load",
//         });

//         pdf = await page.pdf({
//             format: "A4",
//             printBackground: true,
//             displayHeaderFooter: true,
//             margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" }
//         });
//     } finally {
//         if (browser !== null) {
//             await browser.close();
//         }
//     }

//     const response = {
//         headers: {
//             'Content-type': 'application/pdf',
//             'content-disposition': 'attachment; filename=test.pdf'
//         },
//         statusCode: 200,
//         body: pdf.toString('base64'),
//         isBase64Encoded: true
//     }

//     callback(response)
// }