import { Card } from './Card';
import { io } from './socket'
import Player from './Player'
import Lobby from './Lobby'
import * as uuid from 'uuid'
import Match from './Match'

class Game {
  private lobby: Lobby
  private matches: Match[] = []

  constructor() {
    this.lobby = Lobby.getInstance()
    this.connection()
  }

  private getMatch(room: string) {
    return this.matches.find(match => match.room === room)
  }

  private connection() {
    io.on('connection', (socket) => {
      const player = new Player(socket)
      this.onPlayerConnection(player)

      socket.on('ready', () => this.playerReady(player))

      socket.on('unready', () => this.playerUnready(player))

      socket.on('canStart', () => this.canStart(player))

      socket.on('drawCard', (cards) => this.drawCard(player, cards))

      socket.on('playCard', (card: Card) => this.playCard(player, card))
      
      socket.on('attackCard', ({ attacker, attacked }) => this.cardAttack(player, attacker, attacked))

      socket.on('selectedCard', (card: Card) => this.selectedCard(player, card))
      
      socket.on('attackFocus', (card: Card | null) => this.attackFocus(player, card))

      socket.on('endTurn', () => this.endTurn(player))

      socket.on('disconnect', () => this.onPlayerDisconnect(player))
    })
  }

  private onPlayerConnection(player: Player) {
    player.enterRoom('lobby')   
  }

  private onPlayerDisconnect(player: Player) {
    this.lobby.removeReadyPlayer(player.get())
  }

  private playerReady(player: Player) {
    if (this.lobby.getPlayersReadyQuantity() < 1) {
      return this.lobby.addReadyPlayer(player.get())
    }
    
    const playerTwoSocket = this.lobby.getRandomReadyPlayer()
    const playerTwo = new Player(playerTwoSocket)

    this.lobby.removeReadyPlayer(playerTwoSocket)

    player.leaveRoom('lobby')
    playerTwo.leaveRoom('lobby')
    
    const roomId = uuid()
    player.enterRoom(roomId)
    playerTwo.enterRoom(roomId)

    this.gameFound(roomId)
  }

  private playerUnready(player: Player) {
    this.lobby.removeReadyPlayer(player.get())
  }

  private canStart(player: Player) {
    const room = Object.keys(player.get().rooms)[1]
    const match = this.getMatch(room)

    console.log({ "socket-id": player.get().id })

    if (!match) {
      console.log('No match found')
      return
    }
    
    match.addReadyPlayers()
  }

  private gameFound(room: string) {
    io.in(room).emit('gameFound')

    this.createMatch(room)
  }

  private async createMatch(room: string) {
    const match = new Match(room)
    this.matches.push(match)

    const [playerOne, playerTwo] = Object.keys(io.sockets.adapter.rooms[room].sockets)
    const playerOneSocket = io.sockets.connected[playerOne]
    const playerTwoSocket = io.sockets.connected[playerTwo]

    await match.startMatch(new Player(playerOneSocket), new Player(playerTwoSocket))
    match.emitNewMatch()
  }

  private drawCard(player: Player, cards: number) {
    const room = Object.keys(player.get().rooms)[1]
    const match = this.getMatch(room)

    if (!match) {
      console.log('No match found')
      return
    }

    const cardsToDraw = cards ? cards : 1

    match.drawCard(player, cardsToDraw)
  }

  private playCard(player: Player, card: Card) {
    const room = Object.keys(player.get().rooms)[1]
    const match = this.getMatch(room)

    console.log({ "socket-id": player.get().id })

    if (!match) {
      console.log('No match found')
      return
    }
    
    match.playCard(player, card)
  }

  private selectedCard(player: Player, card: Card) {
    const room = Object.keys(player.get().rooms)[1]
    const match = this.getMatch(room)

    if (!match) {
      console.log('No match found')
      return
    }

    match.selectedCard(player, card)
  }

  private attackFocus(player: Player, card: Card | null) {
    const room = Object.keys(player.get().rooms)[1]
    const match = this.getMatch(room)

    console.log({ "socket-id": player.get().id })

    if (!match) {
      console.log('No match found')
      return
    }
    
    match.attackFocus(player, card)
  }

  private cardAttack(player: Player, attacker: Card, attacked: Card) {
    const room = Object.keys(player.get().rooms)[1]
    const match = this.getMatch(room)

    console.log({ "socket-id": player.get().id })

    if (!match) {
      console.log('No match found')
      return
    }

    match.attackCard(player, attacker, attacked)
  }

  private endTurn(player: Player) {
    const room = Object.keys(player.get().rooms)[1]
    const match = this.getMatch(room)

    if (!match) {
      console.log('No match found')
      return
    }

    match.endTurn(player)
  }
}

export default Game