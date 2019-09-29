import * as express from 'express'
import { createServer, Server} from 'http'
import { initSocketConnection } from './socket'
import Game from './Game'

class App {
  private app: express.Application
  public server: Server

  constructor() {
    this.app = express()  
    this.server = createServer(this.app)

    initSocketConnection(this.server)
    this.initGameServer() 
  }

  private initGameServer() {
    new Game()
  }
}

export default new App()