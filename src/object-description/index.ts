import styles from './index.module.css';

import { TextMusemObjectInteraction } from '../models/museum-object.model';

export default class ObjectDescription {
  private initialized:
    | {
        container: HTMLElement;
      }
    | undefined;

  get element(): HTMLElement | undefined {
    return this.initialized?.container;
  }

  constructor(private object: Partial<TextMusemObjectInteraction>) {}

  draw(): HTMLElement {
    const { artist, title, context, make, acquisition, description } =
      this.object;

    const container = document.createElement('div');
    container.className = styles.objectDescription;

    if (artist) {
      const artistElement = document.createElement('p');
      artistElement.className = styles.artist;
      artistElement.textContent = artist;

      container.appendChild(artistElement);
    }

    if (title) {
      const titleElement = document.createElement('p');
      titleElement.className = styles.title;
      titleElement.textContent = title;

      container.appendChild(titleElement);
    }

    if (context) {
      const contextElement = document.createElement('p');
      contextElement.textContent = context;

      container.appendChild(contextElement);
    }

    if (make) {
      const makeElement = document.createElement('p');
      makeElement.textContent = make;

      container.appendChild(makeElement);
    }

    if (acquisition) {
      const acquisitionElement = document.createElement('p');
      acquisitionElement.className = styles.acquisition;
      acquisitionElement.textContent = acquisition;

      container.appendChild(acquisitionElement);
    }

    if (description) {
      const descriptionElement = document.createElement('p');
      descriptionElement.className = styles.description;
      descriptionElement.textContent = description;

      container.appendChild(descriptionElement);
    }

    this.initialized = {
      container,
    };

    return container;
  }
}
