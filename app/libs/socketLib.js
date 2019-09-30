const socketio = require('socket.io')
const mongoose = require('mongoose')
const shortid = require('shortid')
const logger = require('./loggerLib')
const events = require('events')
const eventEmitter = new events.EventEmitter()
const tokenLib = require('./tokenLib')
const response = require('./responseLib')
const check = require('./checkLib')



let setServer = (server) => {

    let allOnlineUsers = []
    let io = socketio.listen(server)
    let myIo = io.of('')

    myIo.on('connection', (socket) => { //handling the events.. it is main event handler takes connection as event, socket as data and contains all small events associated with it
        console.log('on connection --- emitting verify user')

        socket.emit('verifyUser', '') //triggering event

        // code to verify user & make him online
        socket.on('set-user', (authToken) => { //socket.on waits for this event to happpen like eventemmiter.on

            console.log('set user called')

            tokenLib.verifyClaimWithoutSecret(authToken, (err, user) => {
                if (err) {
                    socket.emit('auth-error', { status: 500, error: 'please provide auth token' })
                } else {
                    console.log('user is verified.... setting details')
                    let currentUser = user.data;
                    //setting socket user Id
                    socket.userId = currentUser.userId;
                    let fullName = `${currentUser.firstName} ${currentUser.lastName}`
                    console.log(`${fullName} is online`)
                    socket.emit(currentUser.userId, 'you are online')

                    let userObj = { userId: currentUser.userId, fullName: fullName }
                    allOnlineUsers.push(userObj)
                    console.log(allOnlineUsers)

                    //setting room name
                    socket.room = 'groupNotify'
                    //joining room
                    socket.join(socket.room)
                    socket.to(socket.room).broadcast.emit('online-user-list', allOnlineUsers)

                }
            })
        }) // end of listening set-user event

        socket.on('disconnect', () => {

            //disconnect the socket
            //remove user from userlist
            //unsubscribe user from his own channel

            console.log('user is disconnected')
            console.log(socket.userId)

            var removeIndex = allOnlineUsers.map(function (user) { return user.userId; }).indexOf(socket.userId);
            allOnlineUsers.splice(removeIndex, 1)
            console.log(allOnlineUsers)

            socket.to(socket.room).broadcast.emit('online-user-list', allOnlineUsers)
            socket.leave(socket.room)
        })// end of on disconnect

        //mycode for notification
        socket.on('notify-msg', (data) => {
            console.log('socket notify-msg called')
            console.log(data)
            console.log(data.toUserId)
            myIo.emit(data.toUserId, data)
        })
    })
}


module.exports = {
    setServer: setServer
}