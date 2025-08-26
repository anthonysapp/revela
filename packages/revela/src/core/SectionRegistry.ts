import type { SectionName } from "../types";
import { Section } from "./Section";

export class SectionRegistry {
  private map = new Map<SectionName, new (el: HTMLElement) => Section<any>>();

  register(name: SectionName, ctor: new (el: HTMLElement) => Section<any>) {
    this.map.set(name, ctor);
    return this;
  }

  get(name: SectionName) {
    return this.map.get(name);
  }
  has(name: SectionName) {
    return this.map.has(name);
  }
}
