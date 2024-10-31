import { Position } from './position.model';

interface MuseumObjectSpot {
  position: Position;
}

interface MuseumObjectArea {
  origin: Position;
  width: number;
  height: number;
}

type MuseumObjectLocation = MuseumObjectSpot | MuseumObjectArea;

type MuseumObjectInteractionLocation =
  | MuseumObjectLocation
  | {
      sameAsObject: true;
    };

export type TextMusemObjectInteraction = MuseumObjectInteractionLocation & {
  artist: string;
  title: string;
  context: string;
  make: string;
  acquisition: string;
  description: string;
};

type ImageMuseumObjectInteraction = MuseumObjectInteractionLocation & {
  url: string;
};

export type MuseumObjectInteraction =
  | TextMusemObjectInteraction
  | ImageMuseumObjectInteraction;

export type MuseumObject = MuseumObjectLocation & {
  sprite: string;

  interactions?: Array<MuseumObjectInteraction>;
};
