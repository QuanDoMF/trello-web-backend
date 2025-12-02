
import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'

const createNew = async (req, res, next) => {
  try {
    const createdCard = await cardService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdCard)
  }
  catch (error) {
    next(error)
  }
}

const updateCard = async (req, res, next) => {
  try {
    const { cardId } = req.params
    const cardCoverFile = req.file
    const updateCard = await cardService.updateCard(cardId, req.body, cardCoverFile)

    res.status(StatusCodes.OK).json(updateCard)
  }
  catch (error) {
    next(error)
  }
}

export const cardController = {
  createNew,
  updateCard
}