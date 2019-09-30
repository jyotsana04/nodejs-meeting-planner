const mongoose = require('mongoose');
const shortid = require('shortid');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const check = require('./../libs/checkLib')
const time = require('./../libs/timeLib')
const events = require('events')
const appConfig = require('./../../config/appConfig')
const emailLib = require('../libs/emailLib')
const eventEmitter = new events.EventEmitter();

/* Models */
const UserModel = mongoose.model('User')
const AuthModel = mongoose.model('Auth')
const MeetingModel = mongoose.model('Meeting')

let createMeeting = (req, res) => {

    let createNewMeeting = () => {
        return new Promise((resolve, reject) => {
            if (check.isEmpty(req.params.userId)) {
                logger.error("userId not found for whom meeting is to be created", "createmeeting:meetingcontroller", 4)
                let apiResponse = response.generate(true, 'no userId found', 403, null)
                reject(apiResponse)

            } else if (check.isEmpty(req.body.title) || check.isEmpty(req.body.location) || check.isEmpty(req.body.description) ||
                check.isEmpty(req.body.start) || check.isEmpty(req.body.end)) {
                logger.error("paramters empty", "createmeeting:meetingcontroller", 5)
                let apiResponse = response.generate(true, 'required parameters are missing', 403, null)
                reject(apiResponse)
            } else {
                let meetingId = shortid.generate()
                let userId = req.params.userId

                let newMeeting = new MeetingModel({
                    meetingId: meetingId,
                    title: req.body.title,
                    description: req.body.description,
                    start: req.body.start,
                    end: req.body.end,
                    location: req.body.location,
                    forUserId: userId,
                }) // end new meeting model

                newMeeting.save((err, result) => {
                    if (err) {
                        logger.error(`Error Occured : ${err}`, 'Database', 10)
                        let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                        reject(apiResponse)
                    } else {
                        console.log('Success in meeting creation')
                        resolve(result)
                        setTimeout(() => {
                            eventEmitter.emit('notifyCreate', result)
                        }, 2000)
                    }
                }) // end new meeting save
            }
        }) // end new meeting promise
    } // end createnewmeeting function

    // making promise call.
    createNewMeeting()
        .then((result) => {
            let apiResponse = response.generate(false, 'Meeting Created successfully', 200, result)
            res.send(apiResponse)
        })
        .catch((error) => {
            console.log(error)
            res.send(error)
        })
}

let editMeeting = (req, res) => {
    if (check.isEmpty(req.params.meetingId)) {
        logger.error("meeting Id not found", 'editmeeting controller', 4)
        let apiResponse = response.generate(true, 'meetingId is missing', 403, null)
        res.send(apiResponse)
    } else {
        let options = req.body;
        MeetingModel.update({ 'meetingId': req.params.meetingId }, options, { multi: true }).exec((err, result) => {
            if (err) {
                logger.error(`Error Occured : ${err}`, 'Database', 10)
                let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.error("meeting not found", "editmeeting:meetingcontroller()", 5)
                let apiResponse = response.generate(true, 'meeting Not Found', 404, null)
                res.send(apiResponse)
            } else {
                console.log('meeting Edited Successfully')
                let apiResponse = response.generate(false, 'meeting Edited Successfully.', 200, result)
                res.send(apiResponse)
                updatedMeetingId = req.params.meetingId

                setTimeout(() => {
                    eventEmitter.emit('notifyEdit', updatedMeetingId)
                }, 2000)
            }
        })
    }
} //end edit meeting

