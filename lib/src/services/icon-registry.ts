/**
 * @license
 * Copyright Datorama. All Rights Reserved.
 *
 * Use of this source code is governed by an Apache License 2.0 license that can be
 * found in the LICENSE file at https://github.com/datorama/client-core/blob/master/LICENSE
 */

import { Injectable } from '@angular/core';
import coreIcons from '../svg/svg';
import { HashMap, kebabCase } from '@datorama/utils';

class SvgIconConfig {
  /**
   * SVG element contents
   * @type {null}
   */
  contents: string = null;

  /**
   * Whether the SVG already contains the valid attributes
   */
  appliedAttributes = false;

  constructor(contents: string) {
    this.contents = contents;
  }
}

@Injectable()
export class IconRegistry {
  private svgMap = new Map<string, SvgIconConfig>();

  private _XMLSerializer;
  private get lazyXMLSerializer() {
    if (!this._XMLSerializer) {
      this._XMLSerializer = new XMLSerializer();
    }
    return this._XMLSerializer;
  }

  constructor() {
    // register the core icons
    this.register(coreIcons);
  }

  /**
   * Register SVG
   * @param {HashMap<string>} svg
   */
  register(svg: HashMap<string>) {
    if (!svg) {
      return;
    }

    const svgKeys = Object.keys(svg);
    for (const key of svgKeys) {
      this.validateSvgKey(key);

      const svgContents = svg[key];
      const config = new SvgIconConfig(svgContents);
      this.svgMap.set(key, config);
    }
  }

  /**
   * Returns the SVG content for the specific key
   * @param {string} key
   * @return {string}
   */
  getSvg(key: string): string {
    const config = this.svgMap.get(key);
    let svgContent;
    if (config) {
      // add default attributes to the SVG
      if (!config.appliedAttributes) {
        this.applySvgAttibutes(config);
      }

      svgContent = config.contents;
    }

    return svgContent;
  }

  /**
   * Check if the SVG key present
   * @param {string} key
   * @return {boolean}
   */
  hasSvg(key: string): boolean {
    return this.svgMap.has(key);
  }

  /**
   * Creates an SVG element from the given SvgConfig
   * and apply the default attributes
   * @param {SvgIconConfig} config
   */
  private applySvgAttibutes(config: SvgIconConfig) {
    const svg = this.svgElementFromString(config.contents);
    this.setSvgAttributes(svg);
    config.contents = this.getSvgContents(svg);
    config.appliedAttributes = true;
  }

  private getSvgContents(svgElement: SVGElement) {
    let contents = svgElement.outerHTML;
    // handle IE11
    if (contents === undefined) {
      contents = this.lazyXMLSerializer.serializeToString(svgElement);
    }

    return contents;
  }

  /**
   * Creates a DOM element from the given SVG string.
   */
  private svgElementFromString(str: string): SVGElement {
    const div = document.createElement('DIV');
    div.innerHTML = str;
    const svg = div.querySelector('svg') as SVGElement;
    if (!svg) {
      throw Error('<svg> tag not found');
    }

    return svg;
  }

  /**
   * Sets the default attributes for an SVG element to be used as an icon.
   */
  private setSvgAttributes(svg: SVGElement): SVGElement {
    if (!svg.getAttribute('xmlns')) {
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }
    svg.setAttribute('fit', '');
    svg.setAttribute('height', '100%');
    svg.setAttribute('width', '100%');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    // Disable IE11 default behavior to make SVGs focusable.
    svg.setAttribute('focusable', 'false');

    return svg;
  }

  /**
   * Make sure the SVG key is a kebabCase
   * @param {string} svgKey
   */
  private validateSvgKey(svgKey: string) {
    const isValid = svgKey && kebabCase(svgKey) === svgKey;
    if (!isValid) {
      throw new Error(`The SVG key '${svgKey}' should be in kebabCase.`);
    }
  }

  /**
   * Return all registered icons
   * @return {string[]}
   */
  getAll(): string[] {
    return Array.from(this.svgMap.keys());
  }
}
