
const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp');



async function extractTextFromImage(fileBuffer) {
  try {
    
    const resizedBuffer = await sharp(fileBuffer)
      .resize({ width: 1200 }) 
      .toBuffer();

    const form = new FormData();
    form.append('apikey', process.env.OCR_SPACE_API_KEY);
    form.append('file', resizedBuffer, 'image.png'); 

    const response = await axios.post('https://api.ocr.space/parse/image', form, {
      headers: form.getHeaders()
    });

    console.log("OCR.Space raw response:", response.data);

    if (
      response.data &&
      response.data.ParsedResults &&
      response.data.ParsedResults[0]
    ) {
      return response.data.ParsedResults[0].ParsedText || '';
    }

    console.warn("OCR.Space returned no text");
    return '';
  } catch (err) {
    console.error("OCR.Space failed:", err.message);
    return '';
  }
}


async function extractTextFromPdfWithOcr(pdfBuffer) {

  return '';
}

module.exports = { extractTextFromImage, extractTextFromPdfWithOcr };
