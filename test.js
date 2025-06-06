import handler from './index.js';
const http = await import('http');

const server = http.createServer((req, res) => {
  handler(req, res);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});