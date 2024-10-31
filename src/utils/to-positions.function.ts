import { MuseumWall } from '../models/museum-wall.model';
import { Position } from '../models/position.model';

export function toPositions(walls: Array<MuseumWall>): Array<Position> {
  const positions: Set<string> = new Set();

  for (const wall of walls) {
    const {
      origin: [ox, oy],
    } = wall;
    let range: Array<Position>;
    if ('height' in wall) {
      range = Array(wall.height)
        .fill(undefined)
        .map((_, i) => [ox, oy + i]);
    } else {
      range = Array(wall.width)
        .fill(undefined)
        .map((_, i) => [ox + i, oy]);
    }

    for (const [x, y] of range) {
      positions.add(`${x}-${y}`);
    }
  }

  const regex = /(\d+)-(\d+)/;

  return Array.from(positions).map((value) => {
    const [, strX, strY] = value.match(regex)!;
    return [Number(strX), Number(strY)];
  });
}
