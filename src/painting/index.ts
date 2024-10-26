import styles from './index.module.css';

interface IncrementZoomArgs {
  offset: number;
}

interface AbsoluteZoomArgs {
  percentage: number;
}

type ZoomArgs = IncrementZoomArgs | AbsoluteZoomArgs;

interface DrawArgs {
  zoom?: ZoomArgs;
}

export default class Painting {
  initialized:
    | {
        container: HTMLDivElement;
        image: HTMLImageElement;
      }
    | undefined;

  get element(): HTMLElement | undefined {
    return this.initialized?.container;
  }

  private currentZoom = 1;

  constructor(
    private height: number,
    private width: number,
    private paintingUrl: string
  ) {}

  draw({ zoom }: DrawArgs = {}): void {
    let { initialized, currentZoom, height, width } = this;

    if (zoom) {
      if ('offset' in zoom) {
        this.currentZoom = currentZoom = Math.max(
          1,
          currentZoom + 0.25 * zoom.offset
        );
      } else {
        this.currentZoom = currentZoom = zoom.percentage;
      }
    }

    let image: HTMLImageElement;

    if (!initialized) {
      const container = document.createElement('div');
      container.className = styles.imageContainer;

      image = document.createElement('img');
      image.classList.add(styles.image);

      const zoomOut = document.createElement('button');
      zoomOut.textContent = '-';

      const zoomIn = document.createElement('button');
      zoomIn.textContent = '+';

      container.appendChild(image);

      this.initialized = {
        container,
        image,
      };
    } else {
      image = initialized.image;
    }

    image.height = height;
    image.width = width;
    image.src = this.paintingUrl;
    image.style.transform = `scale(${currentZoom}, ${currentZoom})`;
  }

  zoomIn() {
    this.draw({ zoom: { offset: 1 } });
  }

  zoomOut() {
    this.draw({ zoom: { offset: -1 } });
  }
}
