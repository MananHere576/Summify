const Tesseract = require("tesseract.js");
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

async function extractTextFromImage(imagePath) {
  try {
    const { data: { text } } = await Tesseract.recognize(imagePath, "eng");
    return (text || "").trim();
  } catch (err) {
    console.error("OCR failed for image:", err.message);
    return "";
  }
}

/**
 * Try to OCR a PDF by converting pages to PNG using `pdftoppm` (Poppler).
 * If `pdftoppm` is not available, returns "" gracefully.
 */
async function extractTextFromPdfWithOcr(pdfPath, pageLimit = 3) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "docsum_pdfocr_"));
  const pngPrefix = path.join(tmpDir, "page");
  try {
    // Convert first N pages to PNGs: outputs page-1.png, page-2.png, ...
    await new Promise((resolve, reject) => {
      const args = ["-png", "-f", "1", "-l", String(pageLimit), pdfPath, path.join(tmpDir, "page")];
      const proc = spawn("pdftoppm", args);
      let stderr = "";
      proc.stderr.on("data", d => stderr += d.toString());
      proc.on("error", reject);
      proc.on("close", code => code === 0 ? resolve() : reject(new Error(stderr || ("pdftoppm exited " + code))));
    });

    // OCR each generated image
    const files = fs.readdirSync(tmpDir).filter(f => f.startsWith("page-") && f.endsWith(".png"));
    files.sort((a, b) => {
      const na = parseInt(a.split("-")[1]);
      const nb = parseInt(b.split("-")[1]);
      return na - nb;
    });
    let combined = "";
    for (const f of files) {
      const text = await extractTextFromImage(path.join(tmpDir, f));
      combined += (text + "\n");
    }
    return combined.trim();
  } catch (err) {
    console.warn("PDF OCR skipped (pdftoppm unavailable?):", err.message);
    return "";
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { }
  }
}

module.exports = { extractTextFromImage, extractTextFromPdfWithOcr };
