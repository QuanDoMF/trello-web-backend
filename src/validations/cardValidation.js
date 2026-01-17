import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { CARD_MEMBER_ACTIONS } from '~/utils/constants'


const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
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

const updateCard = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().optional().min(3).max(50).trim().strict(),
    description: Joi.string().optional(),
    commentToAdd: Joi.object({
      userAvatar: Joi.string().optional(),
      userDisplayName: Joi.string().optional(),
      content: Joi.string().required().trim()
    }).optional(),
    incomingMemberInfo: Joi.object({
      userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      action: Joi.string().required().valid(
        CARD_MEMBER_ACTIONS.ADD,
        CARD_MEMBER_ACTIONS.REMOVE
      )
    }).optional()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  }
  catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}
export const cardValidation = {
  createNew,
  updateCard
}
