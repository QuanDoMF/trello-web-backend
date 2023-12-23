
import { StatusCodes } from 'http-status-codes'
const createNew = async (req, res, next) => {
  try {
    console.log('req.body', req.body)
    res.status(StatusCodes.CREATED).json({
      message: 'Post from controller: API create new boards'
})
  }
  catch (e) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors: e.message
    })
  }
}
export const boardController = {
  createNew
}