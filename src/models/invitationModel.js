import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { userModel } from './userModel'
import { boardModel } from './boardModel'

// Define Collection (name & schema)
const INVITATION_COLLECTION_NAME = 'invitations'
const INVITATION_COLLECTION_SCHEMA = Joi.object({
    inviterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE), // người đi mời
    inviteeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE), // người được mời
    type: Joi.string().required().valid(...Object.values(INVITATION_TYPES)),
    // Lời mời là board thì sẽ lưu thêm dữ liệu boardInvitation - optional
    boardInvitation: Joi.object({
        boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
        status: Joi.string().required().valid(...Object.values(BOARD_INVITATION_STATUS))
    }).optional(),
    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false)
})
const INVALID_UPDATE_FIELDS = ['_id', 'inviterId', 'inviteeId', 'type', 'createdAt']

const validateBeforeCreate = async (data) => {
    return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNewBoardInvitation = async (data) => {
    try {
        const validData = await validateBeforeCreate(data)
        // Biển đồi một số dữ liệu liên quan tới ObjectId chuẩn chỉnh
        let newInvitationToAdd = {
            ...validData,
            inviterId: new ObjectId(validData.inviterId),
            inviteeId: new ObjectId(validData.inviteeId)
        }
        // Nếu tồn tại dữ liệu boardInvitation thi update cho cái boardId
        if (validData.boardInvitation) {
            newInvitationToAdd.boardInvitation = {
                ...validData.boardInvitation,
                boardId: new ObjectId(validData.boardInvitation.boardId)
            }
        }

        // Gọi insert vào DB
        const createdInvitation = await GET_DB().collection(INVITATION_COLLECTION_NAME).insertOne(newInvitationToAdd)
        return createdInvitation
    } catch (error) { throw new Error(error) }
}

const findOneById = async (invitationId) => {
    try {
        const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOne({
            _id: new ObjectId(invitationId)
        })
        return result
    } catch (error) { throw new Error(error) }
}

const update = async (invitationId, updateData) => {
    try {
        // Lọc những field mà chúng ta không cho phep cap nhat linh tinh
        Object.keys(updateData).forEach(fieldName => {
            if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
                delete updateData[fieldName]
            }
        })
        // Đổi với những dữ liệu liên quan ObjectId, biển đồi ở đây
        if (updateData.boardInvitation) {
            updateData.boardInvitation = {
                ...updateData.boardInvitation,
                boardId: new ObjectId(updateData.boardInvitation.boardId)
            }
        }
        const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOneAndUpdate(
            { _id: new ObjectId(invitationId) },
            { $set: updateData },
            { returnDocument: 'after' } // sẽ trả về kết quả mới sau khi cập nhật
        )
        return result
    } catch (error) { throw new Error(error) }
}

// query tổng hợp (aggregate) để lấy những bản ghi invitiation thuộc về một thằng user cụ thể
const findByUser = async (userId) => {
    try {
        const queryConditions = [
            { inviteeId: new ObjectId(userId) }, // tìm theo id của user được mời (inviteeId)
            { _destroy: false }
        ]
        const results = await GET_DB().collection(INVITATION_COLLECTION_NAME).aggregate([
            {
                $match: { $and: queryConditions }
            },
            {
                $lookup: {
                    from: userModel.USER_COLLECTION_NAME,
                    localField: 'inviterId', // người đi mời
                    foreignField: '_id',
                    as: 'inviter',
                    // Pipeline trong lookup là để xử lý một hoặc nhiều luồng cần thiết
                    // $project là để chỉ định vài field không muốn trả về bằng cách gán giá trị 0
                    pipeline: [{
                        $project: {
                            'password': 0,
                            'verifyToken': 0
                        }
                    }]
                }
            },
            {
                $lookup: {
                    from: userModel.USER_COLLECTION_NAME,
                    localField: 'inviteeId', // người được mời
                    foreignField: '_id',
                    as: 'invitee',
                    // Pipeline trong lookup là để xử lý một hoặc nhiều luồng cần thiết
                    // $project là để chỉ định vài field không muốn trả về bằng cách gán giá trị 0
                    pipeline: [{
                        $project: {
                            'password': 0,
                            'verifyToken': 0
                        }
                    }]
                }
            },
            {
                $lookup: {
                    from: boardModel.BOARD_COLLECTION_NAME,
                    localField: 'boardInvitation.boardId', // boardId
                    foreignField: '_id',
                    as: 'board'
                }
            }
        ]).toArray()
        return results
    } catch (error) { throw new Error(error) }
}

export const invitationModel = {
    INVITATION_COLLECTION_NAME,
    INVITATION_COLLECTION_SCHEMA,
    createNewBoardInvitation,
    findOneById,
    update,
    findByUser
}