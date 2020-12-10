'use strict';

export function calcTileType(index, boardSize) {
  if ( index === 0 ) {
    return 'top-left';
  } else if ( index < boardSize && ( index + 1 ) % boardSize !== 0 ) {
    return 'top';
  } else if ( ( index + 1 ) / boardSize === 1 ) {
    return 'top-right';
  } else if ( ( index ) === ( boardSize ** 2 - boardSize ) ) {
    return 'bottom-left';
  } else if ( ( boardSize ** 2 - index ) < boardSize && ( index + 1 ) !== ( boardSize ** 2 ) ) {
    return 'bottom';
  } else if ( ( index + 1 ) === ( boardSize ** 2 ) ) {
    return 'bottom-right';
  } else if ( ( index + 1 ) % boardSize === 0 ) {
    return 'right';
  } else if ( index % boardSize === 0 ) {
    return 'left';
  } else {
    return 'center';
  }
}

export function calcHealthLevel(health) {
  return (health < 15) ? 'critical' : (health < 50) ? 'normal' : 'high';
}

