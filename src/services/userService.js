
import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bycrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { env } from '~/config/environment'
const createNew = async (reqBody) => {
  try {
    // Kiểm tra email tồn tại chưa
    const existedUser = await userModel.findOneByEmail(reqBody.email)
    if (existedUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')
    }

    const nameFromEmail = reqBody.email.split('@')[0]

    const newUser = {
      email: reqBody.email,
      password: bycrypt.hashSync(reqBody.password, 8), // tham số thứ 2 là độ phức tạp
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }
    // tạo data để lưu vào database
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)
    // gửi email cho người dùng xác thực tài khoản ...
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'Please verify your email address before using our services'
    const htmlContent = `
      <h3>Here is your verification link</h3>
      <p>${verificationLink}</p>
      <h3>Sincerely, <br/> - Tquandoo - </h3>
    `
    // Gọi tới Provider gửi mail
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)
    // return trả dữ liệu cho controller
    return pickUser(getNewUser)
  } catch (error) {
    console.log(error)
    throw error
  }
}
export const userService = {
  createNew
}