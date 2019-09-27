const express = require('express');
const router = express.Router();
const userController = require('./../controllers/userController');
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')
const meetingController = require('./../controllers/meetingController')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/meeting`;

    
    app.post(`${baseUrl}/create/:userId`, [auth.isAuthorized, auth.roleAdmin], meetingController.createMeeting )
    app.put(`${baseUrl}/edit/:meetingId`, [auth.isAuthorized, auth.roleAdmin], meetingController.editMeeting )
    app.post(`${baseUrl}/delete/:meetingId`, [auth.isAuthorized, auth.roleAdmin], meetingController.deleteMeeting )
    app.get(`${baseUrl}/viewAllByUserId/:userId`, auth.isAuthorized, meetingController.getAllMeetingsForUser )
    app.get(`${baseUrl}/viewSingleMeeting/:meetingId`, auth.isAuthorized, meetingController.getSingleMeeting )

    

}
