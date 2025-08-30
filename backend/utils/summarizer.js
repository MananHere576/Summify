
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


async function aiSummarize(text, length = "medium") {
  try {
    
    const truncatedText = text.length > 15000 ? text.slice(0, 15000) : text;

  
    let paragraphInstruction = "a detailed summary of 4-5 sentences";
    let highlightsInstruction = "Provide 5-7 key highlights as bullet points.";

    switch (length) {
      case 'short':
        paragraphInstruction = "a concise summary of 2-3 sentences";
        highlightsInstruction = "Provide 2-3 key highlights as bullet points.";
        break;
      case 'long':
        paragraphInstruction = "a comprehensive summary of 6-8 sentences";
        highlightsInstruction = "Provide 8-10 key highlights as bullet points.";
        break;
     
    }

    const prompt = `
You are an expert in summarizing documents.
Provide a structured response in two parts:

Summary Paragraph:
[Insert ${paragraphInstruction} with **highlighted** keywords]

Key Highlights:
[${highlightsInstruction}]

Text to summarize:
---
${truncatedText}
---
    `;
  

    console.log("Sending prompt to Gemini (first 500 chars):", prompt.slice(0, 500));

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return summary || "⚠️ Gemini returned an empty response.";

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "⚠️ There was an issue connecting to the AI service.";
  }
}


function splitSentences(text) {
  return (text || "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function wordFrequency(text) {
  const stop = new Set((`
    a an the is are was were be been being of and or to in on for at by with from as
    that this these those it its into over under between above below you your our we
    they them he she his her theirs ours what which who whom whose not no yes do does
    did done than then there here how why when where also too just can will may might
    must should could would
  `).split(/\s+/));

  const words = (text.toLowerCase().match(/[a-z0-9']+/g) || [])
    .filter(w => !stop.has(w));

  const f = {};
  for (const w of words) f[w] = (f[w] || 0) + 1;
  return f;
}

function scoreSentence(sent, freq) {
  const words = (sent.toLowerCase().match(/[a-z0-9']+/g) || []);
  let s = 0;
  for (const w of words) s += (freq[w] || 0);
  return s / Math.max(4, words.length); // normalize
}

function sentencesToKeepCount(nSent, length) {
  if (length === "short") return Math.max(1, Math.ceil(nSent * 0.1));
  if (length === "long") return Math.max(5, Math.ceil(nSent * 0.35));
  return Math.max(3, Math.ceil(nSent * 0.2)); // medium
}

function summarizeText(text, length = "medium") {
  const sentences = splitSentences(text);
  if (!sentences.length) return "";

  const freq = wordFrequency(text);
  const scored = sentences.map((s, i) => ({ i, s, score: scoreSentence(s, freq) }));

  scored.sort((a, b) => b.score - a.score);

  const keep = sentencesToKeepCount(sentences.length, length);
  const picked = scored.slice(0, keep).sort((a, b) => a.i - b.i).map(x => x.s);

  return picked.join(" ");
}

function topKeywords(text, k = 5) {
  const f = wordFrequency(text);
  return Object.entries(f)
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(([w]) => w[0]);
}

function extractKeyPoints(summary) {
  const sents = splitSentences(summary);
  const bullets = [];

  for (const s of sents) {
    if (s.length <= 160) bullets.push(s);
    if (bullets.length >= 5) break;
  }

  if (bullets.length < 5) {
    const kws = topKeywords(summary, 8);
    for (const w of kws) {
      bullets.push(`Covers ${w}`);
      if (bullets.length >= 5) break;
    }
  }

  return bullets.slice(0, 5);
}


module.exports = { summarizeText, extractKeyPoints, aiSummarize };
