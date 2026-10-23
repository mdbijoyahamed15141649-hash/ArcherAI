const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8081;
const KEY_FILE = path.join(
  process.env.HOME,
  ".config/archerai/gemini.key"
);
const HTML_FILE = path.join(__dirname, "www", "index.html");

const server = http.createServer(async (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET" &&
      (req.url === "/" || req.url === "/index.html")) {
    fs.readFile(HTML_FILE, (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end("Archer AI file error");
      }
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8"
      });
      res.end(data);
    });
    return;
  }

  if (req.method === "POST" && req.url === "/api/chat") {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
      if (body.length > 100000) req.destroy();
    });

    req.on("end", async () => {
      try {
        const { message, history = [] } = JSON.parse(body);

        if (typeof message !== "string" ||
            !message.trim() || message.length > 10000) {
          res.writeHead(400);
          return res.end(JSON.stringify({ error: "মেসেজটি ঠিক নেই।" }));
        }

        const key = fs.readFileSync(KEY_FILE, "utf8").trim();

        const contents = [
          ...history.slice(-12).filter(m =>
            (m.role === "user" || m.role === "model") &&
            typeof m.text === "string"
          ).map(m => ({
            role: m.role,
            parts: [{ text: m.text.slice(0, 10000) }]
          })),
          { role: "user", parts: [{ text: message.trim() }] }
        ];

        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": key
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{
                  text: "তুমি Archer AI, বিজয়ের বাংলা AI সহকারী। সহজ, বন্ধুত্বপূর্ণ বাংলায় উত্তর দাও।"
                }]
              },
              contents
            }),
            signal: AbortSignal.timeout(60000)
          }
        );

        const data = await response.json();

        if (!response.ok) {
          console.error("Gemini API error:", response.status);
          res.writeHead(502, {
            "Content-Type": "application/json; charset=utf-8"
          });
          return res.end(JSON.stringify({
            error: "Gemini সংযোগে সমস্যা হয়েছে। HTTP " + response.status
          }));
        }

        const answer = data.candidates?.[0]?.content?.parts
          ?.map(p => p.text || "").join("");

        if (!answer) throw new Error("AI উত্তর দেয়নি");

        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8"
        });
        res.end(JSON.stringify({ answer }));
      } catch (err) {
        console.error("Chat error:", err.message);
        if (!res.headersSent) {
          res.writeHead(500, {
            "Content-Type": "application/json; charset=utf-8"
          });
          res.end(JSON.stringify({
            error: "সমস্যা হয়েছে। সার্ভার চালু ও API Key পরীক্ষা করো।"
          }));
        }
      }
    });
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Archer AI চলছে: http://127.0.0.1:${PORT}`);
});
