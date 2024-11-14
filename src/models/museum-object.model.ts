import { Location } from './position.model';

type MuseumObjectInteractionLocation =
  | Location
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

export type MuseumObject = Location & {
  sprite: string;

  interactions?: Array<MuseumObjectInteraction>;
};
