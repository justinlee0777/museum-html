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

export type ImageMuseumObjectInteraction = MuseumObjectInteractionLocation & {
  url: string;
};

export type CompositeMuseumObjectInteractionChild = Exclude<
  TextMusemObjectInteraction | ImageMuseumObjectInteraction,
  { sameAsObject: true }
> & {
  sprite: string;
};

export type CompositeMuseumObjectInteraction =
  MuseumObjectInteractionLocation & {
    frame: {
      /** Number of cells wide for the frame. */
      width: number;
      /** Number of cells tall for the frame. */
      height: number;
    };
    objects: Array<CompositeMuseumObjectInteractionChild>;
  };

export type MuseumObjectInteraction =
  | TextMusemObjectInteraction
  | ImageMuseumObjectInteraction
  | CompositeMuseumObjectInteraction;

export type MuseumObject = Location & {
  sprite: string;

  interactions?: Array<MuseumObjectInteraction>;
  impassable?: boolean;
  metadata?: any;
};
