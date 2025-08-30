require('dotenv').config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const os = require("os");
const path = require("path");
const pdfParse = require("pdf-parse");


const { extractTextFromImage, extractTextFromPdfWithOcr } = require("./utils/ocr");
const { summarizeText, extractKeyPoints, aiSummarize } = require("./utils/summarizer");

const app = express();
const upload = multer({ dest: path.join(os.tmpdir(), "docsum_uploads") });


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

function allowedFile(filename) {
  return /\.(pdf|png|jpg|jpeg|tif|tiff)$/i.test(filename);
}


app.post("/api/summarize", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const length = (req.body.length || "medium").toLowerCase();
    const mode = (req.body.modelType || "ai").toLowerCase();

    console.log("Mode selected:", mode);

    if (!file) return res.status(400).json({ error: "No file uploaded." });
    if (!allowedFile(file.originalname)) return res.status(415).json({ error: "Unsupported file type." });

    let text = "";
    let numPages = 0;


    if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
      const buf = fs.readFileSync(file.path);
      const data = await pdfParse(buf);
      text = (data.text || "").trim();
      numPages = data.numpages || 0;

      if (!text) {
        console.log("⚠️ No embedded text in PDF. Skipping OCR for serverless.");
        text = await extractTextFromPdfWithOcr(buf);
      }
    } else {
      const fileBuffer = fs.readFileSync(file.path);
      text = await extractTextFromImage(fileBuffer);
    }

    fs.unlink(file.path, () => {}); 

    if (!text) return res.status(400).json({ error: "Could not extract text from file." });

    
    let summaryResponse;

    if (mode === "ai") {
      const fullTextSummary = await aiSummarize(text, length);
      console.log("AI raw summary:", fullTextSummary);

      let summaryParagraph = "Could not generate a summary.";
      let highlightsList = "No key highlights generated.";

      const summaryMatch = fullTextSummary.match(/Summary Paragraph:\s*([\s\S]*?)Key Highlights:/i);
      const highlightsMatch = fullTextSummary.match(/Key Highlights:\s*([\s\S]*)/i);

      if (summaryMatch) summaryParagraph = summaryMatch[1].trim();
      if (highlightsMatch) highlightsList = highlightsMatch[1].trim();

      summaryResponse = {
        filename: file.originalname,
        pages: numPages,
        summaryParagraph: `Summary Paragraph:\n${summaryParagraph}`,
        highlightsList: `Key Highlights:\n${highlightsList}`,
        modelType: "ai",
        length
      };
    } else if (mode === "traditional") {
      const summary = summarizeText(text, length);
      const keyPoints = extractKeyPoints(summary);

      summaryResponse = {
        filename: file.originalname,
        pages: numPages,
        summaryParagraph: `Summary Paragraph:\n${summary}`,
        highlightsList: `Key Highlights:\n- ${keyPoints.join('\n- ')}`,
        modelType: "traditional",
        length
      };
    } else {
      return res.status(400).json({ error: "Invalid mode. Must be 'ai' or 'traditional'." });
    }

    return res.json(summaryResponse);

  } catch (err) {
    console.error("Route error:", err);
    return res.status(500).json({ error: "An internal server error occurred: " + err.message });
  }
});


app.use(express.static(path.join(__dirname, "../frontend")));

// --- Start server ---
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
