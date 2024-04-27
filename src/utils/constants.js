
// danh sách các domain được phép truy cập tới tài nguyên server
export const WHITELIST_DOMAINS = [

  // không cần localhost nữa vì ở file config/cors đã luôn cho phép pass qua
  // 'http://localhost:5173'
  'https://trello-web-frontend.vercel.app'
]

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
}