import RoomData from '../../data/room.data';
import NavigationInteractive from '../../interactive/navigation.interactive';
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
    const beginningCell = data.beginning;

    const {
      cellWidth,
      graph: {
        edges: { horizontal, vertical },
      },
    } = this;

    let result = '';
    cells.forEach((row, j) => {
      let rowText = '';
      let verticalText = '';

      row.forEach((cell, i) => {
        const position = [
          beginningCell[0] + i,
          beginningCell[1] + j,
        ] as Position;

        if (cell) {
          const cellText = this.drawCell(cell);
          rowText += `${vertical}${cellText}${vertical}`;
          verticalText += Array(cellWidth + 2)
            .fill(horizontal)
            .join('');
        } else {
          const blankText = this.drawBlank(position);
          rowText += ` ${blankText} `;
          verticalText += Array(cellWidth + 2)
            .fill(' ')
            .join('');
        }
      });
      result += `${verticalText}\n${rowText}\n${verticalText}\n`;
    });

    return result;
  }

  drawCell(cell: ICell): string {
    const { cellWidth } = this;
    return padCenter('', cellWidth, ' ');
  }

  drawBlank(position: Position): string {
    const { cellWidth } = this;
    return padCenter('', cellWidth, ' ');
  }

  addNavigation(interactive: NavigationInteractive): void {
    throw new Error('No navigation interactive allowed.');
  }

  destroy(): void {
    // Nothing to do
  }
}
