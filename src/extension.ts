// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import commands from "./commands";
import { onActivate as activateConfig } from "./config";

export async function activate(context: vscode.ExtensionContext) {
  activateConfig(context);

  context.subscriptions.push(...commands);
}

export function deactivate() {}
