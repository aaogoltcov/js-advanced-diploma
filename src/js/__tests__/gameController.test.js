import GameController from '../GameController';
import GamePlay from '../GamePlay';
import PositionedCharacter from '../PositionedCharacter';
import { Magician } from '../Character';
import { test } from "@jest/globals";
import GameStateService from "../GameStateService";
import {characterGenerator} from "../generators";

test('should character info', () => {
  const gamePlay = new GamePlay();
  const gameCtrl = new GameController(gamePlay, 'stateService');
  expect(gameCtrl.setCharacterInfoTemplate(1, 40, 40, 100))
    .toBe('🎖1⚔40🛡40❤100')
})

test('should motion positions', () => {
  document.body.innerHTML = '<div id="game-container"></div>';
  const gamePlay = new GamePlay();
  gamePlay.bindToDOM(document.querySelector('#game-container'));
  const gameCtrl = new GameController(gamePlay, 'stateService');
  gamePlay.drawUi('prairie');
  let magician = new Magician(1);
  expect(gameCtrl
    .getCharacterDistancePositionsOrAttack(34, magician,  'position'))
    .toEqual([26, 27, 35, 43, 42, 41, 33, 25]);
})

test('should attack positions', () => {
  document.body.innerHTML = '<div id="game-container"></div>';
  const gamePlay = new GamePlay();
  gamePlay.bindToDOM(document.querySelector('#game-container'));
  const stateService = new GameStateService(localStorage);
  const gameCtrl = new GameController(gamePlay, stateService);
  gamePlay.drawUi('prairie');
  gameCtrl.init();
  let magician = new Magician(1);
  expect(gameCtrl
    .getCharacterDistancePositionsOrAttack(0, magician,  'attack'))
    .toEqual([]);
})

test('should init', () => {
  document.body.innerHTML = '<div id="game-container"></div>';
  const gamePlay = new GamePlay();
  gamePlay.bindToDOM(document.querySelector('#game-container'));
  const stateService = new GameStateService(localStorage);
  const gameCtrl = new GameController(gamePlay, stateService);
  gameCtrl.init();
  expect(gameCtrl.generalTeam.length).toBe(4);
})

test('should save and load from local storage', () => {
  document.body.innerHTML = '<div id="game-container"></div>';
  const gamePlay = new GamePlay();
  gamePlay.bindToDOM(document.querySelector('#game-container'));
  const stateService = new GameStateService(localStorage);
  const gameCtrl = new GameController(gamePlay, stateService);
  gameCtrl.init();
  gameCtrl.onSaveGame();
  let localStorageSave = gameCtrl.stateService.load();
  expect(localStorageSave.currentLevel).toBe(1);
  expect(localStorageSave.playerScore).toBe(0);
  expect(localStorageSave.currentGamer).toBe('player');
  expect(localStorageSave.generalTeam.length).toBe(4);
})

test('should mistake with load from localstorage', () => {
  document.body.innerHTML = '<div id="game-container"></div>';
  const gamePlay = new GamePlay();
  gamePlay.bindToDOM(document.querySelector('#game-container'));
  const stateService = new GameStateService(localStorage);
  const gameCtrl = new GameController(gamePlay, stateService);
  gameCtrl.init();
  gameCtrl.stateService.save();
  expect(function () {
    gameCtrl.stateService.load();
  }).toThrow(new Error("Invalid state"));
})
