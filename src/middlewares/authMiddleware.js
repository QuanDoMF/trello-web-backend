
import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'

const isAuthorized = async (req, res, next) => {
    // Lấy accessToken từ cookie
    const clientAccessToken = req.cookies.accessToken || req.headers.authorization?.split(' ')[1]
    if (!clientAccessToken) {
        next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token not found)'))
        return
    }

    try {
        const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)
        req.jwtDecoded = accessTokenDecoded
        next()
    } catch (error) {

        // nếu access token hết hạn thì sẽ trả về mã lỗi 410 - GONE
        if (error?.message?.includes('jwt expired')) {
            next(new ApiError(StatusCodes.GONE, 'Need to refresh token.'))
            return
        }

        // nếu access token không hợp lệ thì sẽ trả về mã lỗi 401 - UNAUTHORIZED
        next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
    }
}

export const authMiddleware = {
    isAuthorized
}