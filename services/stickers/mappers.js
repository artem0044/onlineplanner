const toStickerModel = (stickerDTO, userId, order) => {
  return {
    content: stickerDTO.content,
    style: stickerDTO.style,
    timestamp: stickerDTO.timestamp,
    status: stickerDTO.status,
    order,
    userId,
  };
};



const toStickerDTO = (stickerModel) => ({
  content: stickerModel.content,
  style: stickerModel.style,
  id: stickerModel._id,
  timestamp: stickerModel.timestamp,
  status: stickerModel.status,
  order: stickerModel.order
});

const StickersMappers = { toStickerDTO, toStickerModel };

export default StickersMappers;