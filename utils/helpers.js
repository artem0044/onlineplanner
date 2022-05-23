import { request } from "http";

export const processRequestBody = (request, cb) => {
  let body = '';
  request.on('data', chunk => body += chunk.toString());
  request.on('end', async () => await cb(JSON.parse(body)));
};

export const getRequestBody = (request) => {
  return new Promise(resolve => {
    let body = '';
    request.on('data', chunk => body += chunk.toString());
    request.on('end', () => resolve(JSON.parse(body)));
  });
}; 