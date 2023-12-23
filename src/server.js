/*eslint-disable no-console */
import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
const START_SERVER = () => {
  const app = express()

  // enable req.body json data
  app.use(express.json())
  app.use('/v1', APIs_V1)

  // middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  app.get('/', (req, res) => {
    res.end('<h1>Hello World </h1><hr>')
  })
  app.listen(env.APP_PORT, env.APP_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`3. Hi ${env.AUTHOR}, Back-end Server is running successfully at Host: ${env.APP_HOST} and Port: ${env.APP_PORT}`)
  })
  exitHook(() => {
    console.log('4. Server is shutting down...')
    CLOSE_DB()
      .then(() => {
        console.log('5. Disconnected from MongoDB Cloud Atlas')
      })
  })
}

// cách viết 2
// IIFE JavaScript Invoked Function
(async () => {
  try {
    console.log('1. Connecting to MongoDB Cloud Atlas...')
    await CONNECT_DB()
    console.log('2. Connected to MongoDB Cloud Atlas!')

    // khởi động server backend sau khi connect Database thành công
    START_SERVER()
  } catch (error) {
    console.log(error)
    process.exit(0) // khi lỗi thì như kiểu sẽ dừng con server lại
  }
})()

// cách viết 1
// console.log('1. Connecting to MongoDB Cloud Atlas...')
// CONNECT_DB()
//   .then(() => {
//     console.log('2. Connected to MongoDB Cloud Atlas!')
//   })
//   .then(() => START_SERVER())
//   .catch(error => {
//     console.log(error)
//     process.exit(0) // khi lỗi thì như kiểu sẽ dừng con server lại
//   })

