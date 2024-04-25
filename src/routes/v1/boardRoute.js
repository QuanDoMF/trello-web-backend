
import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'
const Router = express.Router()

Router.route('/')
  .get((req, res, next) => {
    res.status(StatusCodes.OK).json({
      message: 'Get: API get list boards'
    })
  })
  .post(boardValidation.createNew, boardController.createNew)
Router.route('/:id')
  .get(boardController.getDetails) //lấy
  .put(boardValidation.update, boardController.update) // update

// API hỗ trợ việc di chuyển card giữa các column khác nhau trong một board
Router.route('/supports/moving_cards')
  .put(boardValidation.moveCardToDifferentColumn, boardController.moveCardToDifferentColumn)
export const boardRoute = Router

