# Summify 📝

**Summify** is a modern Document Summary Analyzer that allows users to upload documents (PDF, images) and get **structured summaries**, including key highlights. It supports both AI-powered summarization (via Gemini API) and traditional algorithmic summarization. OCR (Optical Character Recognition) is integrated for extracting text from images or scanned PDFs.

---

## 🌟 Features

* Upload PDFs or image files (PNG, JPG, JPEG, TIFF)
* Automatic text extraction:

  * Embedded text from PDFs
  * OCR for images and scanned PDFs (via OCR.Space API)
* AI-powered summarization using **Google Gemini AI**
* Traditional summarization algorithm using **frequency-based sentence scoring**
* Structured output with:

  * Summary Paragraph
  * Key Highlights (bullet points)
* **UX Enhancements:**

  * Dark and Light mode toggle
  * Word count display
  * Copy and paste functionality
  * Speak (Text-to-Speech) button
  * Download summary as `.txt` file
* Responsive and clean frontend interface (React + Vite)
* Fully deployed on **Vercel** (frontend and backend)

---

## 🛠 Tech Stack

**Frontend:**

* React 18 (functional components + hooks)
* Vite (bundler & dev server)
* TailwindCSS / Vanilla CSS (for styling)
* Axios (API requests)

**Backend:**

* Node.js + Express.js (REST API)
* Multer (file uploads)
* CORS (cross-origin requests)
* PDF parsing: `pdf-parse`
* OCR: `ocr-space-api` via axios + FormData
* AI Summarization: `@google/generative-ai` (Gemini API)
* Environment variables: `dotenv`

**Utilities & Dev Tools:**

* fs, os, path (Node.js built-in modules)
* Vercel (for deployment)
* Git + GitHub (version control)

---

## ⚡ Installation & Setup

1. **Clone the repository**

```bash
git clone https://github.com/MananHere576/Summify.git
cd Summify
```

2. **Install backend dependencies**

```bash
cd backend
npm install
```

3. **Install frontend dependencies**

```bash
cd ../frontend
npm install
```

4. **Environment Variables (.env)**

Create a `.env` file in the `backend` folder with:

```env
PORT=8000
GEMINI_API_KEY=your_gemini_api_key_here
OCR_SPACE_API_KEY=your_ocr_space_api_key_here
```

* `PORT`: Backend server port
* `GEMINI_API_KEY`: Google Gemini AI API key for AI summarization.
* `OCR_SPACE_API_KEY`: Free OCR.Space API key for image/PDF text extraction.

Create a `.env` file in the `frontend` folder with:

```env
VITE_API_BASE_URL=http://localhost:8000 or your_api_key_here
```

* `VITE_API_BASE_URL`: Connects Backend to Frontend to receive responses, hosted on vercel also.
---

## 🗂 Project Structure

```
Summify/
├── backend/                     # Node.js backend
│   ├── utils/
│   │   ├── ocr.js               # OCR utilities (image & PDF)
│   │   └── summarizer.js        # AI & traditional summarization functions
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── server.js                # Express API server
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   └── favicon/logo.png
│   ├── package.json
│   └── index.html
├── .gitignore
└── README.md
```

---

## 🚀 API Endpoints

### **POST** `/api/summarize`

**Description:** Upload a PDF or image to get structured summary.

**Request:**

* Content-Type: `multipart/form-data`
* Fields:

  * `file`: Document (PDF or image)
  * `length`: `short | medium | long` (optional, default: medium)
  * `modelType`: `ai | traditional` (optional, default: ai)

**Response:**

```json
{
  "filename": "document.pdf",
  "pages": 5,
  "summaryParagraph": "Summary Paragraph:\nThis is the main summary...",
  "highlightsList": "Key Highlights:\n- Point 1\n- Point 2",
  "modelType": "ai",
  "length": "medium"
}
```

**Error Responses:**

* `400`: No file uploaded or invalid mode
* `415`: Unsupported file type
* `500`: Internal server error

---

## ⚙ Node Modules & Dependencies

```json
{
  "dependencies": {
    "@google/generative-ai": "^0.24.1",
    "axios": "^1.5.0",
    "cors": "^2.8.5",
    "dotenv": "^17.2.1",
    "express": "^4.21.2",
    "form-data": "^5.0.0",
    "multer": "^2.0.2",
    "pdf-parse": "^1.1.1"
  }
}
```

* `@google/generative-ai`: Gemini AI for summarization
* `axios` + `form-data`: For OCR.Space API requests
* `cors`, `express`, `multer`: Backend server & file uploads
* `pdf-parse`: Extract text from PDF

---

## 🌐 Deployment

**Backend:**

* Deployed on Vercel → [Backend URL](https://summify-gray.vercel.app/)

**Frontend:**

* Deployed on Vercel → [Frontend URL](https://summify-dsa.vercel.app/)

Vercel auto-deploys whenever you push to GitHub.

---

## 🎯 Future Improvements

* Support multi-page scanned PDFs via OCR.Space
* Advanced AI summarization with tone/style options
* User authentication and document history
* Better frontend UX with drag-and-drop uploads

---

**Made with ❤️ using Node.js, React, and Google Gemini AI**
