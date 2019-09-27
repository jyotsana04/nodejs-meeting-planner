const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib')
const check = require('./../libs/checkLib')
const passwordLib = require('../libs/generatePasswordLib')
const token = require('../libs/tokenLib')
const emailLib =  require('../libs/emailLib')
const crypto = require('crypto')
var nodemailer = require('nodemailer')
const appConfig = require('./../../config/appConfig')

const events = require('events')
const eventEmitter = new events.EventEmitter();


/* Models */
const AuthModel = mongoose.model('Auth')
const UserModel = mongoose.model('User')

//signup function
let signUpFunction = (req, res) => {

    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                if (!validateInput.Email(req.body.email)) {
                    let apiResponse = response.generate(true, 'Email Does not meet the requirement', 400, null)
                    reject(apiResponse)
                } else if (check.isEmpty(req.body.password)) {
                    let apiResponse = response.generate(true, '"password" parameter is missing"', 400, null)
                    reject(apiResponse)
                }else if(req.body.password != req.body.confirmPassword){
                    let apiResponse = response.generate(true, '"password" and "confirm password" fields do not match"', 400, null)
                    reject(apiResponse)
                }
                 else {
                    resolve(req)
                }
            } else {
                logger.error('Field Missing During User Creation', 'userController: createUser()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
                reject(apiResponse)
            }
        })
    }// end validate user input

    let createUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ email: req.body.email })
                .exec((err, retrievedUserDetails) => {
                    console.log(retrievedUserDetails)
                    if (err) {
                        logger.error(err.message, 'userController: createUser', 10)
                        let apiResponse = response.generate(true, 'Failed To Create User', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(retrievedUserDetails)) {
                        console.log(req.body)
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName || '',
                            email: req.body.email.toLowerCase(),
                            mobileNumber: req.body.mobileNumber,
                            role:req.body.role,
                            countryCode: req.body.countryCode,
                            password: passwordLib.hashpassword(req.body.password),
                            userName: require.body.firstName+"-user",
                            createdOn: time.now()
                        })
                        newUser.save((err, newUser) => {
                            if (err) {
                                console.log(err)
                                logger.error(err.message, 'userController: createUser', 10)
                                let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                                reject(apiResponse)
                            } else {
                                let newUserObj = newUser.toObject();
                                resolve(newUserObj)

                                setTimeout(() => {

                                    eventEmitter.emit('welcomeEmail', newUserObj);
                                    
                                }, 2000);
                                
                            }
                        })
                    } else {
                        logger.error('User Cannot Be Created.User Already Present', 'userController: createUser', 4)
                        let apiResponse = response.generate(true, 'User Already Present With this Email', 403, null)
                        reject(apiResponse)
                    }
                })
        })
    }// end create user function


    validateUserInput(req, res)
        .then(createUser)
        .then((resolve) => {
            delete resolve.password
            let apiResponse = response.generate(false, 'User created', 200, resolve)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })


}// end user signup function 

//listening to event for welcome email
eventEmitter.on('welcomeEmail', function(userdetails){
    fullName = userdetails.fullName,
    firstName = userdetails.firstName,
    lastName = userdetails.lastName,
    userEmail= userdetails.email
    console.log('welcome email to fullname '+fullName + firstName + lastName)
    var mailOptions = {

        from: appConfig.mailId,
        to : userEmail,
        subject: 'Welcome to MyWebsite',
        text : `Hello ${firstName} ${lastName}, Thank you for signing up to my app.`
    }

    emailLib.sendEmail(mailOptions)
    
})// end of welcome email

