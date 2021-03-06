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
  private readyPlayers: number = 0

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

    this.playerOne.hand = this.draw(this.playerOne.deck, 4)
    this.playerTwo.hand = this.draw(this.playerTwo.deck, 4)
  }

  public addReadyPlayers() {
    this.readyPlayers += 1

    if (this.readyPlayers === 2) {
      io.to(this.room).emit('gameReady')
    }
  }

  private draw(deck: Card[], cards: number): Card[] {
    let cardsDrawed = []

    if (deck.length === 1) {
      cardsDrawed.push(deck[0])
      _.remove(deck, deck[0])
      return cardsDrawed
    }

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

  private verifyEndGame(player: Player) {
    const actualPlayer = this.getPlayer(player) 
    const opponent = this.getOpponent(player)

    if (actualPlayer.life <= 0) {
      actualPlayer.get().emit('defeat')
      opponent.get().emit('victory')
    }

    if (opponent.life <= 0) {
      opponent.get().emit('defeat')
      actualPlayer.get().emit('victory')
    }
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

    let drawedCards = []

    if (playerToDraw.hand.length < 6 && playerToDraw.deck.length >= cards) { 
      drawedCards = this.draw(playerToDraw.deck, cards)

      drawedCards.forEach(card => {
        playerToDraw.hand.push(card)
      })
    }

    playerSocket.emit('cardDrawed', { 
      drawedCards,
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

    const cardPlayed = card.mana <= actualPlayer.actualMana
      ? card
      : null

    if (cardPlayed) {
      _.remove(actualPlayer.hand, card)
      actualPlayer.board.push(card)
      actualPlayer.actualMana -= cardPlayed.mana
    }

    actualPlayer.get().emit('cardPlayed', { 
      card: card,
      board: actualPlayer.board,
      hand: actualPlayer.hand,
      mana: actualPlayer.actualMana,
    })

    opponent.get().emit('opponentCardPlayed', {
      card: card,
      board: actualPlayer.board,
      hand: actualPlayer.hand.length,
      opponentMana: actualPlayer.actualMana,
    })
  }

  public selectedCard(player: Player, card: Card) {
    const opponent = this.getOpponent(player)

    opponent.get().emit('opponentSelectedCard', card)
  }

  public attackCard(player: Player, attacker: Card, attacked: Card) {
    const actualPlayer = this.getPlayer(player)
    const opponent = this.getOpponent(player)
    console.log('atacando carta')
    
    let winner

    if (attacker.attack > attacked.defense) {
      const damage = attacker.attack - attacked.defense
      opponent.life = (opponent.life - damage) > 0
        ? opponent.life - damage
        : 0

      _.remove(opponent.board, attacked)

      winner = attacker

      if (opponent.life <= 0) {
        actualPlayer.get().emit('victory')
        opponent.get().emit('defeat')
      }
    } else if (attacker.attack < attacked.defense) {
      const damage = attacked.defense - attacker.attack
      actualPlayer.life = (actualPlayer.life - damage) > 0
        ? actualPlayer.life - damage
        : 0

      _.remove(actualPlayer.board, attacker)

      winner = attacked
    } else {
      winner = false
    }

    actualPlayer.get().emit('cardAttack', {
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

    this.verifyEndGame(player)
  }

  public attackFocus(player: Player, card: Card | null) {
    const opponent = this.getOpponent(player)

    opponent.get().emit('isAttackFocus', card)
  }

  public boardAttackFocus(player: Player) {
    const opponent = this.getOpponent(player)

    opponent.get().emit('boardAttackFocus')
  }

  public boardLoseAttackFocus(player: Player) {
    const opponent = this.getOpponent(player)

    opponent.get().emit('boardLoseAttackFocus')
  }

  public boardAttack(player: Player, card: Card) {
    const opponent = this.getOpponent(player)

    opponent.life = (opponent.life - card.attack) > 0
      ? opponent.life - card.attack
      : 0
    
    opponent.get().emit('boardAttacked', opponent.life)

    this.verifyEndGame(player)
  }

  public endTurn(player: Player) {
    const opponent = this.getOpponent(player)
    const actualPlayer = this.getPlayer(player)

    if (opponent.mana < 10) {
      opponent.mana += 1
    }

    opponent.actualMana = opponent.mana
    actualPlayer.actualMana = opponent.mana
    
    const newActor = opponent.get().id

    opponent.get().emit('playerTurn', { 
      actor: newActor, 
      mana: opponent.mana, 
      opponentMana: actualPlayer.mana,
    })

    actualPlayer.get().emit('opponentTurn', { 
      actor: newActor, 
      opponentMana: opponent.mana,
      mana: actualPlayer.mana,
    })
  }
}

export default Match