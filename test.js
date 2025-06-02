import http from 'http';
import handler from './index.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  try {
    handler(req, res);
  } catch (err) {
    console.error('❌ Error dalam handler:', err);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Server lokal jalan di http://localhost:${PORT}`);
});