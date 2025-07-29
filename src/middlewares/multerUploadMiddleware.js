import multer from 'multer'
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } from '~/utils/validators'

// Function kiểm tra loại file nào được chấp nhận
const customFileFilter = (req, file, callback) => {
    // Đối với multer, kiểm tra  kiểu file thì sử dụng mimetype (tương đương với type trong file input)
    if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
        const errMessage = 'File type is invalid. Only accept jpg, jpeg and png'
        return callback(new Error(errMessage), null)
    }
    // Nếu như kiểu file hợp lệ
    return callback(null, true)
}

// Khởi tạo function upload được bọc bởi multer

const upload = multer({
    limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
    fileFilter: customFileFilter
})

export const multerUploadMiddleware = { upload }