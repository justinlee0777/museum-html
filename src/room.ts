type Position = [number, number];

interface ICell {
  position: Position;

  top?: ICell;
  right?: ICell;
  bottom?: ICell;
  left?: ICell;

  hasPlayer?: true;
}

interface RoomConfig {
  height: number;
  player?: {
    position: Position;
  };
  width: number;
}

type RoomDataConfig = Pick<RoomConfig, 'height' | 'player' | 'width'>;

export class RoomData {
  private cells: Array<Array<ICell | undefined>>;
  private playerCell?: ICell;

  constructor({ height, width, player }: RoomDataConfig) {
    const cells = (this.cells = Array(height)
      .fill(undefined)
      .map((_, y) =>
        Array(width)
          .fill(undefined)
          .map<ICell>((_, x) => ({
            position: [x, y],
          }))
      ));

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const cell = cells[i][j];

        if (i > 0) {
          cell.top = cells[i - 1][j];
        }
        if (j < width - 1) {
          cell.right = cells[i][j - 1];
        }
        if (i < height - 1) {
          cell.bottom = cells[i + 1][j];
        }
        if (j > 0) {
          cell.left = cells[i][j + 1];
        }
      }
    }

    if (player) {
      const { position } = player;
      this.placePlayer(position);
    }
  }

  public *getCells(): Generator<ICell> {
    const { cells } = this;

    const height = cells.length;

    for (let i = 0; i < height; i++) {
      const width = cells[i].length;
      for (let j = 0; j < width; j++) {
        const cell = cells[i][j];

        yield cell;
      }
    }
  }

  public movePlayer([xd, yd]: Position): void {
    if (this.playerCell) {
      const [x, y] = this.playerCell.position;

      this.placePlayer([x + xd, y + yd]);
    } else {
      throw new Error('');
    }
  }

  public placePlayer([x, y]: Position): void {
    const proposedCell = this.cells[y]?.[x] ?? null;
    const validCell = Boolean(proposedCell);

    if (validCell) {
      if (this.playerCell) {
        delete this.playerCell.hasPlayer;
        this.playerCell = null;
      }

      this.playerCell = proposedCell;
      proposedCell.hasPlayer = true;
    }
  }
}

export class RoomUI {
  private mazeElement: HTMLElement;

  public draw(data: RoomData): HTMLElement {
    const cells = [...data.getCells()];

    const hasPlayer = 'has-player';

    if (this.mazeElement) {
      this.mazeElement.querySelectorAll('.cell').forEach((cellElement, i) => {
        const cell = cells[i];
        if (cell.hasPlayer) {
          cellElement.classList.add(hasPlayer);
        } else {
          cellElement.classList.remove(hasPlayer);
        }
      });
    } else {
      const mazeElement = (this.mazeElement = document.createElement('div'));
      mazeElement.className = 'maze';

      for (const cell of cells) {
        mazeElement.appendChild(this.drawCell(cell));
      }

      return mazeElement;
    }
  }

  private drawCell(cell: ICell): HTMLElement {
    const cellElement = document.createElement('div');
    cellElement.classList.add('cell');

    if (cell.hasPlayer) {
      cellElement.classList.add('has-player');
    }

    return cellElement;
  }
}
