import { Server } from 'node-static';

const fileServer = new Server('./public');

const isIndexHtmlPath = (url) => {
  const [pureUrl] = url.split(/[#?]/);
  const [_, extention] = pureUrl.split('.');
  return !extention || extention.toLowerCase() === 'html';
};

const isUnauthorizedPagePath = (url) => {
  return ['/login', '/registration'].some(path => url.toLowerCase().startsWith(path));
};

const getRedirectUrl = (url, isUnauthorized) => {
  if (isUnauthorized === isUnauthorizedPagePath(url)) {
    return null;
  }

  return isUnauthorized ? '/login' : '/';
};

export const hadlesStaticRequest = ({ request, response, userId }) => {
  if (isIndexHtmlPath(request.url)) {
    const redirectUrl = getRedirectUrl(request.url, !userId);

    if (redirectUrl) {
      response.writeHead(302, {
        Location: getRedirectUrl(request.url, !userId),
      });

      response.end('');
      return;
    }
  }

  request.addListener('end', () => {
    fileServer.serve(request, response);
  }).resume();
};
