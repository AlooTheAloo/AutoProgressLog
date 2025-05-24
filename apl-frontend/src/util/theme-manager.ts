type ThemeListener = (resolvedTheme: "light" | "dark", rawTheme: Theme) => void;
export type Theme = "light" | "dark" | "system";
export const colorAccentOptions = [
  "#22A7D2",
  "#22C8CD",
  "#49EB7E",
  "#8B61D0",
  "#B9EB4F",
  "#F74E8F",
  "#FF8329",
  "#FFCF25",
] as const;

export type AccentColor = (typeof colorAccentOptions)[number];

export class ThemeManager {
  private static _theme: Theme = "dark";
  private static _accentColor = "#22A7D2";
  private static _listeners: ThemeListener[] = [];

  // the media‐query we’ll use to watch system dark/light changes
  private static mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  // attach once at class‐load time
  public static init() {
    // wire up system changes → our handler
    this.mediaQuery.addEventListener(
      "change",
      this.handleSystemChange.bind(this)
    );
    // on init, read stored theme and apply it
    const stored = (localStorage.getItem("theme") as Theme) || "dark";
    this.setTheme(stored);
    this.setAccentColor(this.getAccentColor());
  }

  private static handleSystemChange(e: MediaQueryListEvent) {
    // only do anything when user actually chose “system”
    if (this._theme === "system") {
      this.applyResolvedTheme(e.matches ? "dark" : "light", this._theme);
    }
  }

  /** Set user prefered accent color */
  static setAccentColor(color: AccentColor) {
    this._accentColor = color;
    document.documentElement.style.setProperty("--primary-color", color);
    localStorage.setItem("accentColor", color);
    // apply it to the <html> element
  }

  /** Set user preference: light / dark / system */
  static setTheme(theme: Theme) {
    this._theme = theme;
    console.log("setting theme to", theme);
    localStorage.setItem("theme", theme);

    if (theme === "system") {
      // immediately apply whatever the OS is currently
      const sys = this.mediaQuery.matches ? "dark" : "light";
      console.log("system is", sys);
      this.applyResolvedTheme(sys, "system");
    } else {
      console.log("applying the resolved theme", theme);
      this.applyResolvedTheme(theme, theme);
    }
  }

  /** Returns the stored accent color */
  static getAccentColor(): AccentColor {
    return (localStorage.getItem("accentColor") as AccentColor) || "#22A7D2";
  }

  /** Returns the stored preference (could be “system”) */
  static getTheme(): Theme {
    return (localStorage.getItem("theme") as Theme) || "dark";
  }

  /** Notify all listeners and toggle <html> class */
  private static applyResolvedTheme(resolved: "light" | "dark", raw: Theme) {
    console.log("Applying theme:", resolved);
    document.documentElement.classList.toggle("dark", resolved === "dark");
    for (const cb of this._listeners) cb(resolved, raw);
    console.log("Applied theme:", this._theme, "→", resolved);
  }

  /** Subscribe to changes in the *resolved* (light/dark) theme. */
  static onThemeChange(cb: ThemeListener): () => void {
    this._listeners.push(cb);
    // fire immediately with current resolved
    const current =
      this._theme === "system"
        ? this.mediaQuery.matches
          ? "dark"
          : "light"
        : this._theme;
    cb(current, this._theme);
    return () => {
      this._listeners = this._listeners.filter((x) => x !== cb);
    };
  }
}
