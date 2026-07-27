export class BaseProfile {
  constructor(name) {
    this.name = name;
  }

  detect() {
    return false;
  }

  parse() {
    return [];
  }
}