// start of login function 
let loginFunction = (req, res) => {

    let findUser = () => {
        console.log("findUser");
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                console.log("req body email is there");
                console.log(req.body);
                UserModel.findOne({ email: req.body.email}, (err, userDetails) => {
                    if (err) {
                        console.log(err)
                        logger.error('Failed To Retrieve User Data', 'userController: findUser()', 10)
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(userDetails)) {
                        logger.error('No User Found', 'userController: findUser()', 7)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        reject(apiResponse)
                    } else {
                        logger.info('User Found', 'userController: findUser()', 10)
                        resolve(userDetails)
                    }
                });
               
            } else {
                let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
                reject(apiResponse)
            }
        })
    }
    let validatePassword = (retrievedUserDetails) => {
        console.log("validatePassword");
        return new Promise((resolve, reject) => {
            passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {
                if (err) {
                    console.log(err)
                    logger.error(err.message, 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Login Failed', 500, null)
                    reject(apiResponse)
                } else if (isMatch) {
                    let retrievedUserDetailsObj = retrievedUserDetails.toObject()
                    delete retrievedUserDetailsObj.password
                    delete retrievedUserDetailsObj._id
                    delete retrievedUserDetailsObj.__v
                    delete retrievedUserDetailsObj.createdOn
                    delete retrievedUserDetailsObj.modifiedOn
                    resolve(retrievedUserDetailsObj)
                } else {
                    logger.info('Login Failed Due To Invalid Password', 'userController: validatePassword()', 10)
                    let apiResponse = response.generate(true, 'Wrong Password Login Failed', 400, null)
                    reject(apiResponse)
                }
            })
        })
    }

    let generateToken = (userDetails) => {
        console.log("generate token");
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    console.log(err)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else {
                    tokenDetails.userId = userDetails.userId
                    tokenDetails.userDetails = userDetails
                    resolve(tokenDetails)
                }
            })
        })
    }

    let saveToken = (tokenDetails) => {
        console.log("save token");
        return new Promise((resolve, reject) => {
            AuthModel.findOne({ userId: tokenDetails.userId }, (err, retrievedTokenDetails) => {
                if (err) {
                    console.log(err.message, 'userController: saveToken', 10)
                    let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(retrievedTokenDetails)) {
                    let newAuthToken = new AuthModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGenerationTime: time.now()
                    })
                    newAuthToken.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                } else {
                    retrievedTokenDetails.authToken = tokenDetails.token
                    retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret
                    retrievedTokenDetails.tokenGenerationTime = time.now()
                    retrievedTokenDetails.save((err, newTokenDetails) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.message, 'userController: saveToken', 10)
                            let apiResponse = response.generate(true, 'Failed To Generate Token', 500, null)
                            reject(apiResponse)
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody)
                        }
                    })
                }
            })
        })
    }
   

    findUser(req,res)
        .then(validatePassword)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'Login Successful', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })

}
// end of the login function 


/**
 * function to logout user.
 * auth params: userId.
 */
let logout = (req, res) => {
    AuthModel.findOneAndRemove({userId: req.user.userId}, (err, result) => {
      if (err) {
          console.log(err)
          logger.error(err.message, 'user Controller: logout', 10)
          let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
          res.send(apiResponse)
      } else if (check.isEmpty(result)) {
          let apiResponse = response.generate(true, 'Already Logged Out or Invalid UserId', 404, null)
          res.send(apiResponse)
      } else {
          let apiResponse = response.generate(false, 'Logged Out Successfully', 200, null)
          res.send(apiResponse)
      }
    })
} // end of the logout function.

