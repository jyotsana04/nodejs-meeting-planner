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
     * @api {post} /api/v1/users/signup api for Signing in of user.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     * @apiParam {string} confirm password password of the user. (body params) (required)
     * @apiParam {string} firstName firstName  of the user. (body params) (required)
     * @apiParam {string} lastName lastName  of the user. (body params) (required)
     * @apiParam {string} mobileNumber mobileNumber  of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Login Successful",
            "status": 200,
            "data": {
                "authToken": "eyJhbGciOiJIUertyuiopojhgfdwertyuVCJ9.MCwiZXhwIjoxNTIwNDI29tIiwibGFzdE5hbWUiE4In19.hAR744xIY9K53JWm1rQ2mc",
                "userDetails": {
                "mobileNumber": 2234435524,
                "email": "someone@mail.com",
                "lastName": "Sengar",
                "firstName": "Rishabh",
                "userId": "-E9zxTYA8"
            }

        }
    */
    // params: firstName, lastName, email, mobileNumber, password, confirmPassword
    app.post(`${baseUrl}/signup`, userController.signUpFunction);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/login api for user login.
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
            "message": "User created",
            "status": 200,
            "data": {
                "__v": 0,
                "_id": "5d7e6ef12517bc2190bc89d4",
                "resetPasswordToken": "",
                "createdOn": "2019-09-15T17:03:45.000Z",
                "mobileNumber": 0,
                "email": "someone@somemail.com",
                "lastName": "somename",
                "firstName": "something",
                "userId": "YW1hJ7o"
            }
        }
    */

    // params: email, password.
    app.post(`${baseUrl}/login`, userController.loginFunction);

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/logout to logout user.
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
     * @api {post} /api/v1/users/recoverPassword for forgot password option.
     *
     * @apiParam {string} email email of the user. 
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "reset token mail generation Successful",
            "status": 200,
            "data": {
                "error": false,
                "message": "mail sent  Successfully.",
                "status": 200
            }

         }
    */
    // params: email
    app.post(`${baseUrl}/recoverPassword`, userController.recoverPassword )


/**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/setNewPassword for setting the new password
     *
     * @apiParam {string} userId userId of the user.
     * @apiParam {string} newPassword  of the user.
     * @apiParam {string} verifyPassword of the user. 
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "update user password",
            "status": 200,
            "data": {
                "_id": "5d7a8baad45f172580a3525c",
                "password": "$2a$10$iQrhDD6w2tT3n4s8l6Z4A.6JGeSXMOK4Q/aBzUvcQ9SLA8e1Nopmq",
                "__v": 0,
                "createdOn": "2019-09-12T18:17:14.000Z",
                "mobileNumber": 9756321485,
                "email": "someone@gmail.com",
                "lastName": "mylastname",
                "firstName": "myfirstname",
                "userId": "uMLz9W9"
            }

         }
     */
   
    // params: userId, newPassword, verifyPassword
    app.post(`${baseUrl}/setNewPassword`, userController.setNewPassword )

    

    app.get(`${baseUrl}/allUsers`, [auth.isAuthorized, auth.roleAdmin], userController.getAllUsers)

    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {get} /api/v1/users/userdetail/:userId for getting single user detail 
     *
     * @apiParam {string} userId userId of the user unique Id
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
                "createdOn": "2019-09-12T18:17:14.000Z",
                "mobileNumber": 9756321485,
                "email": "jyotsana.negi04@gmail.com",
                "lastName": "negi",
                "firstName": "jyotsana",
                "userId": "uMLz7W9"
            }

         }
     */
   
    // params userId
    app.get(`${baseUrl}/userdetail/:userId`, userController.getSingleUser)

/**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {get} /api/v1/users/findForReset/:token for fetching user detail whose password has to be reset
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
                "createdOn": "2019-09-12T18:17:14.000Z",
                "mobileNumber": 9756321485,
                "email": "someone@gmail.com",
                "lastName": "xyz",
                "firstName": "xyz",
                "userId": "uMLz7ud9"
            }

         }
     */
   
    // params token
    app.get(`${baseUrl}/findForReset/:token`, userController.findUserForPasswordReset)
    

}
