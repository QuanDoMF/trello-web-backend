
import express from 'express'
import { cardValidation } from '~/validations/cardValidation'
import { cardController } from '~/controllers/cardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'
const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, cardValidation.createNew, cardController.createNew)
Router.route('/:cardId')
  .put(authMiddleware.isAuthorized,
    multerUploadMiddleware.upload.single('cardCover'),
    cardValidation.updateCard,
    cardController.updateCard)

export const cardRoute = Router

