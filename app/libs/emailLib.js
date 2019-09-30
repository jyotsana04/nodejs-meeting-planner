var nodemailer = require('nodemailer')
const appConfig = require('./../../config/appConfig')

let sendEmail = (mailOptions) => {

    var smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: appConfig.mailId,
            pass: appConfig.mailPassword
        }
    })

    smtpTransport.sendMail(mailOptions, function (error, info) {

        if (error) {
            console.log(error)
            logger.error('Failed To send mail', 'emailLib', 2)

        } else {
            console.log('Email sent' + info.response)
            logger.info('Mail sent', 'emailLib', 10)
        }
    })
}

module.exports = {
    sendEmail: sendEmail
}