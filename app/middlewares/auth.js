const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const request = require("request")
const Auth = mongoose.model('Auth')
const UserModel = mongoose.model('User')
const logger = require('./../libs/loggerLib')
const responseLib = require('./../libs/responseLib')
const token = require('./../libs/tokenLib')
const check = require('./../libs/checkLib')

let isAuthorized = (req, res, next) => {
  

  if (req.params.authToken || req.query.authToken || req.body.authToken || req.header('authToken')) {
    Auth.findOne({authToken: req.header('authToken') || req.params.authToken || req.body.authToken || req.query.authToken}, (err, authDetails) => {
      if (err) {
        console.log(err)
        logger.error(err.message, 'AuthorizationMiddleware', 10)
        let apiResponse = responseLib.generate(true, 'Failed To Authorized', 500, null)
        res.send(apiResponse)
      } else if (check.isEmpty(authDetails)) {
        logger.error('No AuthorizationKey Is Present', 'AuthorizationMiddleware', 10)
        let apiResponse = responseLib.generate(true, 'Invalid Or Expired AuthorizationKey', 404, null)
        res.send(apiResponse)
      } else {
        token.verifyToken(authDetails.authToken,authDetails.tokenSecret,(err,decoded)=>{

            if(err){
                logger.error(err.message, 'Authorization Middleware', 10)
                let apiResponse = responseLib.generate(true, 'Failed To Authorized', 500, null)
                res.send(apiResponse)
            }
            else{
                
                req.user = {userId: decoded.data.userId, role: decoded.data.role}
                next()
            }


        });// end verify token
       
      }
    })
  } else {
    logger.error('AuthorizationToken Missing', 'AuthorizationMiddleware', 5)
    let apiResponse = responseLib.generate(true, 'AuthorizationToken Is Missing In Request', 400, null)
    res.send(apiResponse)
  }
}
/*
let roleAdmin = (req, res, next)=>{
  console.log(req.user)
  UserModel.findOne({userId : req.user}).exec((err, result)=>{
    console.log("result is "+ result)
    console.log(result)
    if(err){
      logger.error(err.message, 'authjs:roleAdmin', 8)
      let apiResponse = responseLib.generate(true, 'failed to authorise user', 401, null)
      res.send(apiResponse)
    }else{
      console.log(result)
      if(result.role == 'admin'){
        console.log("user is admin")
        next()
      }else{
        let apiResponse = responseLib.generate(true, 'you are not authorised to use this route', 401, null)
        res.send(apiResponse)
      }
    }
  })
  next()

}
*/

let roleAdmin = (req,res,next)=>{
  console.log(req.user)
  if(req.user.role=== "admin"){
    next()
  }else{
    let apiResponse = responseLib.generate(true, 'you are not authorised to use this route', 401, null)
    res.send(apiResponse)
  }
}

module.exports = {
  isAuthorized: isAuthorized,
  roleAdmin: roleAdmin
}
