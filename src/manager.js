'use strict'

const user = require('./models/user')

module.exports = {
  /**
   * Contains a list of online users indexed by their ID.
   * @type {Object}
   */
  users: {},

  /**
   * Function used to add a new user to the online users list.
   * @param {Object} socket WebSocket connection.
   */
  addUser (socket) {
    const self = this

    // Create new user.
    const newUser = Object.create(user)

    // When user is disconnected:
    //   1. He should be removed from the online users list.
    //   2. Should notify all online users.
    socket.on('close', () => {
      delete self.users[newUser.id]
      this.broadcast('user-offline', newUser)
    })

    // Listen for messages sent by the user.
    socket.on('message', onmessage.bind(this, newUser))

    // Initialize user.
    newUser.init(socket)

    // Notify all online users about the newly added user.
    this.broadcast('user-online', newUser)

    // Send the list of online users to the newly added user.
    sendOnlineUsersList.call(this, socket)

    // Add user to the list of online users.
    this.users[newUser.id] = newUser
  },
  
  /**
   * Function used to send a payload to all the online users.
   * @param  {String} type The payload type.
   * @param  {Mixed} data  Data to be sent.
   */
  broadcast (type, data) {
    Object.keys(this.users).forEach(key => {
      this.users[key].socket.send(JSON.stringify({ type, data }))
    })
  }
}

/**
 * Function used to send the list of online users to a user.
 * @param  {Object} socket WebSocket connection.
 */
function sendOnlineUsersList (socket) {
  const self = this
  const users = []

  Object.keys(this.users).forEach(key => users.push(self.users[key]))

  socket.send(JSON.stringify({ type: 'users', data: users }))
}

/**
 * Function invoked when a user sends a message to the WebSocket server.
 * @this   {Object} Manager instance.
 * @param  {String} user    The author of the message.
 * @param  {String} message The message sent by the user
 */
function onmessage (user, message) {
  const payload = JSON.parse(message)

  switch (payload.type) {
    case 'ice': return sendICE.call(this, user, payload.data)
    case 'offer': return sendOffer.call(this, user, payload.data)
    case 'answer': return sendAnswer.call(this, user, payload.data)
  }
}

/**
 * Function used to send an RTC ICE Candidate to the specified user.
 * @param  {String} user The author of the message.
 * @param  {Object} data Ice Candidate info.
 */
function sendICE (user, data) {
  this.users[data.user].socket.send(JSON.stringify({
    type: 'ice',
    data: {
      user,
      ice: data.ice
    }
  }))
}

/**
 * Function used to send an RTC Offer to the specified user.
 * @param  {String} user The author of the message.
 * @param  {Object} data RTC Offer info.
 */
function sendOffer (user, data) {
  this.users[data.user].socket.send(JSON.stringify({
    type: 'offer',
    data: {
      user,
      description: data.description
    }
  }))
}

/**
 * Function used to send an RTC Answer to the specified user.
 * @param  {String} user The author of the message.
 * @param  {Object} data RTC Answer info.
 */
function sendAnswer (user, data) {
  this.users[data.user].socket.send(JSON.stringify({
    type: 'answer',
    data: {
      user,
      description: data.description
    }
  }))
}
