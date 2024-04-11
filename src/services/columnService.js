/* eslint-disable no-useless-catch */
import ApiError from '~/utils/ApiError'
import { slugify } from '~/utils/formatters'
import { columnModel } from '~/models/columnModel'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
const createNew = async (reqBody) => {
  try {
    const newColumn= {
      ...reqBody
    }
    const createdColumn= await columnModel.createNew(newColumn)
    const getNewColumn= await columnModel.findOneById(createdColumn.insertedId)
    return getNewColumn
  }
  catch (error) {
    throw error
  }
}

export const columnService = {
  createNew
}