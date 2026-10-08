const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8080;
const file = path.join(__dirname, "www", "index.html");

const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/index.html") {
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(500, {
          "Content-Type": "text/plain; charset=utf-8"
        });
        res.end("Archer AI file error");
        return;
      }

      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8"
      });
      res.end(data);
    });
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Archer AI চলছে: http://127.0.0.1:${PORT}`);
});
