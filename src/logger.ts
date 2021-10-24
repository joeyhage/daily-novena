import * as vscode from "vscode";
import { COMMAND_PREFIX } from "./constants";

let outputChannel: vscode.OutputChannel | undefined;

export enum LogLevel {
  always,
  none,
  error,
  warning,
  info,
  debug,
}

let logLevel: LogLevel | undefined = undefined;

export function log(level: LogLevel, message: any) {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel("Daily Novena");
  }
  if (!logLevel) {
    const configLogLevel = <keyof typeof LogLevel>(
      String(vscode.workspace.getConfiguration(COMMAND_PREFIX).get("logLevel"))
    );
    logLevel = LogLevel[configLogLevel] || LogLevel.error;
  }
  if (level <= logLevel) {
    outputChannel.appendLine(
      `${LogLevel[level].toUpperCase()}: ${JSON.stringify(message)}`
    );
  }
}

export function setLevel(level?: LogLevel) {
  logLevel = level;
}
