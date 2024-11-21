# Museum HTML: Render a miniature museum in your webpage

Configure a museum within your webpage and have users just run around in it. Fairly self-explanatory.

### Installation

To install `museum-html` in your project, run

```
npm install museum-html
```

### Demo

You can see the project working in [my personal website](https://www.iamjustinlee.com/museum/). The code is stored [here](https://github.com/justinlee0777/my-portfolio/tree/main/src/museum).

### Usage

The configuration for `museum-html` follows this interface:

```
interface MuseumArgs<ExitPointData = void> {
  /**
   * Width of the museum in cells.
   */
  width: number;
  /**
   * Height of the museum in cells.
   */
  height: number;
  playerPosition: Position;
  cellSize: number;

  objects: Array<MuseumObject>;
  walls: Array<MuseumWall>;

  registries: {
    player: PlayerSprite;
    tile: TileRegistry;
    object: ObjectRegistry;
    wall: WallRegistry;
    /** You must define this if you decide to use composite interactions i.e. @see CompositeMuseumObjectInteraction */
    frame?: FrameRegistry;
  };

  exitPoints?: Array<ExitPoint<ExitPointData>>;
}
```

The museum is composed of discrete cells. Users navigate through cells and objects are placed into cells. This design was for ease of development. The `width` and `height` describe the museum in cells. `playerPosition` describes where the player is initialized in this museum.

`objects` describe the interactable objects in the museum. There are three types of objects: text, images, and mixed media consisting of text and images.

All three of these accept three kinds of positional data:

```
type Position = [number, number];

interface Spot {
  position: Position;
}

interface Area {
  origin: Position;
  width: number;
  height: number;
}

interface SameAsObject {
    sameAsObject: true;
}
```

`Spot` describing an object that has a width and height of 1, `Area` describing an object that is taller / wider, `SameAsObject` using the object's entire area for its placement. `Spot` and `SameAsObject` differ in that one object can be composed of many interactables, for example, a very long painting divided into many images.

Text objects follow this format:

```
artist: string;
title: string;
context: string;
make: string;
acquisition: string;
description: string;
```

This follows the Metropolitan Museum of Art's storage format closely. There is no flexibility for this at the moment unfortunately.

Image objects:

```
url: string;
```

which is a `url` of the painting or object hosted somewhere.

Mixed media objects:

```
frame: {
    /** Number of cells wide for the frame. */
    width: number;
    /** Number of cells tall for the frame. */
    height: number;
};
objects: Array<CompositeMuseumObjectInteractionChild>;
```

Mixed media objects open up a `frame` which users can navigate through and choose which media to look at. This is useful as `museum-html` is primarily 2-dimensional, and museums can design their collections such that many paintings are placed on the same wall, for example, or a painting and a placard are placed in the same vertical placement. Thus, when you are describing the positions of the objects for this configuration, you are describing the positions _within the to-be generated frame_.

`objects` can be `impassable`.

`objects` can have arbitrary `metadata` associated to them for painting instructions, which will be explained below.

`walls` describe the impassable contours of a museum room. Players cannot pass the bounds of a room, so in theory you do not need to define these if you don't want to.

`museum-html` does not make any painting decisions for you. For development, I used Pokemon Gold / Silver sprites as I am not an artist. Configure `registries` to define what to paint for the player, objects, walls etc. For `objects`, every object is required to have a `sprite` field to map to a specific image; a `metadata` field is optional, if you want to present an object in a certain orientation, for example. `walls` and `player` do not have these fields supported at the moment.

The broadness of `registries` is to give you more flexibility when dealing with image assets. For example, the development of this project uses Rollup to convert sprites into Base64; this data is shipped with the development build of the project. That means virtually no loading time for sprites during development, but the ultimate build is however many bytes bigger and thus slower to load. In contrast, for the demo build posted above, the assets are hosted on a NextJS server; thus, they are loaded on-demand and do not slow the initial load of the page, but take some amount of time to load from the server. `registries` was designed this way as a tradeoff between user ease and user empowerment over their asset management.

`exitPoints` describe where the museum rooms end. They follow the same locational schema described above: `Spot` and `Area`. If you use this configuration, you must define an `onexit` callback on the `Museum` instance. For example,

```
import { Museum } from 'museum-html';

const museum = new Museum({ ... });

museum.onexit = (exitpoint) => console.log(exitpoint);
```

When a player walks into the exitpoint, `onexit` is triggered. At this point, you are on your own; you can decide to initialize a new `Museum` instance and replace the current instance. `exitPoints` also take arbitrary metadata if you want to define more easily how an exit should be handled.

There is no code at the moment that handles exitpoints out-of-the-box for you, though I'm very tempted to write a manager. The design is so that you have ultimate flexibility on how to handle the change.

With all of this knowledge, let's see how the code ultimately looks like:

```
async function drawMuseum(
    museumArgs,
    playerPosition: Position
) {
    museumContainer.innerHTML = '';

    let cellSize: number;

    if (window.innerWidth > 800) {
        cellSize = 48;
    } else {
        cellSize = 32;
    }
    const museum = new Museum({
        cellSize,
        playerPosition,
        registries,
        ...museumArgs,
    });

    museum.onexit = async (exitPoint: TestExitPoint) => {
        let room: MuseumPartial;

        ({ museumArgs: room } = await import(
        `./rooms/${exitPoint.metadata.enteringRoomId}.args`
        ));

        await drawMuseum(room, exitPoint.metadata.playerPosition);
    };

    const museumElement = await museum.draw();

    museumElement.classList.add(styles.museum);

    museum.addKeyListeners();

    museumContainer.appendChild(museumElement);

    museumElement.focus();
}
```

This is taken from the demo site. The function takes a partial of the `Museum` arguments, which is JSON-compatible and can be stored in a database if needed to. `museumContainer` is an arbitrary open HTML element. You can see that the museum can change size depending on whether the user is on a mobile- or desktop-sized browser. When an exitpoint is hit, a configuration file is asynchronously loaded from the NextJS server and used to create a new museum room.

The rest are API calls. `draw()` must be called to actually populate and paint the museum; merely constructing the `Museum` instance does not start any actions. `draw()` returns the actual HTML instance, which can then be added. `addKeyListeners()` is another API call that actually makes the museum interactable; I made this decision in case any user wanted a purely visual museum, for whatever reason. `focus()` is a part of the [browser's spec](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus) and ensures the user seamlessly transitions from room to room, though I believe it's not recommended by accessibility to focus on an element on the page on initialization. Again, another piece of code that could be added into an out-of-the-box manager.

And that's the spec for this crazy museum.

### Caveats

The museum supports a camera if the generated museum is bigger than the space allocated to it. Thus, if the user moves round, the museum will automatically keep track of the user's position and adjust its view to them.

However, this camera uses scrolling; it does not re-render the museum. Thus the component follows the [CSS "overflow" guidelines](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow), one of which is to have a set height for the component to work. This is a very frustrating tradeoff to me and perhaps I will code the camera in a different way sometime in the future.

### Possible enhancements

- for mobile: hold down tap to continue moving in a certain direction
- create a "manager" instance that will automatically handle all exit points triggers for clients and handles mobile/desktop changes
- very silly idea of using AI to make a copy of the existing paintings to see what happens
