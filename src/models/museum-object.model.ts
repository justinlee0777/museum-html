import Position from './position.model';

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

type TextMusemObjectInteraction = MuseumObjectInteractionLocation & {
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
