import TileSpriteImage from '../../assets/tile.png';

import SPRITE_SIZE from '../../consts/sprite-size.const';
import MuseumArgs from '../../models/museum-args.model';
import styles from './index.module.css';

type Args = Pick<MuseumArgs, 'cellSize'>;

export default class TileSprite {
  sprite: HTMLCanvasElement | undefined;

  constructor(private args: Args) {}

  draw(): void {
    const { cellSize } = this.args;

    const sprite = document.createElement('canvas');

    sprite.className = styles.tileSprite;

    sprite.width = cellSize;
    sprite.height = cellSize;

    const image = new Image();

    image.onload = () => {
      const context = sprite.getContext('2d')!;
      context.imageSmoothingEnabled = false;

      context.drawImage(
        image,
        0,
        0,
        SPRITE_SIZE,
        SPRITE_SIZE,
        0,
        0,
        cellSize,
        cellSize
      );
    };

    image.src = TileSpriteImage;

    this.sprite = sprite;
  }
}
