document.addEventListener("DOMContentLoaded", () => {
  const summarizeBtn = document.getElementById("summarizeBtn");
  const fileInput = document.getElementById("fileInput");
  const fileNameEl = document.getElementById("fileName");
  const lengthSelect = document.getElementById("lengthSelect");

  const statusEl = document.getElementById("status");
  const resultEl = document.getElementById("result");
  const summaryText = document.getElementById("summaryText");
  const keyPointsEl = document.getElementById("keyPoints");

  fileInput.addEventListener("change", () => {
    fileNameEl.textContent = fileInput.files.length
      ? fileInput.files[0].name
      : "No file selected";
  });

  // Drag & Drop
  const dropZone = document.querySelector(".border-dashed");
  dropZone.addEventListener("dragover", e => {
    e.preventDefault();
    dropZone.classList.add("bg-emerald-50");
  });
  dropZone.addEventListener("dragleave", () =>
    dropZone.classList.remove("bg-emerald-50")
  );
  dropZone.addEventListener("drop", e => {
    e.preventDefault();
    dropZone.classList.remove("bg-emerald-50");
    if (e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      fileNameEl.textContent = e.dataTransfer.files[0].name;
    }
  });

  summarizeBtn.addEventListener("click", async () => {
    try {
      if (!fileInput.files.length) {
        statusEl.textContent = "⚠️ Please select a file first.";
        return;
      }

      const formData = new FormData();
      formData.append("file", fileInput.files[0]);
      formData.append("length", lengthSelect.value);

      statusEl.textContent = "⏳ Uploading & summarizing...";
      resultEl.classList.add("hidden");

      // Auto-switch between local dev and Render deployment
      const API_BASE = window.location.hostname.includes("localhost")
        ? "http://localhost:8001"
        : "https://summarease-bwue.onrender.com";

      const res = await fetch(`${API_BASE}/api/summarize`, {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (_) {
        data = null;
      }

      if (!res.ok) {
        const msg =
          data && (data.summary || data.message)
            ? data.summary || data.message
            : `HTTP ${res.status}`;
        throw new Error(msg);
      }

      // --- SUMMARY with green diamond bullets ---
      summaryText.innerHTML = "";
      const summarySentences = (data?.summary || "").split(/(?<=[.!?])\s+/);
      summarySentences.forEach(s => {
        if (s.trim()) {
          const li = document.createElement("div");
          li.innerHTML = `<span class="text-green-500 mr-2">⬩</span>${s.trim()}`;
          li.className = "mb-2 leading-relaxed";
          summaryText.appendChild(li);
        }
      });

      // --- KEY POINTS with pink star bullets ---
      keyPointsEl.innerHTML = "";
      (data?.key_points || []).forEach(pt => {
        const li = document.createElement("div");
        li.innerHTML = `<span class="text-pink-500 mr-2">★</span>${pt}`;
        li.className = "mb-1 leading-relaxed";
        keyPointsEl.appendChild(li);
      });

      resultEl.classList.remove("hidden");
      statusEl.textContent = "✅ Done: " + (data?.filename || "file");
    } catch (err) {
      console.error(err);
      statusEl.textContent = "⚠️ Error: " + err.message;
      summaryText.textContent = "⚠️ " + err.message;
      keyPointsEl.innerHTML = "";
      resultEl.classList.remove("hidden");
    }
  });

  // Copy Summary
  function copyText(text) {
    navigator.clipboard.writeText(text).then(() => alert("✅ Copied!"));
  }
  document
    .getElementById("copySummary")
    .addEventListener("click", () =>
      copyText(summaryText.textContent)
    );
  document
    .getElementById("copyKeyPoints")
    .addEventListener("click", () => {
      const points = Array.from(keyPointsEl.querySelectorAll("div"))
        .map(div => "• " + div.textContent)
        .join("\n");
      copyText(points);
    });

  // Download Summary
  document.getElementById("downloadSummary").addEventListener("click", () => {
    const blob = new Blob([summaryText.textContent], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "summary.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  // TTS
  let currentUtterance = null;
  function speak(text) {
    if (!window.speechSynthesis) {
      alert("TTS not supported");
      return;
    }
    window.speechSynthesis.cancel();
    currentUtterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(currentUtterance);
  }
  document.getElementById("ttsPlay").addEventListener("click", () => {
    const t = summaryText.textContent.trim();
    if (t) speak(t);
  });
  document.getElementById("ttsPause").addEventListener("click", () => {
    if (!window.speechSynthesis) return;
    if (window.speechSynthesis.paused)
      window.speechSynthesis.resume();
    else window.speechSynthesis.pause();
  });
  document.getElementById("ttsStop").addEventListener("click", () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  });
});
