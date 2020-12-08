import { calcTileType } from '../utils'
import { test } from "@jest/globals";


test('get calculated tile for board', () => {
  let boardSize = 8;
  let tileArray = []
  for ( let i = 0; i < boardSize ** 2; i += 1 ) {
    tileArray.push(calcTileType(i, boardSize))
  }
  expect(tileArray).toEqual([
    "top-left",
    "top",
    "top",
    "top",
    "top",
    "top",
    "top",
    "top-right",
    "left",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "right",
    "left",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "right",
    "left",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "right",
    "left",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "right",
    "left",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "right",
    "left",
    "center",
    "center",
    "center",
    "center",
    "center",
    "center",
    "right",
    "bottom-left",
    "bottom",
    "bottom",
    "bottom",
    "bottom",
    "bottom",
    "bottom",
    "bottom-right",
    ])
})