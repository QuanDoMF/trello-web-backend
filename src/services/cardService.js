/* eslint-disable no-useless-catch */
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import { CARD_MEMBER_ACTIONS } from '~/utils/constants'
const createNew = async (reqBody) => {
  try {
    const newCard = {
      ...reqBody
    }
    const createdCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
      await columnModel.pushCardOrderIds(getNewCard)
    }
    return getNewCard
  }
  catch (error) {
    throw error
  }
}

const updateCard = async (cardId, reqBody, cardCoverFile, userInfor) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    let updatedCard = {}

    if (cardCoverFile) {
      // Case 1: Update card cover image
      const updateResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'cards')
      updatedCard = await cardModel.update(cardId, { cover: updateResult.secure_url })
    } else if (updateData.commentToAdd) {
      // Case 2: Add new comment to card
      const commentData = {
        ...updateData.commentToAdd,
        userId: userInfor._id,
        userEmail: userInfor.email,
        commentedAt: Date.now()
      }
      updatedCard = await cardModel.unshiftNewComment(cardId, commentData)
    } else if (updateData.incomingMemberInfo) {
      // Case 3: Add or Remove member from card
      const { userId, action } = updateData.incomingMemberInfo

      if (action === CARD_MEMBER_ACTIONS.ADD) {
        updatedCard = await cardModel.pushMemberIds(cardId, userId)
      }
      if (action === CARD_MEMBER_ACTIONS.REMOVE) {
        updatedCard = await cardModel.pullMemberIds(cardId, userId)
      }
    } else {
      // Case 4: General update (title, description, etc.)
      updatedCard = await cardModel.update(cardId, updateData)
    }

    return updatedCard
  }
  catch (error) {
    throw error
  }
}

export const cardService = {
  createNew,
  updateCard
}