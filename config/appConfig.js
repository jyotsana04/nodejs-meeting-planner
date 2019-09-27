let appConfig = {};

appConfig.port = 3000;
appConfig.allowedCorsOrigin = "*";
appConfig.env = "dev";
appConfig.db = {
    uri: 'mongodb://127.0.0.1:27017/meetingPlannerDB'
  }
appConfig.apiVersion = '/api/v1';
appConfig.mailId = 'email4testing.04@gmail.com'
appConfig.mailPassword = 'mytestpassword'


module.exports = {
    port: appConfig.port,
    allowedCorsOrigin: appConfig.allowedCorsOrigin,
    environment: appConfig.env,
    db :appConfig.db,
    apiVersion : appConfig.apiVersion,
    mailId:appConfig.mailId,
    mailPassword:appConfig.mailPassword
};