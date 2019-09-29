import { io } from './socket'
import { Socket } from 'socket.io'
import * as _ from 'lodash'

class Lobby {
  static instance = null
  private readyPlayers: Socket[] = []

  private constructor() {}

  static getInstance() {
    if (!Lobby.instance) {
      Lobby.instance = new Lobby()
    }

    return Lobby.instance
  }

  public getReadyPlayers() {
    return this.readyPlayers
  }
  
  public addReadyPlayer(player: Socket) {
    this.readyPlayers.push(player)
  }

  public removeReadyPlayer(player: Socket) {
    _.remove(this.readyPlayers, p => p === player)
  }

  public getPlayersReadyQuantity() {
    return this.readyPlayers.length
  }

  public getRandomReadyPlayer() {
    const maxRandom = this.readyPlayers.length

    const playerIndex = maxRandom > 1 
      ? Math.floor(Math.random() * (maxRandom - 1) + 1)
      : 0

    return this.readyPlayers[playerIndex]
  }
}

export default Lobby