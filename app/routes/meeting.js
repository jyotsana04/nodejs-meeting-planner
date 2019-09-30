const express = require('express');
const router = express.Router();
const userController = require('./../controllers/userController');
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')
const meetingController = require('./../controllers/meetingController')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/meeting`;

     // defining routes.

    /**
     * @apiGroup meeting
     * @apiVersion  1.0.0
     * @api {post} /api/v1/meeting/create/:userId Add a meeting.
     * @apiHeader (Authorization Headers) {String} authToken authToken of admin
     * @apiParam {string} userId UserId of the user to whom meeting is associated. (body/query params) (required)
     * @apiParam {string} title title of the meeting. (body params) (required)
     * @apiParam {string} description description of the meeting (body params) (required)
     * @apiParam {string} location location of the meeting (body params) (required)
     * @apiParam {string} start start  date and time meeting will start (body params) (required)
     * @apiParam {string} end end date and time meeting will end (body params) (required)
     
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
                {
                    "error": false,
                    "message": "Meeting Created successfully",
                    "status": 200,
                    "data": {
                        "__v": 0,
                        "_id": "5d90ea7a8023e13d00d30b45",
                        "forUserId": "d5lYEaUq",
                        "createdBy": "",
                        "description": "this is  a dummy meeting",
                        "location": "office",
                        "end": "2019-09-29T08:49:10.000Z",
                        "start": "2019-09-29T08:49:10.000Z",
                        "title": "meeting 1",
                        "meetingId": "qOiUC5CT"
                    }
                }
    */
    app.post(`${baseUrl}/create/:userId`, [auth.isAuthorized, auth.roleAdmin], meetingController.createMeeting )
    
    /**
     * @apiGroup meeting
     * @apiVersion  1.0.0
     * @api {put} /api/v1/meeting/edit/:meetingId Edit a meeting.
     * @apiHeader (Authorization Headers) {String} authToken authToken of Admin
     * @apiParam {string} meetingId meetingId of the meeting which is to be edited. (body/query params) (required)
     * @apiParam {string} options options any parameter which is to be modified (body params) 
     * 
     
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
                {
                    "error": false,
                    "message": "meeting Edited Successfully.",
                    "status": 200,
                    "data": {
                        "n": 1,
                        "nModified": 1,
                        "ok": 1
                    }
                }
    */
    app.put(`${baseUrl}/edit/:meetingId`, [auth.isAuthorized, auth.roleAdmin], meetingController.editMeeting )
    
    /**
     * @apiGroup meeting
     * @apiVersion  1.0.0
     * @api {post} /api/v1/meeting/delete/:meetingId Delete a meeting.
     * @apiHeader (Authorization Headers) {String} authToken authToken of Admin
     * @apiParam {string} meetingId meetingId of the meeting which is to be deleted. (body/query params) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
                {
                    "error": false,
                    "message": "meeting Deleted Successfully",
                    "status": 200,
                    "data": {
                        "n": 1,
                        "ok": 1
                    }
                }
    */
    app.post(`${baseUrl}/delete/:meetingId`, [auth.isAuthorized, auth.roleAdmin], meetingController.deleteMeeting )
    
    /**
     * @apiGroup meeting
     * @apiVersion  1.0.0
     * @api {get} /api/v1/meeting/viewAllByUserId/:userId view all meeting.
     * @apiHeader (Authorization Headers) {String} authToken authToken token of user
     * @apiParam {string} userId userId of user whose meetings are to be fetched (body/route params) (required)
     *      
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
                {
                    "error": false,
                    "message": "meeting Details Found Successfully.",
                    "status": 200,
                    "data": [
                        {
                            "forUserId": "d5lYEaUq",
                            "createdBy": "",
                            "description": "this is  a dummy meeting",
                            "location": "office",
                            "end": "2019-09-29T08:49:10.000Z",
                            "start": "2019-09-29T08:49:10.000Z",
                            "title": "meeting 1",
                            "meetingId": "qOiUC5CT"
                        }
                    ]
                }
    */
    app.get(`${baseUrl}/viewAllByUserId/:userId`, auth.isAuthorized, meetingController.getAllMeetingsForUser )
    
    /**
     * @apiGroup meeting
     * @apiVersion  1.0.0
     * @api {get} /api/v1/viewSingleMeeting/:meetingId view single meeting.
     * @apiHeader (Authorization Headers) {String} authToken authToken token of user
     * @apiParam {string} meetingId meetingId of meeting whose detail is to be fetched (body/route params) (required)
     *      
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
                {
                    "error": false,
                    "message": "meeting Details Found Successfully.",
                    "status": 200,
                    "data": {
                        "forUserId": "d5lYEaUq",
                        "createdBy": "",
                        "description": "this is  a dummy meeting edited",
                        "location": "office",
                        "end": "2019-09-29T08:49:10.000Z",
                        "start": "2019-09-29T08:49:10.000Z",
                        "title": "meeting 1",
                        "meetingId": "qOiUC5CT"
                    }
                }
    */
    app.get(`${baseUrl}/viewSingleMeeting/:meetingId`, auth.isAuthorized, meetingController.getSingleMeeting )
    

}
