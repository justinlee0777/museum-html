import RoomData from '../../data/room.data';
import ICell from '../../models/cell.interface';
import Position from '../../models/position.interface';
import padCenter from '../../utils/pad-center.function';
import RoomVisualization from '../models/room-visualization.model';

interface Graph {
  edges: {
    horizontal: string;
    vertical: string;
  };
}

interface TextRoomConfig {
  cellWidth?: number;
  cellMapOverride?: Partial<Graph>;
}

export default class TextRoom implements RoomVisualization<string> {
  private cellWidth: number;
  private graph: Graph = {
    edges: {
      horizontal: '-',
      vertical: '|',
    },
  };

  constructor(config?: TextRoomConfig) {
    const { cellWidth: cellSize = 5, cellMapOverride } = config ?? {};

    if (cellSize < 1) {
      throw new Error('');
    } else {
      this.cellWidth = cellSize;
    }

    if (cellMapOverride) {
      this.graph = {
        ...this.graph,
        ...cellMapOverride,
      };
    }
  }

  draw(data: RoomData, origin: Position): string {
    const cells = data.getCells(origin);
    const numColumns = cells.length;

    const {
      graph: {
        edges: { vertical },
      },
    } = this;

    const top = this.drawTop(numColumns);

    let result = '';
    cells.forEach((row) => {
      result += `${top}\n`;

      row.forEach((cell) => {
        if (cell) {
          const cellText = this.drawCell(cell);
          result += `${vertical}${cellText}`;
        }
      });
      result += `${vertical}\n`;
    });
    result += top;

    return result;
  }

  drawCell(cell: ICell): string {
    const { cellWidth: cellSize } = this;
    return padCenter('', this.cellWidth, ' ');
  }

  private drawTop(numColumns: number): string {
    const {
      cellWidth: cellSize,
      graph: {
        edges: { horizontal },
      },
    } = this;
    /*
     * <number of edges> = <number of columns> + 1
     * (<number of columns> * <cell size>) + <number of edges>
     * reduces to (<number of columns * (<cell size> + 1)) + 1
     */
    return Array(numColumns * (cellSize + 1) + 1)
      .fill(horizontal)
      .join('');
  }
}
