export class Logger {
  static log(message: string, instance?: string): void {
    this.buildLog(message, ColorLog.Green, instance);
  }

  static warn(message: string, instance?: string): void {
    this.buildLog(message, ColorLog.Yellow, instance);
  }

  static error(message: string, instance?: string): void {
    this.buildLog(message, ColorLog.Red, instance);
  }

  static info(message: string, instance?: string): void {
    this.buildLog(message, ColorLog.Blue, instance);
  }

  static debug(message: string, instance?: string): void {
    this.buildLog(message, ColorLog.Magenta, instance);
  }

  static verbose(message: string, instance?: string): void {
    this.buildLog(message, ColorLog.Cyan, instance);
  }

  private static buildLog(
    message: string,
    color: ColorLog,
    instance?: string,
  ): void {
    const date = new Date();
    const Instance = instance ? ` [${instance}]` : '';
    console.log(
      `${color}[${date.toDateString()} - ${date.toLocaleTimeString()}]${Instance} -> ${message} ${ColorLog.Clear}`,
    );
  }
}

enum ColorLog {
  Red = '\x1b[31m',
  Green = '\x1b[32m',
  Blue = '\x1b[34m',
  Yellow = '\x1b[33m',
  Cyan = '\x1b[36m',
  Magenta = '\x1b[35m',
  White = '\x1b[37m',
  Clear = '\x1b[0m',
}
