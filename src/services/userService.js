
import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bycrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

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
    throw error
  }
}

const verifyAccount = async (reqBody) => {
  try {
    // Query user trong database
    const existedUser = await userModel.findOneByEmail(reqBody.email)

    if (!existedUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }
    if (existedUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active!')
    }
    if (reqBody.token !== existedUser.verifyToken) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid')
    }
    // nếu mọi thứ Oke thì update lại tt user
    const updatedData = {
      isActive: true,
      isVerified: null
    }
    // Thực hiện update thông tin user
    const updatedUser = await userModel.update(existedUser._id, updatedData)
    // trả về controller dữ liệu đã được cập nhật
    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

const login = async (reqBody) => {
  try {
    const existedUser = await userModel.findOneByEmail(reqBody.email)

    if (!existedUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }
    if (!existedUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is already active!')
    }
    if (!bycrypt.compareSync(reqBody.password, existedUser.password)) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Your Email or Password is incorrect!')
    }

    // Nếu mọi thử oke thì tạo Token trả về cho FE
    const userInfor = {
      _id: existedUser._id,
      email: existedUser.email
    }
    // Tạo ra 2 loại token, access token và refresh token
    const accessToken = await JwtProvider.generateToken(
      userInfor,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5
      env.ACCESS_TOKEN_LIFE
    )
    const refreshToken = await JwtProvider.generateToken(
      userInfor,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
    )
    // Trả về dữ liệu cho controller 2 token vừa tạo
    return {
      accessToken, refreshToken, ...pickUser(existedUser)
    }
  } catch (error) { throw error }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    // verify / giải mã cái refresh token xem có hợp lệ không
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      clientRefreshToken,
      env.REFRESH_TOKEN_SECRET_SIGNATURE)

    const userInfor = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }

    const accessToken = await JwtProvider.generateToken(
      userInfor,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    )

    return { accessToken }
  } catch (error) {
    { throw error }
  }
}

const update = async (userId, reqBody, userAvatarFile) => {
  try {
    const existedUser = await userModel.findOneById(userId)
    if (!existedUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }
    if (!existedUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active!')
    }
    // khởi tạo kết quả update user
    let updatedUser = {}
    if (reqBody.current_password && reqBody.new_password) {
      if (!bycrypt.compareSync(reqBody.current_password, existedUser.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your current password is incorrect!')
      }
      updatedUser = await userModel.update(userId, {
        password: bycrypt.hashSync(reqBody.new_password, 8)
      })
    } else if (userAvatarFile) {
      // trường hợp update avatar
      const updateResult = await CloudinaryProvider.streamUpload(userAvatarFile.buffer, 'users')

      // Lưu lại url của cái file ảnh vào database
      updatedUser = await userModel.update(userId, {
        avatar: updateResult.secure_url
      })
    } else {
      // Loại bỏ các trường password-related để đảm bảo an toàn
      // eslint-disable-next-line no-unused-vars
      const { current_password, new_password, ...safeUpdateData } = reqBody
      // trường hợp update thông tin chung
      updatedUser = await userModel.update(userId, safeUpdateData)
    }
    return pickUser(updatedUser)
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update
}