
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { boardService } from '~/services/boardService'

const createNew = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const createdBoard = await boardService.createNew(userId, req.body)
    res.status(StatusCodes.CREATED).json(createdBoard)
  }
  catch (error) {
    next(error)
    // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    //   errors: e.message
    // })
  }
}
const getDetails = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const userId = req.jwtDecoded._id

    const board = await boardService.getDetails(userId, boardId)
    res.status(StatusCodes.OK).json(board)
  }
  catch (error) {
    next(error)
  }
}
const update = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const updatedBoard = await boardService.update(boardId, req.body)
    res.status(StatusCodes.OK).json(updatedBoard)
  }
  catch (error) {
    next(error)
  }
}
const moveCardToDifferentColumn = async (req, res, next) => {
  try {
    const result = await boardService.moveCardToDifferentColumn(req.body)

    res.status(StatusCodes.OK).json(result)
  }
  catch (error) {
    next(error)
  }
}
const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const { page, itemPerPage } = req.query
    const result = await boardService.getBoards(userId, page, itemPerPage)
    res.status(StatusCodes.OK).json(result)
  }
  catch (error) {
    next(error)
  }
}
export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards
}