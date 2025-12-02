/* eslint-disable no-useless-catch */
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
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

const updateCard = async (cardId, reqBody, cardCoverFile) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    let updatedCard = {}

    if (cardCoverFile) {
      const updateResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'cards')
      updatedCard = await cardModel.update(cardId, { cover: updateResult.secure_url })
    } else {
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