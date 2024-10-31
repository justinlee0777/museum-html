import styles from './index.module.css';

export default class HelpMenu {
  private initialized:
    | {
        container: HTMLElement;
      }
    | undefined;

  get element(): HTMLElement | undefined {
    return this.initialized?.container;
  }

  draw(): void {
    interface Action {
      key: string;
      description: string;
    }

    const generalActions: Array<Action> = [
      {
        key: '\u21E6',
        description: 'Left',
      },
      {
        key: '\u21E7',
        description: 'Up',
      },
      {
        key: '\u21E8',
        description: 'Right',
      },
      {
        key: '\u21E9',
        description: 'Down',
      },
      {
        key: 'Enter',
        description: 'Help',
      },
    ];

    const museumActions: Array<Action> = [
      {
        key: 'A',
        description: 'Interact',
      },
    ];

    const menuActions: Array<Action> = [
      {
        key: 'Escape',
        description: 'Close',
      },
      {
        key: '+',
        description: 'Zoom in',
      },
      {
        key: '-',
        description: 'Zoom out',
      },
    ];

    const helpMenu = document.createElement('div');
    helpMenu.classList.add(styles.helpMenu);

    const generalActionsHeader = document.createElement('h3');
    generalActionsHeader.classList.add(styles.helpMenuHeader);
    generalActionsHeader.textContent = 'General';

    const museumActionsHeader = document.createElement('h3');
    museumActionsHeader.classList.add(styles.helpMenuHeader);
    museumActionsHeader.textContent = 'Museum';

    const menuActionsHeader = document.createElement('h3');
    menuActionsHeader.classList.add(styles.helpMenuHeader);
    menuActionsHeader.textContent = 'Menu';

    function createActionElement({ key, description }: Action): HTMLElement {
      const actionElement = document.createElement('span');

      const keyElement = document.createElement('span');
      keyElement.classList.add(styles.helpMenuKey);
      keyElement.textContent = key;

      actionElement.innerHTML = `${keyElement.outerHTML} ${description}`;

      return actionElement;
    }

    helpMenu.append(
      generalActionsHeader,
      ...generalActions.map(createActionElement),
      museumActionsHeader,
      ...museumActions.map(createActionElement),
      menuActionsHeader,
      ...menuActions.map(createActionElement)
    );

    this.initialized = {
      container: helpMenu,
    };
  }
}
