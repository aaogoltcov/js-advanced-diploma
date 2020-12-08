import { playerTeamAllowed, enemyTeamAllowed, playerAllowedPositions, enemyAllowedPositions } from './Team';
import { generateTeam, generateTeamPositions, getRandomNumber } from './generators';
import GameState from "./GameState";
import GamePlay from "./GamePlay";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.currentCharacterIndex = Number();
    this.previousCharacterIndex = Number();
    this.arrayOfPossiblePositions = Array();
    this.arrayOfPossibleAttackes = Array();
    this.playerScore = Number();

    // активация событий по фокусу и клику на поле игры
    this.getCharacterInfo();
    this.closeCharacterInfo();
    this.chooseCharacter();
    this.getNewGame();
    this.saveGame();
    this.loadGame();
  }

  // самое начало игры
  init(newGame = false) {

    // загрузка сохраненной игры
    let savedGame = this.stateService.load();
    if (savedGame && !newGame) {
      // прорисовка UI в зависимости от уровня игры
      this.currentLevel = savedGame.currentLevel;
      this.drawUIWithLevels();

      // команды
      this.playerTeam = savedGame.playerTeam;
      this.enemyTeam = savedGame.enemyTeam;
      this.generalTeam = savedGame.generalTeam;
      this.currentGamer = GameState.setCurrentGamer(savedGame.currentGamer);

      // прорисовка позиций игрока и противника
      this.gamePlay.redrawPositions(this.generalTeam);
    } else {
      // прорисовка UI в зависимости от уровня игры
      this.currentLevel = 1;
      this.drawUIWithLevels();

      // команды
      this.playerTeam = Array();
      this.enemyTeam = Array();
      this.generalTeam = Array();
      this.currentGamer = GameState.setCurrentGamer('player');

      // инициализация команды игрока
      this.playerTeam = generateTeamPositions(
        generateTeam(playerTeamAllowed, 1, 2), playerAllowedPositions);

      // инициализация команды противника
      this.enemyTeam = generateTeamPositions(
        generateTeam(enemyTeamAllowed, 1, 2), enemyAllowedPositions);

      // прорисовка позиций игрока и противника
      Array.prototype.push.apply(this.generalTeam, this.playerTeam);
      Array.prototype.push.apply(this.generalTeam, this.enemyTeam);
      this.gamePlay.redrawPositions(this.generalTeam);
    }
  }

  savePlayerScore() {
    let score = Number();
    for (let position of this.playerTeam) {
      score += position.character.health;
    }
    this.playerScore = this.playerScore + score;
  }

  generateNewLevel(playerCharacterCount, playerCharacterLevel, enemyCharacterLevel) {
    // сохраняем очки
    this.savePlayerScore();

    // повышаем уровень с 1-го до 2-го
    this.currentLevel += 1;

    // прорисовка UI в зависимости от уровня игры
    this.drawUIWithLevels();

    // начинаем ходить с игрока
    this.currentGamer = GameState.setCurrentGamer('player');

    // восстанавливаем здоровье, повышаем уровень оставшихся персонажей игрока и формируем новую команду
    let teamArray = Array();
    for (let character of this.playerTeam) {
      character.character.levelUp();
      teamArray.push(character.character);
    }

    // добавляем +1 персонаж игроку
    Array.prototype.push.apply(teamArray, generateTeam(playerTeamAllowed, playerCharacterLevel, playerCharacterCount))

    // герерируем начальные позиции для новой команды игрока
    this.playerTeam = generateTeamPositions(teamArray, playerAllowedPositions);

    // создаем команду противника
    this.enemyTeam = generateTeamPositions(
      generateTeam(enemyTeamAllowed, enemyCharacterLevel, this.playerTeam.length), enemyAllowedPositions);

    // прорисовка позиций игрока и противника
    this.generalTeam = Array();
    Array.prototype.push.apply(this.generalTeam, this.playerTeam);
    Array.prototype.push.apply(this.generalTeam, this.enemyTeam);
    this.gamePlay.redrawPositions(this.generalTeam);
  }

  generateNewGameLevel() {

    // если проиграл игрок, то начинаем все сначала
    if (this.playerTeam.length === 0) {
      this.init(true)
    } else if (this.enemyTeam.length === 0) {

      // игрок победил все 4-ре уровня, начинаем все сначала
      if (this.currentLevel >= 4) {
        this.currentGamer = GameState.setCurrentGamer('enemy');

      // противник проиграл раунд, переходим на следующий уровень
      } else {

        // переход с 1-го уровня на 2-й
        if (this.currentLevel === 1) {
          this.generateNewLevel(1, 1, 2);

        // переход со 2-го уровня на 3-й
        } else if (this.currentLevel === 2) {
          this.generateNewLevel(2, 2, 3);

          // переход со 3-го уровня на 4-й
        } else if (this.currentLevel === 3) {
          this.generateNewLevel(2, 3, 4);
        }
      }
    }
  }

  // прорисовка UI в зависимости от уровня игры
  drawUIWithLevels() {
    this.currentLevel === 1 ? this.gamePlay.drawUi('prairie')
      : this.currentLevel === 2 ? this.gamePlay.drawUi('desert')
      : this.currentLevel === 3 ? this.gamePlay.drawUi('arctic')
      : this.gamePlay.drawUi('mountain');
  }

  // очистка возможных позиций после хода персонажем игрока (для событий)
  clearDistanceAndAttackPositions() {
    this.arrayOfPossiblePositions = Array();
    this.arrayOfPossibleAttackes = Array();
  }

  // расчет урона исходя из уровня атаки игрока и уровня защиты противника
  getDamage(attackedIndex, defenceIndex) {
    let attack = Number();
    let defence = Number();
    for (const position of this.generalTeam) {
      position.position === attackedIndex ? attack = position.character.attack
        : position.position === defenceIndex ? defence = position.character.defence : false;
    }
    return (attack > 0 && defence > 0) ? Math.max(attack - defence, attack * 0.9) : false;
  }

  // расчет возможных позиций хода и аттаки персонажа
  getCharacterDistancePositionsOrAttack(index, character, distanceType) {
    // собираем информацию об атаке или дистации в зависимост от типа расчета
    let distanceOfAttackOrPosition = Number();
    if (distanceType === 'position') {
      distanceOfAttackOrPosition = character.motionDistance;
    } else if (distanceType === 'attack') {
      distanceOfAttackOrPosition = character.attackDistance;
    } else { throw new Error("Possible distance types: position, attack...") }

    // вычисляем возможные позиции атаки или движения по направлениям
    if (index >= 0 && character && distanceOfAttackOrPosition) {
      let interimArray = Array();
      for (let cycle = 1; cycle <= distanceOfAttackOrPosition; cycle += 1) {
        // верхняя линия
        if (index > (this.gamePlay.boardSize - 1)) {
          let topPossiblePositionIndex = index - this.gamePlay.boardSize * cycle;
          let topPosition = this.getCharacterInCell(undefined, topPossiblePositionIndex, distanceType);
          if (topPosition >= 0) { interimArray.push(topPosition) }
        }

        // верхняя-правая диагональ
        if (index > (this.gamePlay.boardSize - 1) && ((index + 1) % this.gamePlay.boardSize) !== 0) {
          let topRightPossiblePositionIndex = index - this.gamePlay.boardSize * cycle + cycle;
          let topRightPosition = this.getCharacterInCell(undefined, topRightPossiblePositionIndex, distanceType);
          if (topRightPosition >= 0 && (topRightPosition % this.gamePlay.boardSize !== 0)) { interimArray.push(topRightPosition) }
        }

        // правая линия
        if ((index + 1) % this.gamePlay.boardSize !== 0) {
          let rightPossiblePositionIndex = index + cycle;
          let rightPosition = this.getCharacterInCell(undefined, rightPossiblePositionIndex, distanceType);
          if (rightPosition >= 0 && (rightPosition % this.gamePlay.boardSize !== 0)) { interimArray.push(rightPosition) }
        }

        // правая-нижняя диагональ
        if (index < (this.gamePlay.boardSize ** 2 - this.gamePlay.boardSize - 1)
          && ((index + 1) % this.gamePlay.boardSize) !== 0) {
          let bottomRightPossiblePositionIndex = index + this.gamePlay.boardSize * cycle + cycle;
          let bottomRightPosition = this.getCharacterInCell(undefined, bottomRightPossiblePositionIndex, distanceType);
          if (bottomRightPosition >= 0 && (bottomRightPosition % this.gamePlay.boardSize !== 0)) { interimArray.push(bottomRightPosition) }
        }

        // нижняя
        if (index < (this.gamePlay.boardSize ** 2 - this.gamePlay.boardSize - 1)) {
          let bottomPossiblePositionIndex = index + this.gamePlay.boardSize * cycle;
          let bottomPosition = this.getCharacterInCell(undefined, bottomPossiblePositionIndex, distanceType);
          if (bottomPosition >= 0) { interimArray.push(bottomPosition) }
        }

        // нижняя-левая диагональ
        if (index < (this.gamePlay.boardSize ** 2 - this.gamePlay.boardSize - 1)
          && (index % this.gamePlay.boardSize) !== 0) {
          let bottomLeftPossiblePositionIndex = index + this.gamePlay.boardSize * cycle - cycle;
          let bottomLeftPosition = this.getCharacterInCell(undefined, bottomLeftPossiblePositionIndex, distanceType);
          if (bottomLeftPosition >= 0 && ((bottomLeftPosition + 1) % this.gamePlay.boardSize !== 0)) { interimArray.push(bottomLeftPosition) }
        }

        // левая линия
        if (index % this.gamePlay.boardSize !== 0) {
          let leftPossiblePositionIndex = index - cycle;
          let leftPosition = this.getCharacterInCell(undefined, leftPossiblePositionIndex, distanceType);
          if (leftPosition >= 0 && ((leftPosition + 1) % this.gamePlay.boardSize !== 0)) { interimArray.push(leftPosition) }
        }

        // левая-верхняя диагональ
        if (index > (this.gamePlay.boardSize - 1) && (index % this.gamePlay.boardSize) !== 0) {
          let topLeftPossiblePositionIndex = index - this.gamePlay.boardSize * cycle - cycle;
          let topLeftPosition = this.getCharacterInCell(undefined, topLeftPossiblePositionIndex, distanceType);
          if (topLeftPosition >= 0 && topLeftPosition >= 0 && ((topLeftPosition + 1) % this.gamePlay.boardSize !== 0)) { interimArray.push(topLeftPosition) }
        }
      }
      return interimArray;
    }
  }

  // обработка процесса аттаки
  async attackTreatment(character, damage) {
    console.log(this.playerTeam);
    console.log(this.enemyTeam);
    console.log(this.generalTeam);
    // функция удаления персонажа из команды
    function deleteCharacterFromTeam(index, team) {
      let cycle = 0;
      while (cycle < team.length) {
        if (team[cycle].position === index) {
          team.splice(cycle, 1);
        } else {
          cycle += 1;
        }
      }
      return team;
    }

    // нанесение урона персонажу
    await this.gamePlay.showDamage(character, damage).then((damaged) => {
      for (let position of this.generalTeam) {
        if (position.position === character) {
          position.character.health = position.character.health - damage;

          // удаление персонажа, если уровень жизни равно или меньше 0
          if (position.character.health <= 0) {
            this.generalTeam = deleteCharacterFromTeam(position.position, this.generalTeam);
            this.playerTeam = deleteCharacterFromTeam(position.position, this.playerTeam);
            this.enemyTeam = deleteCharacterFromTeam(position.position, this.enemyTeam);
          }
        }
      }
      return damaged;
    });
  }

  // генерация хода противника (компьютера)
  async getEnemyPositionOrAttack() {
    let enemyPosition = Object();
    if (this.currentGamer === 'enemy' && this.enemyTeam.length > 0) {
      if (this.enemyTeam.length === 1) {
        enemyPosition = this.enemyTeam[0];
      } else {
        enemyPosition = this.enemyTeam[getRandomNumber(0, (this.enemyTeam.length - 1))];
      }
      for (let position of this.generalTeam) {
        if (position === enemyPosition) { enemyPosition = position }
      }

      // расчет возможных позиций для хода или атаки врага
      this.arrayOfPossiblePositions =
        this.getCharacterDistancePositionsOrAttack(enemyPosition.position, enemyPosition.character, 'position');
      this.arrayOfPossibleAttackes =
        this.getCharacterDistancePositionsOrAttack(enemyPosition.position, enemyPosition.character, 'attack');

      // если есть позиции для атаки - атакуем
      if (this.arrayOfPossibleAttackes.length > 0) {
        let index = this.arrayOfPossibleAttackes[getRandomNumber(0, (this.arrayOfPossibleAttackes.length - 1))];
        let damage = this.getDamage(enemyPosition.position, index);
        await this.attackTreatment(index, damage);

      // иначе делаем ход
      } else {

        // вычисляем куда ходить
        let motion = this.gamePlay.boardSize ** 2 - 1;
        for (let position of this.playerTeam) {
          for (let index of this.arrayOfPossiblePositions) {
            if (index + 1 % this.gamePlay.boardSize ** 2 === 0 || index + 2 % this.gamePlay.boardSize ** 2 === 0) {
              if (Math.abs(position.position - index) > Math.abs(position.position - motion)) {
                motion = index;
              }
            } else {
              if (Math.abs(position.position - index) < Math.abs(position.position - motion)) {
                motion = index;
              }
            }
          }
        }
        // меняем позицию персонажа противника и делаем ход
        enemyPosition.position = motion;
      }

      // после действия меняем игрока и перерисовываем поле
      this.currentGamer = GameState.getNextGamer(this.currentGamer);
      this.gamePlay.redrawPositions(this.generalTeam);
      this.clearDistanceAndAttackPositions();

      this.generateNewGameLevel();
    }
  }

  // поиск персонажа по индексу (вспомогательная функция для getCharacterInCell)
  isIndexOnCharacterPosition(index, team) {
    for (let position of team) if (position.position === index) { return true }
    return false;
  }

  // проверка наличия персонажа в ячейке по индексу и событию, получение индекса персонажа для атаки
  getCharacterInCell(event = undefined,
                    possiblePositionIndex = undefined,
                    distanceType = undefined, )
  {
    // проверка наличия персонажа в ячейке по индексу
    if (distanceType) {
      let possiblePositionIndexCell = this.gamePlay.cells[possiblePositionIndex];
      if (possiblePositionIndexCell) {

        // получение позиции для хода
        if (distanceType === 'position') {
          if (
            !((possiblePositionIndexCell.firstChild
              && possiblePositionIndexCell.firstChild.classList.contains('character'))
            || possiblePositionIndex > this.gamePlay.boardSize ** 2
            || possiblePositionIndex < 0)
          ) {
            return possiblePositionIndex;
          }
          // else { return possiblePositionIndex }

        // получение позиции для атаки игрока и противника
        } else if (distanceType === 'attack') {
          if (this.currentGamer === 'player') {
            if (
              this.isIndexOnCharacterPosition(possiblePositionIndex, this.enemyTeam)
              && possiblePositionIndex < this.gamePlay.boardSize ** 2
              && possiblePositionIndex >= 0
            ) {
              return possiblePositionIndex;
            }
          } else {
            if (
              this.isIndexOnCharacterPosition(possiblePositionIndex, this.playerTeam)
              && possiblePositionIndex < this.gamePlay.boardSize ** 2
              && possiblePositionIndex >= 0
            ) {
              return possiblePositionIndex;
            }
          }
        }
        // else { return false }
      }

    // проверка наличия персонажа в ячейке по событию
    } else {
      return (event.toElement.firstChild
        && event.toElement.firstChild.classList.contains('character')) ||
        (event.toElement
          && event.toElement.classList.contains('character'));
    }
  }

  // проврека является ли персонаж персонажем игрока
  checkCharacterIsPlayerTeam(index, calculateDistance = 'no') {
    let cellClassList = this.gamePlay.cells[index].children[0].classList;
    for (let character of this.playerTeam) {
      let cellClassListContainCharacter = cellClassList.contains(character.character.type);
      if (cellClassListContainCharacter) {
        if (calculateDistance === 'no') {
          return true;
        } else if (calculateDistance === 'yes') {
          this.arrayOfPossiblePositions =
            this.getCharacterDistancePositionsOrAttack(index, character.character, 'position');
          this.arrayOfPossibleAttackes =
            this.getCharacterDistancePositionsOrAttack(index, character.character, 'attack');
          return true;
        }
      }
    }
    return false;
  }

  // реакция на клик
  chooseCharacter() {
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  async onCellClick(index) {

    // если в ячейке персонаж игрока или противника
    if (this.getCharacterInCell(event)) {

      // если персонаж и ход игрока, то выделяем ячейку
      if (this.checkCharacterIsPlayerTeam(index, 'yes') && this.currentGamer === 'player') {
        this.gamePlay.deselectCell(this.previousCharacterIndex);
        this.gamePlay.selectCell(index);
        this.previousCharacterIndex = index;

      // если персонаж противника, ход игрока и он находится в зоне атаки
      } else if (this.arrayOfPossibleAttackes.includes(index) && this.currentGamer === 'player') {
        let damage = this.getDamage(this.previousCharacterIndex, index);
        this.gamePlay.deselectCell(this.previousCharacterIndex);
        this.previousCharacterIndex = index;

        // игрок атакует
        await this.attackTreatment(index, damage);
        this.currentGamer = GameState.getNextGamer(this.currentGamer);
        this.gamePlay.redrawPositions(this.generalTeam);
        this.clearDistanceAndAttackPositions();

        // передаем ход противнику
        await this.getEnemyPositionOrAttack();

        this.generateNewGameLevel();

      } else {
        if (this.enemyTeam === 0) {
          // если игрок выиграл, то сообщаем об этом через alert
          GamePlay.showMessage('You win...');
        } else {
          // если персонаж противника, то сообщаем об этом через alert
          GamePlay.showError('You choose only player team characters...');
        }
      }
    } else if (this.arrayOfPossiblePositions.includes(index)) {

      // если ячейка в области допустимых ходов - меняем позицию и делаем ход персонажем игрока
      for (let position of this.generalTeam) {
        if (position.position === this.previousCharacterIndex) {
          position.position = index;
          this.currentGamer = GameState.getNextGamer(this.currentGamer);
          this.gamePlay.deselectCell(this.previousCharacterIndex);

          // игрок ходит
          this.gamePlay.redrawPositions(this.generalTeam);
          this.clearDistanceAndAttackPositions();

          // передаем ход противнику
          await this.getEnemyPositionOrAttack();
        }
      }
    }
  }

  // реакция на фокус мышью
  getCharacterInfo() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
  }

  setCharacterInfoTemplate(level, attack, defence, health) {
    return `🎖${level}⚔${attack}🛡${defence}❤${health}`
  }

  onCellEnter(index) {
    if (this.getCharacterInCell(event)) {

      // описание персонажа
      for (let character of this.generalTeam) {
        if (character.position === index) {
          this.gamePlay.showCellTooltip(
            this.setCharacterInfoTemplate(
              character.character.level,
              character.character.attack,
              character.character.defence,
              character.character.health,
              ),
            index)
        }
      }

      // фокус курсора на персонаже игрока
      if (this.checkCharacterIsPlayerTeam(index, 'no')) {
        this.gamePlay.setCursor('pointer');
      } else {

        // фокус курсора на персонаже противника
        // если в зоне атаки
        if (this.arrayOfPossibleAttackes.includes(index)) {
          this.gamePlay.setCursor('crosshair');
          this.gamePlay.selectCell(index, 'red');
        } else {

          // если не доступен для аттаки
          this.gamePlay.setCursor('not-allowed');
        }
      }

    // фокус на ячейке без персонажа
    // в случае есть ячейка является доступной для хода персонажем
    } else if (this.arrayOfPossiblePositions.includes(index)) {
      this.gamePlay.setCursor('pointer');
      this.gamePlay.selectCell(index, 'green');

      // остальные случаи
    } else {
      this.gamePlay.setCursor('auto');
    }
  }

  // реакция на выход курсора мыши из фокуса ячейки
  closeCharacterInfo() {
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    if (this.gamePlay.cells[index].classList.contains('selected-green')) {
      this.gamePlay.deselectCell(index);
    }
    if (this.gamePlay.cells[index].classList.contains('selected-red')) {
      this.gamePlay.deselectCell(index);
    }
  }

  // реакция на создание новой игры
  getNewGame() {
    this.gamePlay.addNewGameListener(this.onNewGame.bind(this));
  }

  onNewGame() {
    this.init(true);
  }

  // реакция на сохранение игры
  saveGame() {
    this.gamePlay.addSaveGameListener(this.onSaveGame.bind(this));
  }

  onSaveGame() {
    this.stateService.save({
      'currentLevel': this.currentLevel,
      'playerScore': this.playerScore,
      'playerTeam': this.playerTeam,
      'enemyTeam': this.enemyTeam,
      'generalTeam': this.generalTeam,
      'currentGamer': this.currentGamer,
    });
  }

  // реакция на загрузку игры
  loadGame() {
    this.gamePlay.addLoadGameListener(this.onLoadGame.bind(this));
  }

  onLoadGame() {
    this.init(false);
  }
}