//starting of forgot password 
let recoverPassword = (req,res) => {
    let findUserEmail = () => {
        console.log("findUserEmail");
        return new Promise((resolve, reject) => {
            if (req.body.email) {
                console.log("req body email is there");
                //console.log(req.body);
                UserModel.findOne({ email: req.body.email}, (err, userDetails) => {
                    if (err) {
                        console.log(err)
                        logger.error('Failed To Retrieve User Data', 'userController: findUserEmail()', 10)
                        let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(userDetails)) {
                        logger.error('No User Found', 'userController: findUserEmail()', 7)
                        let apiResponse = response.generate(true, 'No User Details Found', 404, null)
                        reject(apiResponse)
                    } else {
                        logger.info('User Found', 'userController: findUserEmail()', 10)
                        userDetails.resetPasswordToken = ''
                        userDetails.resetPasswordExpires = ''
                        resolve(userDetails)
                        console.log('after resolve userdetails in finduser' + userDetails)
                    }
                });
               
            } else {
                let apiResponse = response.generate(true, '"email" parameter is missing', 400, null)
                reject(apiResponse)
            }
        })
    }

    let createToken = (_userDetails)=>{
        return new Promise((resolve, reject)=>{
            console.log('inside create token _userdetails1 are '+ _userDetails)
            
            crypto.randomBytes(20, function(err, buffer) {
                if(err){
                    console.log('error in generating token')
                    reject(err)
                }else{
                    const token = buffer.toString('hex');
                    console.log('token generated using crypto is ' + token)
                    console.log('inside create token _userdetails2 are '+ _userDetails)  

                    tokenDetails = {
                        token:token,
                        tokenUserId:_userDetails.userId,
                        tokenUserEmail:_userDetails.email
                    }
                    resolve(tokenDetails)

                    console.log('token details are '+ tokenDetails.token , tokenDetails.tokenUserId, tokenDetails.tokenUserEmail)
                }
            
            })
            
        })

    }

    let updateToken = (tokenDetails)=>{

        console.log('inside update token')
        
        return new Promise((resolve, reject)=>{
            console.log('id in update' + tokenDetails.tokenUserId)
            console.log('token inside update token' + tokenDetails.token)
            UserModel.findOneAndUpdate({ 'userId': tokenDetails.tokenUserId}, {resetPasswordToken:tokenDetails.token, resetPasswordExpires: Date.now()+ 86400000}, {new:true}).exec((err, result) => {
                //console.log('1' + resetPasswordToken)
                //console.log('2' + resetPasswordExpires)
                if (err) {
    
                    console.log('Error Occured.')
                    logger.error(`Error Occured : ${err}`, 'Database', 10)
                    let apiResponse = response.generate(true, 'Error Occured while updating token', 500, null)
                    reject(apiResponse)
                } else if (check.isEmpty(result)) {
    
                    console.log('user Not Found in update token.')
                    let apiResponse = response.generate(true, 'user Not Found', 500, null)
                    reject(apiResponse)
                } else {
                    console.log('user reset token updated Successfully')
                   let apiResponse = response.generate(false, 'token updated in user  Successfully.', 200, result)
                   // resolve(apiResponse)
                    console.log(apiResponse)
                    resolve(result)
                    console.log('result of updation is '+ result)
                    //resolve(tokenDetails)
                    console.log('last in the update' + tokenDetails)
                }
            })
        })


    }

    let sendTokenMail = (result)=>{
        return new Promise((resolve, reject)=>{

            console.log('inside send mail' + result)
            
            var mailOptions = {
                from: 'email4testing.04@gmail.com',
                to : result.email,
                subject : 'sending token to reset password',
                text: `Hi! ${result.firstName} ${result.lastName}, Your Request to reset password has
                been received. Kindly click on the below link to reset your password.
                 
                Click <a href="http://localhost:3000/users/reset/${result.resetPasswordToken}"> here</a>`
            }
            
            emailLib.sendEmail(mailOptions)
                        
        })
        

    }

    findUserEmail(req,res)
        .then(createToken)
        .then(updateToken)
        .then(sendTokenMail)
        .then((resolve) => {
            let apiResponse = response.generate(false, 'reset token mail generation Successful', 200, resolve)
            res.status(200)
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log("errorhandler");
            console.log(err);
            res.status(err.status)
            res.send(err)
        })
        
} // end of forgot password



//reset code query version start

