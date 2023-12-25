/* eslint-disable no-useless-catch */
import ApiError from '~/utils/ApiError'
import { slugify } from '~/utils/formatters'
const createNew = (reqBody) => {
  try {
    // xử lí logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // gọi tới model để xử lý lưu bản ghi newBoard vào trong database
    return newBoard
  }
  catch (error) {
    throw error
  }
}
export const boardService = {
  createNew
}