'use strict'

const hat = require('hat')
const sillyname = require('sillyname')

module.exports = {
  /**
   * User's ID.
   * @type {Number}
   */
  id: null,

  /**
   * User's name.
   * @type {String}
   */
  name: null,

  /**
   * User's WebSocket connection.
   * @type {object}
   */
  socket: null,

  /**
   * Function used to initialize a user.
   * @param  {Object} socket WebSocket connection.
   */
  init (socket) {
    this.id = hat()
    this.name = sillyname()
    this.socket = socket
  },

  /**
   * Override the toJSON function to exclude sending info about the WebSocket
   * Connection.
   * @return {Object} Object to be represented when stringifying a User model.
   */
  toJSON () {
    return { id: this.id, name: this.name }
  }
}
