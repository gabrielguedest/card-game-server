import { Card } from './Card'
import { deckTest } from './Deck01'
import Player from "./Player"
import { formatInitialGameData } from './utils/formatData'
import * as _ from 'lodash'
import { io } from './socket'

class Match {
  private playerOne: Player
  private playerTwo: Player
  private actor: Player

  public room: string

  constructor(room: string) {
    this.room = room
  }

  public async startMatch(playerOne: Player, playerTwo: Player) {
    this.playerOne = playerOne
    this.playerTwo = playerTwo
    this.actor = this.getFirstActor()

    this.playerOne.deck = _.cloneDeep(deckTest)
    this.playerTwo.deck = _.cloneDeep(deckTest)

    this.playerOne.hand = this.draw(this.playerOne.deck, 5)
    this.playerTwo.hand = this.draw(this.playerTwo.deck, 5)
  }

  private draw(deck: Card[], cards): Card[] {
    let cardsDrawed = []

    for (let i = 0; i < cards; i++) {
      const randomNumber = Math.floor(Math.random() * (deck.length - 1) + 1)
      cardsDrawed.push(deck[randomNumber])
      _.remove(deck, deck[randomNumber])
    }

    return cardsDrawed
  }

  private getFirstActor() {
    const randomNumber = Math.floor(Math.random() * 2) + 1

    return randomNumber === 1
      ? this.playerOne
      : this.playerTwo
  }

  public emitNewMatch() {
    const playerOne = this.playerOne.get()
    const playerTwo = this.playerTwo.get()
    const actor = this.actor.get().id

    playerOne.emit('newMatch', formatInitialGameData(this.playerOne, this.playerTwo, actor))
    playerTwo.emit('newMatch', formatInitialGameData(this.playerTwo, this.playerOne, actor))
  }

  public drawCard(player: Player, cards) {
    const playerToDraw = player === this.playerOne
      ? this.playerOne
      : this.playerTwo
    const playerSocket = playerToDraw.get()

      
    const drawedCards = this.draw(playerToDraw.deck, cards)

    drawedCards.forEach(card => {
      playerToDraw.hand.push(card)
    })

    playerSocket.emit('cardDrawed', { 
      drawedCards,
      hand: playerToDraw.hand
    })

    playerSocket.broadcast.to(this.room).emit('opponentCardDrawed', {
      drawedCards: drawedCards.length,
      hand: playerToDraw.hand.length,
    })
  }
}

export default Match