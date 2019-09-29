import * as socketIo from 'socket.io'
import { Server } from 'http'

export let io: SocketIO.Server = null
export const initSocketConnection = (server: Server) => {
  io = socketIo(server)
}