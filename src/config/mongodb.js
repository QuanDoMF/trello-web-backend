/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from '~/config/environment'


// khởi tạo một đối tượng trelloDatabaseInstance ban đầu là null (vì ta chưa connect)
let trelloDatabaseInstance = null

// khởi tạo một đối tượng mongoClientInstance để connect tới mongoDB
const mongoClientInstance = new MongoClient (env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
}
})

// function kết nối tới databse
export const CONNECT_DB = async () => {
  // gọi kết nối tới mongoDB atlas với URI đã khai báo trong thân của MongoClientInstance
  await mongoClientInstance.connect()

  // kết nối thành công thì lấy database theo tên và gán ngược lại vào biến trelloDataBaseInstance
  trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

// Function GET_DB (không async) này có nhiệm vụ export ra cái database instance sau khi đã connect
// connect thành công tới MongoDB để chúng tả sử dụng ở nhiều nơi khác nhau  trong code
// Lưu ý phải đảm bảo chỉ luôn gọi cái getDB này sau khi đã kết nối thành công tới MongoDB
export const GET_DB = () => {
  if (!trelloDatabaseInstance) throw new Error('Must connect to Databse first!')
  return trelloDatabaseInstance
}

// đóng kết nối tới DB
export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}