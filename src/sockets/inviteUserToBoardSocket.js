

// param socket là socket.io instance (được truyền từ server.js)
export const inviteUserToBoardSocket = (socket) => {
    socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
        // lắng nghe sự kiện (được tạo tên sự kiện) từ client gửi lên (emit) và emit ngược lại sự kiện cho mọi client khác (ngoại trừ client gửi sự kiện)
        socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
    })
}