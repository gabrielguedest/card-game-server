import Player from "../Player"

export const formatInitialGameData = (player: Player, opponent: Player, actor: string) => ({
  actor: actor,
  player: {
    life: player.life,
    maxMana: player.maxMana,
    mana: player.mana,
    deck: player.deck,
    hand: player.hand,
  },
  opponent: {
    life: opponent.life,
    maxMana: opponent.maxMana,
    mana: opponent.mana,
    deck: opponent.deck.length,
    hand: opponent.hand.length,
  }
})