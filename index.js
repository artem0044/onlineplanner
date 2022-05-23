import http from 'http';
import { verifyToken } from './services/users.js';
import { hadlesStaticRequest } from './static.js';
import { startDB } from './db.js';
import { handleApiRequest } from './services/index.js';

const port = 3000;

const requestHandler = collections => {
  return (request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "http://localhost:5500");
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST,  PUT, PATCH, DELETE');
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    response.setHeader("Content-Type", "application/json");
    response.setHeader("Access-Control-Allow-Credentials", true);

    const userId = verifyToken(request);
    const ctx = { userId, request, response, collections };
    
    if (request.url.startsWith('/api')) {
      handleApiRequest(ctx);
    } else {
      hadlesStaticRequest(ctx);
    }
  }
};

const startServer = collections => {
  const server = http.createServer(requestHandler(collections));

  server.listen(port, (err) => {
    if (err) {
      return console.log('something bad happened', err);
    }

    console.log(`server is listening on ${port}`);
  });
};

const start = async () => {
  const result = await startDB();
  startServer(result);
}

start();
