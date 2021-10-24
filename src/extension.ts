// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import commands from "./commands";
import { ExtensionConfig } from "./config";
import { CONFIG_STORAGE_KEY } from "./constants";
import { log, LogLevel } from "./logger";

export async function activate(context: vscode.ExtensionContext) {
  if (context.extensionMode === vscode.ExtensionMode.Development) {
    log(LogLevel.always, "Running in development mode. Clearing global state.");
    context.globalState.update(CONFIG_STORAGE_KEY, undefined);
  }
  const extensionConfig = new ExtensionConfig(context.globalState);
  context.subscriptions.push(
    ...commands.map((command) => command(extensionConfig))
  );
}

export function deactivate() {}
