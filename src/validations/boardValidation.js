
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().message({
      'any.required': 'Title is required tquandoo',
      'string.empty': 'Title is not allowed to be empty tquandoo',
      'string.min': 'Title length must be at least 3 characters long tquandoo',
      'string.max': 'Title length must be less than or equal to 5 characters long',
      'string.trim': 'Title must not have leading or trailing whitespace tquandoo'
    }),
    description: Joi.string().required().min(3).max(250).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required()
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
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(250).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE),
    columnOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
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
export const boardValidation = {
  createNew,
  update
}
