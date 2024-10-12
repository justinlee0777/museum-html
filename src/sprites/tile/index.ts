import TileSprite from '../../assets/tile.png';

import SPRITE_SIZE from '../../consts/sprite-size.const';
import MuseumArgs from '../../models/museum-args.model';
import styles from './index.module.css';

type Args = Pick<MuseumArgs, 'cellSize'>;

export default function drawTileSprite({ cellSize }: Args): HTMLCanvasElement {
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

  image.src = TileSprite;

  return sprite;
}
