export class Logger {
  public static log(message: any, tag: string = "Info") {
    console.log(`[${tag}] `, message);
  }
}
