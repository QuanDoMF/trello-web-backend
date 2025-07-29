import cloudinary from 'cloudinary'
import streamifier from 'streamifier'
import { env } from '~/config/environment'

// Bước cấu hình Cloudinary, sử dụng v2 - version 2
const cloundinaryV2 = cloudinary.v2
cloundinaryV2.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
})

// khởi tạo function upload file lên cloudinary
const streamUpload = (fileBuffer, folderName) => {
    return new Promise((resolve, reject) => {
        const stream = cloundinaryV2.uploader.upload_stream({ folder: folderName }, (error, result) => {
            if (error) {
                return reject(error)
            }
            return resolve(result)
        })
        streamifier.createReadStream(fileBuffer).pipe(stream)
    })
}
export const CloudinaryProvider = { streamUpload }