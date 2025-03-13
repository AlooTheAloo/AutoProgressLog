import { interpolateLab } from "d3-interpolate";

export class NWayInterpol {
  private spaces: ((t: number) => string)[] = [];

  constructor(...colors: string[]) {
    for (let i = 0; i < colors.length; i++) {
      this.spaces.push(
        interpolateLab(colors[i], colors[(i + 1) % colors.length]),
      );
    }
  }

  interpolate(t: number): string {
    const floorNumber = Math.floor(t * this.spaces.length);
    const distanceOfFloor = t * this.spaces.length - floorNumber;
    return this.spaces[floorNumber](distanceOfFloor);
  }
}
