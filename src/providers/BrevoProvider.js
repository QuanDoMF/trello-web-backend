

const SibApiV3Sdk = require('@getbrevo/brevo')
import { env } from '~/config/environment'

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY


const sendEmail = async (recipientEmail, customSubject, htmlContent) => {
    // khởi tạo 1 cái sendSmtpEmail

    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

    sendSmtpEmail.sender = {
        email: `${env.ADMIN_EMAIL_ADDRESS}`,
        name: `${env.ADMIN_EMAIL_NAME}`
    }

    // Những tài khoản nhận email
    sendSmtpEmail.to = [
        {
            email: recipientEmail
        }
    ]

    // Tiêu đề email
    sendSmtpEmail.subject = customSubject

    // Nội dung email
    sendSmtpEmail.htmlContent = htmlContent

    // Hành động gửi mail
    return apiInstance.sendTransacEmail(sendSmtpEmail)

}
export const BrevoProvider = { sendEmail }