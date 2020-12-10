'use strict';

export default class Character {

  constructor(name, level, type = 'generic', attack, defence, attackDistance, motionDistance) {
    const heroes = [
      'Bowerman',   // стрелок
      'Swordsman',  // мечник
      'Magician',   // маг
      'Daemon',     // демон
      'Undead',     // нежить (скелеты)
      'Zombie',     // зомби (вампир)
    ]

    if ( name && 2 <= name.length <= 10 ) { this.name = name } else { throw new Error('Name is too short / long...') }
    if ( heroes.includes(type) ) { this.type = type } else { throw new Error('Wrong type of Hero...') }

    this.health = 100;
    this.level = level;
    this.attack = attack;
    this.defence = defence;
    this.attackDistance = attackDistance;
    this.motionDistance = motionDistance;

    // throw error if user use "new Character()"
    if ( new.target.name === 'Character' ) { throw new Error("You can't to create class Character") }
  }

  levelUp() {
    if (this.health > 0) {
      if (this.level < 4) { this.level += 1; }
      this.attack = Math.max(this.attack, this.attack * (1.8 - this.health) / 100);
      this.defence = Math.max(this.defence, this.defence * (1.8 - this.health) / 100);
      if (this.health < 20) { this.health += 80 } else { this.health = 100 }
    } else {
      throw new Error("Can't level up for lifeless Hero...")
    }
  }
}

// стрелок
export class Bowerman extends Character {
  constructor(level) {
    super('Bowerman', level, 'Bowerman', 25, 25, 2, 2);
  }
}

// мечник
export class Swordsman extends Character {
  constructor(level) {
    super('Swordsman', level, 'Swordsman', 40, 10, 1, 4);
  }
}

// маг
export class Magician extends Character{
  constructor(level) {
    super('Magician', level, 'Magician', 10, 40, 4, 1);
  }
}

// демон
export class Daemon extends Character{
  constructor(level) {
    super('Daemon', level, 'Daemon', 10, 40, 4, 1);
  }
}

// нежить (скелеты)
export class Undead extends Character{
  constructor(level) {
    super('Undead', level, 'Undead', 25, 25, 1, 4);
  }
}

// зомби (вампир)
export class Zombie extends Character{
  constructor(level) {
    super('Zombie', level, 'Zombie', 40, 10, 2, 2);
  }
}
