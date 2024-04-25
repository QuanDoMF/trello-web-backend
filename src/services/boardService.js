/* eslint-disable no-useless-catch */
import ApiError from '~/utils/ApiError'
import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
const createNew = async (reqBody) => {
  try {
    // xử lí logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }
    // gọi tới model để xử lý lưu bản ghi newBoard vào trong database
    const createdBoard = await boardModel.createNew(newBoard)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
    return getNewBoard
  }
  catch (error) {
    throw error
  }
}
const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }
    // Deep clone board ra một cái mới để xử lý, không ảnh hưởng tới board ban đầu
    const resBoard = cloneDeep(board)
    resBoard.columns.forEach(column => {
      // Cách dùng .equals này là bởi vì ta hiểu ObjectId trong MongoDB có support method equals
      column.cards = resBoard.cards.filter((card) => card.columnId.equals(column._id))

      // cách khác đơn giản hơn là ObjId về string bằng hàm toString()(khi truyền client lên auto đổi sang string nên khi có bug khó log ra lỗi)
      // column.cards = resBoard.cards.filter((card) => card.columnId.toString() === column._id.toString())
    })
    delete resBoard.cards
    return resBoard
  }
  catch (error) {
    throw error
  }
}
const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardId, updateData)

    return updatedBoard
  }
  catch (error) {
    throw error
  }
}
const moveCardToDifferentColumn = async (reqBody) => {
  try {
    // * B1: cần cập nhật mảng cardOrderIds của Column ban đầu chưa nó(Là xóa _id của Card đó ra khỏi mảng)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    })

    // * B2: cần cập nhật mảng cardOrderIds của Column tiếp theo (Là thêm _id của Card đó vào mảng)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now()
    })
    // * B3: cập nhật ColumnId mới của card đã kéo
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId
    })

    return { updateResult: 'Successfull' }
  }
  catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn
}