import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().required().min(3).max(50).trim().strict()
  })
  try {
    // set abortEarly: false để trường hợp có nhiều lỗi validation thì trả về tất cả lỗi
    await correctCondition.validateAsync(req.body, { abortEarly: false }) // abortEarly là validate có bị dừng sớm không
    next()
  }
  catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}
const update = async (req, res, next) => {
  // lưu ý không dùng require cho TH update
  const correctCondition = Joi.object({

    // nếu cần tính năng di chuyển Column sang Board khác thì mới thêm validate boardId
    // boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().min(3).max(50).trim().strict(),
    cardOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
  })
  try {
    // set abortEarly: false để trường hợp có nhiều lỗi validation thì trả về tất cả lỗi
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      // kiểu như khi update ta sẽ đẩy lên những trường không được khai báo trong Joi obj ở trên nó sẽ kệ
      allowUnknown: true
    }) // abortEarly là validate có bị dừng sớm không
    next()
  }
  catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}
export const columnValidation = {
  createNew,
  update
}
