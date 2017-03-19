'use strict'

const {Server} = require('ws')
const manager = require('./src/manager')

const server = new Server({
  port: 8081,
  clientTracking: false
})

server.on('connection', manager.addUser.bind(manager))