let findUserForPasswordReset = (req, res)=>{
    if(check.isEmpty(req.params.token)){

        console.log('token should be there')
        console.log('calling api for token'+ token)
        let apiResponse = response.generate(true, 'reset token is missing', 403, null)
        res.send(apiResponse)
    }else{
        UserModel.findOne({'resetPasswordToken': req.params.token}, (err, result)=>{
            if(err){
                console.log('Error Occured.')
                logger.error(`Error Occured : ${err}`, 'Database', 10)
                let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                res.send(apiResponse)
            }else if (check.isEmpty(result)) {

                console.log('User Not Found.')
                let apiResponse = response.generate(true, 'User Not Found', 404, null)
                res.send(apiResponse)
            } else {
                logger.info("User found successfully","userController:getuserforreset()",5)
                let apiResponse = response.generate(false, 'User Details Found Successfully.', 200, result)
                res.send(apiResponse)
            }
        }).select('-__v -_id -resetPasswordToken -resetPasswordExpires -password')
    }
    
}

let setNewPassword = (req, res)=>{

    UserModel.findOne({'userId': req.body.userId})
        .exec((err, userdetails)=>{
            if(err){
                console.log('error while fetching user details inside setnewpassword '+ err)
                let apiResponse = response.generate(true, 'invalid or userId', 500, null)
                res.send(apiResponse)
            }else {
                console.log('from setnewpass userdetails are ' + userdetails)
                if(req.body.newPassword === req.body.verifyPassword){
                    userdetails.password = passwordLib.hashpassword(req.body.newPassword)
                    userdetails.resetPasswordToken = undefined
                    userdetails.resetPasswordExpires = undefined
                    userdetails.save(function(err, result){
                        if(err){
                            console.log('error in saving')
                            let apiResponse = response.generate(true, 'error while updating new password', 500, null)
                            res.send(apiResponse)
                        }
                        else{
                            console.log('new pass saved')
                            let apiResponse = response.generate(false, 'update user password', 200, result)
                            res.send(apiResponse)
                        }
                    })
                }else {
                    console.log('new passwords do not match')
                    let apiResponse = response.generate(true, 'please enter same password in both', 500, null)
                    res.send(apiResponse)
                }
            }

        })

}

// end of reset code query version


let getAllUsers = (req, res)=>{

    UserModel.find()
        .select('-__v -_id -resetPasswordToken -resetPasswordExpires')
        .exec((err, result)=>{
            if(err){
                console.log(error)
                let apiResponse = response.generate(true, 'Failed to retrieve user details', 404, null)
                res.send(apiResponse)
            } else if(check.isEmpty(result)){
                console.log('no user in Database found')
                let apiResponse = response.generate(true, 'No user found in Database record', 500 , null)
                res.send(apiResponse)
            } else{
                console.log('users found')
                let apiResponse = response.generate(false, 'Users details found', 200 , result)
                res.send(apiResponse)
            }
        })

}

//get single user
let getSingleUser = (req, res)=>{
    if(check.isEmpty(req.params.userId)){

        console.log('user Id should be there')
        console.log('calling api for user id'+ userId)
        let apiResponse = response.generate(true, 'userId is missing', 403, null)
        res.send(apiResponse)
    }else{
        UserModel.findOne({'userId': req.params.userId}, (err, result)=>{
            if(err){
                console.log('Error Occured.')
                logger.error(`Error Occured : ${err}`, 'Database', 10)
                let apiResponse = response.generate(true, 'Error Occured.', 500, null)
                res.send(apiResponse)
            }else if (check.isEmpty(result)) {

                console.log('User Not Found.')
                let apiResponse = response.generate(true, 'User Not Found', 404, null)
                res.send(apiResponse)
            } else {
                logger.info("User found successfully","userController:getsingleuser()",5)
                let apiResponse = response.generate(false, 'User Details Found Successfully.', 200, result)
                res.send(apiResponse)
            }
        }).select('-__v -_id -resetPasswordToken -resetPasswordExpires -password')
    }
    
}// end get single user

module.exports = {

    signUpFunction: signUpFunction,
    loginFunction: loginFunction,
    logout: logout,
    
    recoverPassword:recoverPassword,
    setNewPassword:setNewPassword,
    getAllUsers:getAllUsers,
    getSingleUser:getSingleUser,
    findUserForPasswordReset:findUserForPasswordReset

}// end exports