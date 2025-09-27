
import express from 'express'
import { cardValidation } from '~/validations/cardValidation'
import { cardController } from '~/controllers/cardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, cardValidation.createNew, cardController.createNew)
Router.route('/:cardId')
  .put(authMiddleware.isAuthorized, cardValidation.updateCard, cardController.updateCard)

export const cardRoute = Router

