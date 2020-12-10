'use strict';

/**
 * Generates random characters
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */

import PositionedCharacter from "./PositionedCharacter";

// генератор персонажей
export function* characterGenerator(allowedTypes, maxLevel) {
  let min = 0;
  let max = allowedTypes.length;
  let finished = false;
  while (finished === false) {
    let randomNumber = getRandomNumber(min, max);
    if ( allowedTypes[randomNumber].level <= maxLevel ) {
      finished = true;
      yield allowedTypes[randomNumber];
    }
  }
}

// генератор команды
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  let characterCurrentCount = 0;
  let teamArray = [];

  // клонируем персонаж, чтобы можно было использовать его еще раз
  function clone(obj) {
    if (null == obj || "object" != typeof obj) { return obj }
    let copy = obj.constructor();
    for (let attr in obj) { if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr] }
    return copy;
  }

  // создаем команду
  while ( characterCurrentCount < characterCount ) {
    let character = characterGenerator(allowedTypes, maxLevel).next().value;
    if (!teamArray.includes(character)) {
      teamArray.push(clone(character));
      characterCurrentCount += 1;
    }
  }
  return teamArray;
}

// функция случайных целочисленных цифр
export function getRandomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

// генерация случайных позиций для персонажа
export function generateTeamPositions(team, allowedPositions) {
  let teamWithPositions = [];
  let usedPositions = [];
  let min = 0;
  let max = allowedPositions.length;

  // создаем команду с позициями
  for (let hero of team) {
    let finished = false;
    while (finished === false) {
      let randomNumber = getRandomNumber(min, max);
      if (!usedPositions.includes(randomNumber)) {
        teamWithPositions.push(new PositionedCharacter(hero, allowedPositions[randomNumber]));
        usedPositions.push(randomNumber);
        finished = true;
      }
    }
  }
  return teamWithPositions;
}
