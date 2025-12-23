import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'
import { boardModel } from '~/models/boardModel'
import { invitationModel } from '~/models/invitationModel'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'

const createNewBoardInvitation = async (reqBody, inviterId) => {
    try {
        // Người đi mời: chính là người đang request, nên chúng ta tìm theo id lẩy từ token
        const inviter = await userModel.findOneById(inviterId)
        // Người được mời: lầy theo email nhận từ phía FE
        const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)
        // Tìm luon cai board ra đe lay data xử lý
        const board = await boardModel.findOneById(reqBody.boardId)

        // Nếu không tồn tại 1 trong 3 thì cứ thắng tay reject
        if (!invitee || !inviter || !board) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, Invitee or Board not found!')
        }
        // Tạo data cần thiết để lưu vào trong DB
        // Có thể thử bỏ hoặc làm sai lệch type, boardInvitation, status de test xem Model validate ok chua.
        const newInvitationData = {
            inviterId,
            inviteeId: invitee._id.toString(), // chuyển từ ObjectId về String vì sang bên Model có check lại
            type: INVITATION_TYPES.BOARD_INVITATION,
            boardInvitation: {
                boardId: board._id.toString(),
                status: BOARD_INVITATION_STATUS.PENDING
            }
        }
        // Gọi sang Model để lưu vào DB
        const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)
        const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId)

        // Ngoài thông tin của cái board invitation mới tạo thì tra về đủ ca luôn board, inviter, invitee cho FE thoải mái xử lý.
        const resInvitation = {
            ...getInvitation,
            board,
            inviter: pickUser(inviter),
            invitee: pickUser(invitee)
        }

        return resInvitation
    } catch (error) { throw error }
}

const getInvitations = async (userId) => {
    try {
        const getInvitations = await invitationModel.findByUser(userId)
        // Vì các dữ liệu inviter, invitee và board là đang ở giá trị mằng 1 phần tử nếu lấy ra được nên chúng ta biển đồi nó về Json Object trước khi trả về cho phía FE
        const resInvitations = getInvitations.map(invitation => ({
            ...invitation,
            inviter: invitation.inviter[0] || {},
            invitee: invitation.inviter[0] || {},
            board: invitation.board[0] || {}
        }))
        return resInvitations
    } catch (error) { throw error }
}

const updateBoardInvitation = async (userId, invitationId, status) => {
    try {
        const getInvitation = await invitationModel.findOneById(invitationId)
        if (!getInvitation) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found!')
        }
        const boardId = getInvitation.boardInvitation.boardId
        const getBoard = await boardModel.findOneById(boardId)
        if (!getBoard) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
        }
        const boardOwnerAndMemberIds = [...getBoard.ownerIds, ...getBoard.memberIds]
        const hasUserInBoard = boardOwnerAndMemberIds.some(ids => ids.equals(userId))
        if (hasUserInBoard && status === BOARD_INVITATION_STATUS.ACCEPTED) {
            throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'you are already a member of this board!')
        }
        // tạo dữ liệu để update bản ghi invitation
        const updateData = {
            boardInvitation: {
                ...getInvitation.boardInvitation,
                status
            }
        }

        // B1: cập nhật status trong bản ghi invitation
        const updatedInvitation = await invitationModel.update(invitationId, updateData)
        // B2: Nếu lời mời được ACCEPT thì thêm người đó vào danh sách member của board
        if (updatedInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
            await boardModel.pushMembersIds(boardId, userId)
        }
        return updatedInvitation

    } catch (error) { throw error }
}

export const invitationService = {
    createNewBoardInvitation,
    getInvitations,
    updateBoardInvitation
}

