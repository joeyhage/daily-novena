import * as vscode from "vscode";

let outputChannel: vscode.OutputChannel;

export function log(message: any) {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel("Daily Novena");
  }
  outputChannel.appendLine(JSON.stringify(message));
}
