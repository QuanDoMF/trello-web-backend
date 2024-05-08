/* eslint-disable no-useless-catch */
import ApiError from '~/utils/ApiError'
import { slugify } from '~/utils/formatters'
import { columnModel } from '~/models/columnModel'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
const createNew = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody
    }
    const createdColumn = await columnModel.createNew(newColumn)
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)

    if (getNewColumn) {
      getNewColumn.cards = []
      await boardModel.pushColumnOrderIds(getNewColumn)
    }
    return getNewColumn
  }
  catch (error) {
    throw error
  }
}
const update = async (columnId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedColumn = await columnModel.update(columnId, updateData)

    return updatedColumn
  }
  catch (error) {
    throw error
  }
}
const deleteItem = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId)
    console.log('🚀 ~ deleteItem ~ targetColumn:', targetColumn)
    console.log('Han')
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not Found!')
    }

    // xóa column
    await columnModel.deleteOneById(columnId)

    // xóa toàn bộ card thuộc Column trên
    await cardModel.deleteManeByColumnId(columnId)

    // xoá columnOrderIds trong collection boards
    await boardModel.pullColumnOrderIds(targetColumn)

    return {
      deleteResult: 'Column and its Cards deleted successfully!'
    }
  }
  catch (error) {
    throw error
  }
}

export const columnService = {
  createNew,
  update,
  deleteItem
}