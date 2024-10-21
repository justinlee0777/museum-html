import Position from './position.model';

interface BaseMuseumWall {
  origin: Position;
}

interface VerticalMuseumWall extends BaseMuseumWall {
  height: number;
}

interface HorizontalMuseumWall extends BaseMuseumWall {
  width: number;
}

export type MuseumWall = VerticalMuseumWall | HorizontalMuseumWall;

export enum MuseumWallType {
  INTERSECTING = 'intersecting',
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}
