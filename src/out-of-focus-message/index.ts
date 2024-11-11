import styles from './index.module.css';

export default class OutOfFocusMessage {
  private initialized:
    | {
        container: HTMLElement;
      }
    | undefined;

  get element(): HTMLElement | undefined {
    return this.initialized?.container;
  }

  draw(): void {
    const container = document.createElement('div');

    container.className = styles.outOfFocusMessage;
    container.textContent = 'The museum is not in focus. Please click it.';

    this.initialized = {
      container,
    };
  }
}