//get single meeting by meeting Id 
let getSingleMeeting = (req, res) => {
    if (check.isEmpty(req.params.meetingId)) {
        logger.error("meeting id not provided", "getsinglemeeting:meetingcontroller", 6)
        let apiResponse = response.generate(true, 'meetingId is missing', 403, null)
        res.send(apiResponse)
    } else {
        MeetingModel.findOne({ 'meetingId': req.params.meetingId }, (err, result) => {
            if (err) {
                console.log('Error Occured.')
                logger.error(`Error Occured : ${err}`, 'Database', 10)
                let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {

                console.log('meeting Not Found.')
                let apiResponse = response.generate(true, 'meeting Not Found', 404, null)
                res.send(apiResponse)
            } else {
                logger.info("meeting found successfully", "meetingController:getsinglemeeting()", 5)
                let apiResponse = response.generate(false, 'meeting Details Found Successfully.', 200, result)
                res.send(apiResponse)
            }
        }).select('-__v -_id')
    }
}// end get single meeting

//get all meetings by userId 
let getAllMeetingsForUser = (req, res) => {
    if (check.isEmpty(req.params.userId)) {
        console.log('user Id should be there')
        let apiResponse = response.generate(true, 'userId is missing', 403, null)
        res.send(apiResponse)
    } else {
        MeetingModel.find({ 'forUserId': req.params.userId }, (err, result) => {
            if (err) {
                logger.error(`Error Occured : ${err}`, 'Database', 10)
                let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.error("meeting not found", "getallmeetings:meetingcontroller", 6)
                let apiResponse = response.generate(true, 'meeting Not Found', 404, null)
                res.send(apiResponse)
            } else {
                logger.info("meeting found successfully", "meetingController:getAllMeetingsForUser()", 5)
                let apiResponse = response.generate(false, 'meeting Details Found Successfully.', 200, result)
                res.send(apiResponse)
            }
        }).select('-__v -_id')
    }

}// end get single meeting

//delete meeting
let deleteMeeting = (req, res) => {

    let userIdForMeetDelete;
    if (check.isEmpty(req.params.meetingId)) {
        console.log('meetingId should be passed')
        let apiResponse = response.generate(true, 'meetingId is missing', 403, null)
        res.send(apiResponse)
    } else {
        // storing userId before deletion cause then meeting Id will not be found
        MeetingModel.findOne({ meetingId: req.params.meetingId }).exec((err, meetingDetails) => {
            if (err) {
                logger.error(`Error Occured : ${err}`, 'Database', 10)
            } else if (check.isEmpty(meetingDetails)) {
                console.log('meetingDetails is null')
            } else {
                userIdForMeetDelete = meetingDetails.forUserId
                return userIdForMeetDelete
            }
        })

        MeetingModel.remove({ 'meetingId': req.params.meetingId }, (err, result) => {
            if (err) {
                console.log('Error Occured.')
                logger.error(`Error Occured : ${err}`, 'Database', 10)
                let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                res.send(apiResponse)
            } else if (check.isEmpty(result)) {
                console.log('meeting Not Found.')
                let apiResponse = response.generate(true, 'meeting Not Found.', 404, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'meeting Deleted Successfully', 200, result)
                res.send(apiResponse)

                setTimeout(() => {
                    eventEmitter.emit('notifyDelete', userIdForMeetDelete)
                }, 2000)
            }
        })
    }


}

//listening to events

// on creation of a meeting
eventEmitter.on('notifyCreate', function (meetingdetails) {

    UserModel.findOne({ userId: meetingdetails.forUserId }).exec((err, result) => {
        if (err) {
            logger.error(`Error Occured : ${err}`, 'Database', 10)
        } else if (check.isEmpty(result)) {
            console.log('user Not Found.')
        } else {
            console.log('mail sent to ' + result.email)
            var mailOptions = {
                from: appConfig.mailId,
                to: result.email,
                subject: 'New Meeting Created',
                text: `Hello ${result.firstName} ${result.lastName}, a new meeting is assigned to you. Please check the website for 
                        further details`
            }
            emailLib.sendEmail(mailOptions)
        }
    })
})// end of notify create

//notify edit
eventEmitter.on('notifyEdit', function (editMeetingId) {

    MeetingModel.findOne({ meetingId: editMeetingId }).exec((err, meetingDetails) => {
        if (err) {
            logger.error(`Error Occured : ${err}`, 'Database', 10)
        } else if (check.isEmpty(meetingDetails)) {
            console.log('meetingDetails is null')
        } else {
            UserModel.findOne({ userId: meetingDetails.forUserId }).exec((err, result) => {
                if (err) {
                    logger.error(`Error Occured : ${err}`, 'Database', 10)
                } else if (check.isEmpty(result)) {
                    console.log('user Not Found.')
                } else {
                    console.log('mail sent to ' + result.email)
                    var mailOptions = {
                        from: appConfig.mailId,
                        to: result.email,
                        subject: 'New Meeting Created',
                        text: `Hello ${result.firstName} ${result.lastName}, A meeting asigned to you Titled ${meetingDetails.title}
                            is Updated Please check the website for further details`
                    }
                    emailLib.sendEmail(mailOptions)
                }
            })
        }
    })

})// end of notify edit

//notify delete
eventEmitter.on('notifyDelete', function (deletedMeetingUserId) {

    UserModel.findOne({ userId: deletedMeetingUserId }).exec((err, result) => {
        if (err) {
            logger.error(`Error Occured : ${err}`, 'Database', 10)
        } else if (check.isEmpty(result)) {
            console.log('user Not Found.')
        } else {
            console.log('mail sent to ' + result.email)
            var mailOptions = {
                from: appConfig.mailId,
                to: result.email,
                subject: 'Meeting Deleted',
                text: `Hello ${result.firstName} ${result.lastName}, A meeting asigned to you is Cancelled/Deleted.`
            }
            emailLib.sendEmail(mailOptions)
        }
    })
})
// end of notify delete

module.exports = {
    createMeeting: createMeeting,
    editMeeting: editMeeting,
    getSingleMeeting: getSingleMeeting,
    getAllMeetingsForUser: getAllMeetingsForUser,
    deleteMeeting: deleteMeeting
}