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

  private getPlayer(actualPlayer: Player) {
    return actualPlayer.get().id === this.playerOne.get().id
      ? this.playerOne
      : this.playerTwo    
  }

  private getOpponent(actualPlayer: Player) {
    return actualPlayer.get().id === this.playerOne.get().id
      ? this.playerTwo
      : this.playerOne 
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

  public drawCard(player: Player, cards: number) {
    const playerToDraw = player.get().id === this.playerOne.get().id
      ? this.playerOne
      : this.playerTwo
    const playerSocket = playerToDraw.get()

    const opponentSocket = playerToDraw.get().id === this.playerOne.get().id
      ? this.playerTwo.get()
      : this.playerOne.get()

    const drawedCards = this.draw(playerToDraw.deck, cards)

    drawedCards.forEach(card => {
      playerToDraw.hand.push(card)
    })

    playerSocket.emit('cardDrawed', { 
      drawedCards,
      hand: playerToDraw.hand,
      deck: playerToDraw.deck,
    })

    opponentSocket.emit('opponentCardDrawed', {
      drawedCards: drawedCards.length,
      hand: playerToDraw.hand.length,
      deck: playerToDraw.deck.length,
    })
  }

  public playCard(player: Player, card: Card) {
    const actualPlayer = this.getPlayer(player)
    const opponent = this.getOpponent(player)

    _.remove(actualPlayer.hand, card) 
    actualPlayer.board.push(card)

    actualPlayer.get().emit('cardPlayed', { 
      card: card,
      board: actualPlayer.board,
      hand: actualPlayer.hand,
    })

    opponent.get().emit('opponentCardPlayed', {
      card: card,
      board: actualPlayer.board,
      hand: actualPlayer.hand.length,
    })
  }

  public attackCard(player: Player, attacker: Card, attacked: Card) {
    const actualPlayer = this.getPlayer(player)
    const opponent = this.getOpponent(player)
    
    let winner

    if (attacker.attack > attacked.defense) {
      const damage = attacker.attack - attacked.defense
      opponent.life -= damage

      _.remove(opponent.board, attacked)

      winner = attacker

      if (opponent.life <= 0) {
        actualPlayer.get().emit('victory')
        opponent.get().emit('defeat')
      }
    } else if (attacker.attack < attacked.defense) {
      const damage = attacker.defense - attacked.attack
      actualPlayer.life -= damage

      _.remove(actualPlayer.board, attacker)

      winner = attacked

      if (actualPlayer.life <= 0) {
        opponent.get().emit('victory')
        actualPlayer.get().emit('defeat')
      }
    } else {
      winner = false
    }

    actualPlayer.get().emit('attackedCard', {
      attacker: attacker,
      attacked: attacked,
      winner: winner,
      board: actualPlayer.board,
      opponentBoard: opponent.board,
      life: actualPlayer.life,
      opponentLife: opponent.life,
    })

    opponent.get().emit('cardAttacked', {
      attacker: attacker,
      attacked: attacked,
      winner: winner,
      board: opponent.board,
      opponentBoard: actualPlayer.board,
      life: opponent.life,
      opponentLife: actualPlayer.life,
    })
  }

  public endTurn(player: Player) {
    const opponent = player.get().id === this.playerOne.get().id
      ? this.playerTwo.get()
      : this.playerOne.get()

    const newActor = opponent.id
    
    opponent.emit('playerTurn', { actor: newActor })
    player.get().emit('opponentTurn', { actor: newActor })
  }
}

export default Match