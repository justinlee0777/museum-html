import styles from './index.module.css';
import helpIcon from '../assets/help_outline_24dp_5F6368.svg';
import closeIcon from '../assets/close_24dp_5F6368.svg';

export enum ButtonBarState {
  WALKING,
  EXAMINE_PAINTING,
  EXAMINE_TEXT,
  EXAMINE_FRAME,
  HELP_MENU,
}

export interface MobileButtonBarConfig {
  mobile: boolean;
  walking: {
    onhelpmenuopen: () => void;
  };
  helpMenu: {
    onclose: () => void;
  };
  examinePainting: {
    onclose: () => void;
    onzoomin: () => void;
    onzoomout: () => void;
  };
  examineText: {
    onclose: () => void;
  };
  examineFrame: {
    onclose: () => void;
  };
}

export class MobileButtonBar {
  private initialized:
    | {
        container: HTMLElement;
      }
    | undefined;

  get element(): HTMLElement | undefined {
    return this.initialized?.container;
  }

  constructor(private config: MobileButtonBarConfig) {}

  draw(state: ButtonBarState): void {
    let container = this.initialized?.container;

    if (!container) {
      container = document.createElement('div');

      container.className = styles.buttonBar;

      this.initialized = {
        container,
      };
    }

    // Wipe out current elements.
    container.innerHTML = '';

    switch (state) {
      case ButtonBarState.WALKING:
        this.drawWalkButtons();
        break;
      case ButtonBarState.EXAMINE_TEXT:
        this.drawExamineButtons(this.config.examineText.onclose);
        break;
      case ButtonBarState.EXAMINE_FRAME:
        this.drawExamineButtons(this.config.examineFrame.onclose);
        break;
      case ButtonBarState.EXAMINE_PAINTING:
        this.drawExaminePaintingButtons();
        break;
      case ButtonBarState.HELP_MENU:
        this.drawHelpMenuButtons();
        break;
    }
  }

  private drawWalkButtons(): void {
    if (!this.config.mobile) {
      const { container } = this.initialized!;
      const {
        walking: { onhelpmenuopen },
      } = this.config;

      const openHelp = document.createElement('button');

      openHelp.classList.add(styles.iconButton);
      openHelp.addEventListener('focusout', (event) => event.stopPropagation());
      openHelp.onclick = (event) => {
        event.stopPropagation();
        onhelpmenuopen();
      };

      const openHelpIcon = document.createElement('img');
      openHelpIcon.className = styles.imageIcon;
      openHelpIcon.src = helpIcon;

      openHelp.appendChild(openHelpIcon);

      container.appendChild(openHelp);
    }
  }

  private drawExaminePaintingButtons(): void {
    const { container } = this.initialized!;
    const {
      examinePainting: { onclose, onzoomin, onzoomout },
    } = this.config;

    const closeHelp = document.createElement('button');
    closeHelp.classList.add(styles.iconButton);

    const closeHelpIcon = document.createElement('img');
    closeHelpIcon.className = styles.imageIcon;
    closeHelpIcon.src = closeIcon;

    closeHelp.appendChild(closeHelpIcon);

    closeHelp.onclick = (event) => {
      event.stopPropagation();
      onclose();
    };

    const zoomInButton = document.createElement('button');

    zoomInButton.classList.add(styles.iconButton);
    zoomInButton.textContent = '+';
    zoomInButton.onclick = (event) => {
      event.stopPropagation();
      onzoomin();
    };

    const zoomOutButton = document.createElement('button');
    zoomOutButton.classList.add(styles.iconButton);
    zoomOutButton.textContent = '-';
    zoomOutButton.onclick = (event) => {
      event.stopPropagation();
      onzoomout();
    };

    container.append(closeHelp, zoomInButton, zoomOutButton);
  }

  private drawHelpMenuButtons(): void {
    if (!this.config.mobile) {
      const { container } = this.initialized!;
      const {
        helpMenu: { onclose },
      } = this.config;

      const closeHelp = document.createElement('button');
      closeHelp.classList.add(styles.iconButton);

      const closeHelpIcon = document.createElement('img');
      closeHelpIcon.className = styles.imageIcon;
      closeHelpIcon.src = closeIcon;

      closeHelp.appendChild(closeHelpIcon);

      closeHelp.onclick = (event) => {
        event.stopPropagation();
        onclose();
      };

      container.appendChild(closeHelp);
    }
  }

  private drawExamineButtons(onclose: () => void): void {
    if (!this.config.mobile) {
      const { container } = this.initialized!;

      const closeHelp = document.createElement('button');
      closeHelp.classList.add(styles.iconButton);

      const closeHelpIcon = document.createElement('img');
      closeHelpIcon.className = styles.imageIcon;
      closeHelpIcon.src = closeIcon;

      closeHelp.appendChild(closeHelpIcon);

      closeHelp.onclick = (event) => {
        event.stopPropagation();
        onclose();
      };

      container.appendChild(closeHelp);
    }
  }
}
