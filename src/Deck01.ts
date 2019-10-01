import { Card } from './Card'
import * as uuid from 'uuid'

export const deckTest: Card[] = [
  {
    id: uuid(),
    name: 'Card One',
    attack: 10,
    defense: 10,
    mana: 1,
  },
  {
    id: uuid(),
    name: 'Card Two',
    attack: 9,
    defense: 9,
    mana: 2,
  },
  {
    id: uuid(),
    name: 'Card Three',
    attack: 10,
    defense: 10,
    mana: 3,
  },
  {
    id: uuid(),
    name: 'Card Four',
    attack: 11,
    defense: 11,
    mana: 4,
  },
  {
    id: uuid(),
    name: 'Card Five',
    attack: 8,
    defense: 8,
    mana: 5,
  },
  {
    id: uuid(),
    name: 'Card Six',
    attack: 12,
    defense: 12,
    mana: 6,
  },
  {
    id: uuid(),
    name: 'Card Seven',
    attack: 7,
    defense: 7,
    mana: 7,
  },
  {
    id: uuid(),
    name: 'Card Eight',
    attack: 8,
    defense: 8,
    mana: 8,
  },
  {
    id: uuid(),
    name: 'Card Nine',
    attack: 12,
    defense: 12,
    mana: 9,
  },
  {
    id: uuid(),
    name: 'Card Ten',
    attack: 8,
    defense: 8,
    mana: 10,
  },
]