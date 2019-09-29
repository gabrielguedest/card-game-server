import { Card } from './Card'
import { Socket } from "socket.io"

class Player {
  private socket: Socket

  public deck: Card[]
  public life: number = 30
  public actualMana: number = 1
  public mana: number = 1
  public maxMana: number = 10
  public hand: Card[] = []
  public board: Card[] = []

  constructor(socket) {
    this.socket = socket
  }

  public get() {
    return this.socket
  }

  public enterRoom(name: string) {
    this.socket.join(name)
  }

  public leaveRoom(name: string) {
    this.socket.leave(name)
  }
}

export default Player