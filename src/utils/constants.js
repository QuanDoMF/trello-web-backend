
// danh sách các domain được phép truy cập tới tài nguyên server
import { env } from '~/config/environment'

export const WHITELIST_DOMAINS = [

  // không cần localhost nữa vì ở file config/cors đã luôn cho phép pass qua
  // 'http://localhost:5173'
  'https://trello-web-frontend.vercel.app',
  'https://trello-web-frontend-trung-quans-projects.vercel.app'
]

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production' ? env.WEBSITE_DOMAIN_PROD : env.WEBSITE_DOMAIN_DEV)

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEM_PER_PAGE = 12

export const INVITATION_TYPES = {
  BOARD_INVITATION: 'BOARD_INVITATION'
}

export const BOARD_INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
}