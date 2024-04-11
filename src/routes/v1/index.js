
import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from './boardRoute'
import { columnRoute } from './columnRoute'
import { cardRoute } from './cardRoute'


const Router = express.Router()

// check API_V1 status
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({
    message: 'APIs V1 are ready to use'
  })
})

// Board APIs
Router.use('/boards', boardRoute)

Router.use('/columns', columnRoute )
Router.use('/cards', cardRoute)

export const APIs_V1 = Router
