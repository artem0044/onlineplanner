import { request } from "http";
import { responseError } from "../public/modules/helpers.js";
import stickersService from "./stickers/index.js";
import usersService from "./users.js";

export const handleApiRequest = (ctx) => {
  const [_, service, endpoint] = ctx.request.url.match(/\/api\/([\w\d\-]+)\/?([\w\d\-]*)/i);

  switch (service) {
    case "users":
      usersService(ctx, endpoint);
      break;
    case "stickers":
      stickersService(ctx, endpoint);
      break;
    default:
      responseError(ctx.response, 404);
  }
};
