import { getRequestBody } from "../../utils/helpers.js";
import StickersMappers from "./mappers.js";
import { responseError } from "../../public/modules/helpers.js";
import { ObjectId } from 'mongodb';

const createSticker = async ({ userId, request, response, collections }) => {
  const body = await getRequestBody(request);

  const userStickerModels = await collections.stickersCollection.find({ userId }).toArray();
  const order = userStickerModels.length;

  const stickerModel = StickersMappers.toStickerModel(body, userId, order);
  collections.stickersCollection.insertOne(stickerModel);

  const stickerDTO = StickersMappers.toStickerDTO(stickerModel);
  response.end(JSON.stringify(stickerDTO));
};

const getStickers = async ({ userId, response, collections }) => {
  const userStickerModels = await collections.stickersCollection.find({ userId }).toArray();
  const userStickerDTOs = userStickerModels.map(StickersMappers.toStickerDTO);
  response.end(JSON.stringify(userStickerDTOs));
};

const deleteSticker = async ({ response, collections }, endpoint) => {
  if (/^[0-9a-f]{24}$/.test(endpoint)) {
    await collections.stickersCollection.deleteOne({ _id: new ObjectId(endpoint) });
    response.end(JSON.stringify(''));
  } else {
    responseError(response, 404);
  }
};

const updateSticker = async ({ response, request, collections }) => {
  const body = await getRequestBody(request);

  const isStickerIdExists = await collections.stickersCollection.findOne({ _id: new ObjectId(body.stickerId) });

  if (!isStickerIdExists) {
    responseError(response, 404);
  }

  const { value: sticker } = await collections.stickersCollection.findOneAndUpdate({ _id: ObjectId(body.stickerId) }, {
    $set: {
      content: body.content,

      style: {
        bgColor: body.style.bgColor,
        fontFamily: body.style.fontFamily,
        fontSize: body.style.fontSize,
      },
      timestamp: body.timestamp,
      status: body.status,
    },
  },
    {
      returnDocument: 'after'
    });

  response.end(JSON.stringify(sticker));
};

const baseEndpoint = (ctx, endpoint) => {
  switch (ctx.request.method) {
    case 'POST':
      createSticker(ctx);
      break;
    case 'GET':
      getStickers(ctx);
      break;
    case 'PUT':
      updateSticker(ctx);
      break;
    case 'DELETE':
      deleteSticker(ctx, endpoint);
      break;
    default:
      responseError(ctx.response, 405);
  }
};

const reorderSticker = async ({ response, request, collections }) => {
  const body = await getRequestBody(request);
  const userStickerModels = await collections.stickersCollection.find({ userId }).toArray();

  const { value: sticker } = await collections.stickersCollection.findOneAndUpdate({ _id: ObjectId(body.stickerId) }, { $set: { order: userStickerModels.length + 1  } },
    {
      returnDocument: 'after'
    });

  response.end(JSON.stringify('ok'));
};

const stickersService = (ctx, endpoint) => {
  if (!ctx.userId) {
    responseError(ctx.response, 401);
    return;
  }

  switch (endpoint) {
    case 'reorder':
      reorderSticker(ctx);
      break;
    default:
      baseEndpoint(ctx, endpoint);
      break;
  }
};

export default stickersService;
