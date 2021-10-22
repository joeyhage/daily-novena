import * as vscode from "vscode";
import { COMMAND_PREFIX } from "./constants";

let outputChannel: vscode.OutputChannel | undefined;

export enum LogLevel {
  none = 0,
  error,
  warning,
  info,
  debug,
  always,
}

let logLevel: LogLevel | undefined;

export function log(level: LogLevel, message: any) {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel("Daily Novena");
  }
  if (!(logLevel || level === LogLevel.always)) {
    logLevel =
      vscode.workspace.getConfiguration(COMMAND_PREFIX).get("logLevel") ||
      LogLevel.error;
    outputChannel.appendLine(JSON.stringify({ logLevel }));
  }
  if (level === LogLevel.always || level <= logLevel!) {
    outputChannel.appendLine(`${LogLevel[level]}: ${JSON.stringify(message)}`);
  }
}

export async function setLevel(level: LogLevel) {
  logLevel = level;
  log(LogLevel.always, { message: "setLevel", level: LogLevel[level] });
}
