import { interpolateHcl, piecewise } from "d3-interpolate";

export class NWayInterpol {
  private interp: (t: number) => string;

  /**
   * @param colors an array of CSS-color strings, e.g. ["red", "#0f0", "blue"]
   */
  constructor(...colors: string[]) {
    if (colors.length < 2) {
      throw new Error("Need at least two colors");
    }
    // append first color at end to close loop
    const looped = [...colors, colors[0]];
    // build one continuous piecewise HCL interp over [0,1]
    this.interp = piecewise(interpolateHcl, looped);
  }

  /**
   * @param t a number in [0,1), wraps modulo 1 if out of range
   * @returns interpolated CSS-color string
   */
  interpolate(t: number): string {
    // wrap into [0,1)
    const u = ((t % 1) + 1) % 1;
    return this.interp(u);
  }
}
