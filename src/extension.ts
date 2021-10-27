import * as vscode from "vscode";
import commands, { pray } from "./commands";
import { ExtensionConfig } from "./config";
import { CONFIG_STORAGE_KEY } from "./constants";
import { log, LogLevel } from "./logger";
import { toStartOfDay } from "./util";

export async function activate(context: vscode.ExtensionContext) {
  if (context.extensionMode === vscode.ExtensionMode.Development) {
    log(LogLevel.always, "Running in development mode. Clearing global state.");
    // context.globalState.update(CONFIG_STORAGE_KEY, undefined);
  }
  const extensionConfig = await ExtensionConfig.init(context.globalState);
  context.subscriptions.push(
    ...commands.map((command) => command(extensionConfig))
  );
  await remindOnStartup(extensionConfig);
}

export function deactivate() {}

async function remindOnStartup(
  extensionConfig: ExtensionConfig
): Promise<void> {
  const config = extensionConfig.get();
  if (
    Boolean(ExtensionConfig.getWorkspaceConfiguration("remindOnStartup")) &&
    config.lastPrayed?.toDateString() !== toStartOfDay(new Date()).toDateString()
  ) {
    const items = ["Yes", "No", "Silence for today"];
    const chosen = await vscode.window.showInformationMessage(
      "Would you like to pray?",
      ...items
    );
    if (chosen === items[0]) {
      pray(extensionConfig);
    } else if (chosen === items[2]) {
      extensionConfig.update({ lastPrayed: toStartOfDay(new Date()) });
    }
  }
}
