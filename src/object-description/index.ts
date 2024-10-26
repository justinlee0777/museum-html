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

  constructor(private object: TextMusemObjectInteraction) {}

  draw(): void {
    const { artist, title, context, make, acquisition, description } =
      this.object;

    const container = document.createElement('div');
    container.className = styles.objectDescription;

    const artistElement = document.createElement('p');
    artistElement.className = styles.artist;
    artistElement.textContent = artist;

    const titleElement = document.createElement('p');
    titleElement.className = styles.title;
    titleElement.textContent = title;

    const contextElement = document.createElement('p');
    contextElement.textContent = context;

    const makeElement = document.createElement('p');
    makeElement.textContent = make;

    const acquisitionElement = document.createElement('p');
    acquisitionElement.className = styles.acquisition;
    acquisitionElement.textContent = acquisition;

    const descriptionElement = document.createElement('p');
    descriptionElement.className = styles.description;
    descriptionElement.textContent = description;

    container.append(
      artistElement,
      titleElement,
      contextElement,
      makeElement,
      acquisitionElement,
      descriptionElement
    );

    this.initialized = {
      container,
    };
  }
}
