export default class GameState {

  // функция определения текущего игрока
  static getNextGamer(currentGamer) {
    if (currentGamer === 'player') {
      return 'enemy';
    } else if (currentGamer === 'enemy') {
      return 'player';
    } else { throw new Error("Possible gamers: player or enemy...") }
  }

  // определение текущего игрока
  static setCurrentGamer(gamer) {
    if (gamer === 'player' || gamer === 'enemy') {
      return gamer;
    } else { throw new Error("Possible gamers: player or enemy...") }
  }
}
