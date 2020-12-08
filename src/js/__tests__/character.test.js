import Character, { Magician } from '../Character';
import {test} from "@jest/globals";

test('should be mistake if Character', () => {
  expect(function() {
    new Character(1, 1, 'Magician');
  }).toThrow(new Error("You can't to create class Character"));
})

test('should level up', () => {
  let magician = new Magician(1);
  magician.levelUp();
  expect(magician.level).toEqual(2);
})

test('should mistake with level up', () => {
  let magician = new Magician(1);
  expect(function() {
    magician.health = 0;
    magician.levelUp();
  }).toThrow(new Error("Can't level up for lifeless Hero..."));
})
