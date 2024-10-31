export type Position = [number, number];

export interface ProposedPosition {
  position: Position;
  valid: boolean;
}

export interface Spot {
  position: Position;
}

export interface Area {
  origin: Position;
  width: number;
  height: number;
}

export type Location = Spot | Area;
