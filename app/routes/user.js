const express = require('express');
const router = express.Router();
const userController = require("./../../app/controllers/userController");
const appConfig = require("./../../config/appConfig")
const auth = require('../middlewares/auth')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/users`;

    // defining routes.

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/signup User SignUp.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     * @apiParam {string} password confirm password of the user. (body params) (required)
     * @apiParam {string} firstName firstName  of the user. (body params) (required)
     * @apiParam {string} lastName lastName  of the user. (body params) (required)
     * @apiParam {string} mobileNumber mobileNumber  of the user. (body params) (required)
     * @apiParam {string} countryCode countryCode  of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
                {
                "error": false,
                "message": "User created",
                "status": 200,
                "data": {
                    "__v": 0,
                    "userName": "jyotsana-user",
                    "_id": "5d90ca7cb8d92f1324804118",
                    "role": "normalUser",
                    "resetPasswordExpires": null,
                    "resetPasswordToken": "",
                    "createdOn": "2019-09-29T15:15:08.000Z",
                    "mobileNumber": "9568412369",
                    "countryCode": "91",
                    "email": "jyotsana.negi04@gmail.com",
                    "lastName": "negi",
                    "firstName": "jyotsana",
                    "userId": "d5lYEaUq"
                }
        }
}
    */
    // params: firstName, lastName, email, mobileNumber, countryCode, password, confirmPassword
    app.post(`${baseUrl}/signup`, userController.signUpFunction);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/login User login.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     * 
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
        {
            "error": false,
            "message": "Login Successful",
            "status": 200,
            "data": {
                "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6IkVfQy1RdVViIiwiaWF0IjoxNTY5NzcwMzY3OTI5LCJleHAiOjE1Njk4NTY3NjcsInN1YiI6ImF1dGhUb2tlbiIsImlzcyI6ImVkTXlQcmFjIiwiZGF0YSI6eyJ1c2VyTmFtZSI6Imp5b3RzYW5hLXVzZXIiLCJyb2xlIjoibm9ybWFsVXNlciIsInJlc2V0UGFzc3dvcmRFeHBpcmVzIjpudWxsLCJyZXNldFBhc3N3b3JkVG9rZW4iOiIiLCJtb2JpbGVOdW1iZXIiOiI5NTY4NDEyMzY5IiwiY291bnRyeUNvZGUiOiI5MSIsImVtYWlsIjoianlvdHNhbmEubmVnaTA0QGdtYWlsLmNvbSIsImxhc3ROYW1lIjoibmVnaSIsImZpcnN0TmFtZSI6Imp5b3RzYW5hIiwidXNlcklkIjoiZDVsWUVhVXEifX0.gRFLITywuhieX3TqezN4gTyzMZBCk9RqcI84lGReZlQ",
                "userDetails": {
                    "userName": "jyotsana-user",
                    "role": "normalUser",
                    "resetPasswordExpires": null,
                    "resetPasswordToken": "",
                    "mobileNumber": "9568412369",
                    "countryCode": "91",
                    "email": "jyotsana.negi04@gmail.com",
                    "lastName": "negi",
                    "firstName": "jyotsana",
                    "userId": "d5lYEaUq"
                }
            }
}
    */

    // params: email, password.
    app.post(`${baseUrl}/login`, userController.loginFunction);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/logout  logout .
     *
     * @apiParam {string} userId userId of the user. (auth headers) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Logged Out Successfully",
            "status": 200,
            "data": null

        }
    */

    // auth token params: userId.
    app.post(`${baseUrl}/logout`, auth.isAuthorized, userController.logout);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/recoverPassword  forgot password.
     *
     * @apiParam {string} email email of the user. 
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, data.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
    "error": false,
    "message": "reset token mail generation Successful",
    "status": 200,
    "data": {
        "_id": "5d90ca7cb8d92f1324804118",
        "password": "$2a$10$pZu0ndA3SNIzU9/MxG5u8O8j3lp0YywhdO3WhAxKcP.gzhpu/THhS",
        "userName": "jyotsana-user",
        "__v": 0,
        "role": "normalUser",
        "resetPasswordExpires": "2019-09-30T15:43:58.245Z",
        "resetPasswordToken": "5ccc6c0d50dcaa434f10ec49a3a99c0257360058",
        "createdOn": "2019-09-29T15:15:08.000Z",
        "mobileNumber": "9568412369",
        "countryCode": "91",
        "email": "jyotsana.negi04@gmail.com",
        "lastName": "negi",
        "firstName": "jyotsana",
        "userId": "d5lYEaUq"
    }
}
    */
    // params: email
    app.post(`${baseUrl}/recoverPassword`, userController.recoverPassword)

    /**
         * @apiGroup users
         * @apiVersion  1.0.0
         * @api {get} /api/v1/users/findForReset/:token  fetching user detail for password reset
         *
         * @apiParam {string} token token sent to the user in mail.
         * 
         *
         * @apiSuccess {object} myResponse shows error status, message, http status code, result.
         * 
         * @apiSuccessExample {object} Success-Response:
             {
        "error": false,
        "message": "User Details Found Successfully.",
        "status": 200,
        "data": {
            "userName": "jyotsana-user",
            "role": "normalUser",
            "createdOn": "2019-09-29T15:15:08.000Z",
            "mobileNumber": "9568412369",
            "countryCode": "91",
            "email": "jyotsana.negi04@gmail.com",
            "lastName": "negi",
            "firstName": "jyotsana",
            "userId": "d5lYEaUq"
        }
    }
         */

    // params token
    app.get(`${baseUrl}/findForReset/:token`, userController.findUserForPasswordReset)


    /**
         * @apiGroup users
         * @apiVersion  1.0.0
         * @api {post} /api/v1/users/setNewPassword  setting new password
         *
         * @apiParam {string} userId userId of the user.
         * @apiParam {string} newPassword newPassword of the user.
         * @apiParam {string} verifyPassword verifyPassword of the user. 
         *
         * @apiSuccess {object} myResponse shows error status, message, http status code, result.
         * 
         * @apiSuccessExample {object} Success-Response:
             {
        "error": false,
        "message": "update user password",
        "status": 200,
        "data": {
            "_id": "5d90ca7cb8d92f1324804118",
            "password": "$2a$10$J7gtwRvHpptWePksIgB4IOvgAucqpWfWl5ozyTeNoE/Q3JwSHtxKC",
            "userName": "jyotsana-user",
            "__v": 0,
            "role": "normalUser",
            "createdOn": "2019-09-29T15:15:08.000Z",
            "mobileNumber": "9568412369",
            "countryCode": "91",
            "email": "jyotsana.negi04@gmail.com",
            "lastName": "negi",
            "firstName": "jyotsana",
            "userId": "d5lYEaUq"
        }
    }
         */

    // params: userId, newPassword, verifyPassword
    app.post(`${baseUrl}/setNewPassword`, userController.setNewPassword)


    /**
         * @apiGroup users
         * @apiVersion  1.0.0
         * @api {get} /api/v1/users/allUsers Get all users
         *
         *@apiParam {string} authToken authToken of the admin. (auth headers) (required)
         * @apiSuccess {object} myResponse shows error status, message, http status code, result.
         * 
         * @apiSuccessExample {object} Success-Response:
             {
        "error": false,
        "message": "Users details found",
        "status": 200,
        "data": [
            {
                "password": "$2a$10$FUJz0BaJkVulqgPDxjzKU.V2wc39JmpS8lHKfizccZyySpp97L4Zi",
                "userName": "Bika-admin",
                "role": "admin",
                "createdOn": "2019-09-25T18:11:05.000Z",
                "mobileNumber": "9723694557",
                "countryCode": "91",
                "email": "ad4min@gmail.com",
                "lastName": "paul",
                "firstName": "Bika",
                "userId": "xC0vgS-"
            },
            {
                "password": "$2a$10$J7gtwRvHpptWePksIgB4IOvgAucqpWfWl5ozyTeNoE/Q3JwSHtxKC",
                "userName": "jyotsana-user",
                "role": "normalUser",
                "createdOn": "2019-09-29T15:15:08.000Z",
                "mobileNumber": "9568412369",
                "countryCode": "91",
                "email": "jyotsana@gmail.com",
                "lastName": "negi",
                "firstName": "jyotsana",
                "userId": "d5lYEaq"
            }
        ]
    }
         */
    app.get(`${baseUrl}/allUsers`, [auth.isAuthorized, auth.roleAdmin], userController.getAllUsers)

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {get} /api/v1/users/userdetail/:userId for getting single user detail 
     *
     * @apiParam {string} userId userId of the user unique Id (auth headers) (required)
     * 
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "User Details Found Successfully.",
            "status": 200,
            "data": {
                "userName": "jyotsana-user",
                "role": "normalUser",
                "createdOn": "2019-09-29T15:15:08.000Z",
                "mobileNumber": "9568412369",
                "countryCode": "91",
                "email": "jyotsana.negi04@gmail.com",
                "lastName": "negi",
                "firstName": "jyotsana",
                "userId": "d5lYEaUq"
            }
         }
     */

    // params userId
    app.get(`${baseUrl}/userdetail/:userId`, auth.isAuthorized, userController.getSingleUser)



}
