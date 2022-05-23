import { getRequestBody } from "../utils/helpers.js";
import { fieldValidators } from "../public/modules/validators.mjs";
import jwt_decode from "jwt-decode";
import jwt from "jsonwebtoken";
import { secret } from "../public/modules/jwt-key.mjs";
import { responseError } from '../public/modules/helpers.js'

const setAuthorizationCookie = (response, userId) => {
  const dayInMs = 86400 * 1000; // 1 day
  const expiredIn = 3 * dayInMs; // 3 days
  const expiredAt = Date.now() + expiredIn;
  const token = jwt.sign(
    { userId, expiredAt },
    secret.key,
    { expiresIn: `${expiredIn}ms` },
  );

  response.setHeader('Set-Cookie', `token=${token}; expires=${new Date(expiredAt).toUTCString()}; path=/;`);
  response.end(JSON.stringify(''));
};

export const verifyToken = (request) => {
  const { token } = (request.headers.cookie || '').split(';').reduce((acc, item) => {
    const keyValueArray = item.split('=');
    acc[keyValueArray[0].trim()] = keyValueArray[1];
    return acc;
  }, {});

  try {
    jwt.verify(token, secret.key);
    const { userId } = jwt_decode(token);
    return userId;

  } catch (err) {
    return null;
  }
};


const autorizateUser = async ({ request, response, collections }) => {
  const body = await getRequestBody(request);

  const errors = [];

  for (let field in body) {
    const error = fieldValidators[field].map(validator => validator(body[field])).find(error => error);

    if (!error) continue;

    errors.push({
      message: error,
      field,
    });
  }

  if (errors.length) {
    responseError(response, 400, JSON.stringify(errors));
    return;
  }

  const user = await collections.usersCollection.findOne({ nick: body.nick, password: body.password });

  if (!user) {
    errors.push({
      message: `Your nick or password is invalid`,
      field: 'nick',
    });

    responseError(response, 400, JSON.stringify(errors));
    return;
  }

  setAuthorizationCookie(response, user._id);
}

const authorizationEndpoint = (ctx) => {
  switch (ctx.request.method) {
    case 'POST':
      autorizateUser(ctx);
      break;
    default:
      responseError(ctx.response, 405);
  }
};

/*create User create User create Usercreate User create User create User create User create User create Usercreate Usercreate User create User*/

const createUser = async ({ request, response, collections }) => {
  const body = await getRequestBody(request);
  const errors = [];

  for (let field in body) {
    const error = fieldValidators[field].map(validator => validator(body[field])).find(error => error);

    if (!error) continue;

    errors.push({
      message: error,
      field,
    });
  }

  if (!errors.length) {
    for (let field of ['email', 'nick']) {
      const userWithSameField = await collections.usersCollection.findOne({ [field]: body[field] });

      if (userWithSameField) {
        errors.push({
          message: `User with same ${field} already exists`,
          field,
        });
      }
    }
  }

  if (errors.length) {
    responseError(response, 409, JSON.stringify(errors));
    return;
  }

  const { insertedId } = await collections.usersCollection.insertOne(body);
  setAuthorizationCookie(response, insertedId);
};

const baseEndpoint = (ctx) => {
  switch (ctx.request.method) {
    case 'POST':
      createUser(ctx);
      break;
    default:
      responseError(ctx.response, 405);
  }
};

const usersService = (ctx, endpoint) => {
  switch (endpoint) {
    case '':
      baseEndpoint(ctx);
      break;
    case 'authorization':
      authorizationEndpoint(ctx);
      break;
    default:
      responseError(ctx.response, 404);
  }
};

export default usersService;
