import * as vscode from "vscode";
import { getConfig, updateConfig } from "./config";
import { COMMAND_PREFIX, COMMUNITY_NOVENA, NOVENA_DAYS } from "./constants";
import {
  getLatestNovenaMetadata,
  getNovenaList,
  getNovenaText,
} from "./novena-api";
import { Novena } from "./types";
import { log } from "./util";

const prayCommand = vscode.commands.registerCommand(
  `${COMMAND_PREFIX}.pray`,
  async () => {
    const novena: Partial<Novena> = {};
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Loading Novena",
        cancellable: false,
      },
      async (progress) => {
        const config = await getConfig();
        if (config) {
          progress.report({ increment: 50 });
          const novenaText = await getNovenaText(config);
          novena.title = config.novenaName!;
          novena.day = config.novenaDay!;
          novena.novenaLink = config.novenaLink;
          novena.text = novenaText;
        } else {
          vscode.window.showErrorMessage(
            "An error occurred loading the Novena"
          );
        }
      }
    );
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : 1;
    const panel = vscode.window.createWebviewPanel(
      COMMAND_PREFIX,
      `${novena.title} - Day ${novena.day}`,
      column || 1
    );
    panel.webview.html = `<h1>${novena.title}</h1><h2>Day ${novena.day}</h2>${novena.text}`;
  }
);

const chooseNovenaCommand = vscode.commands.registerCommand(
  `${COMMAND_PREFIX}.chooseNovena`,
  async () => {
    try {
      const chosen = await vscode.window.showQuickPick(getNovenaList(), {
        canPickMany: false,
        ignoreFocusOut: false,
      });
      if (chosen?.label === COMMUNITY_NOVENA) {
        const novena = await getLatestNovenaMetadata();
        await updateConfig({
          prayCommunityNovena: true,
          novenaName: novena.title,
          novenaLink: novena.novenaLink,
          novenaDay: novena.day,
          lastChecked: new Date(),
          lastPrayed: undefined,
        });
      } else if (chosen) {
        await updateConfig({
          prayCommunityNovena: false,
          novenaName: chosen?.label,
          novenaLink: chosen?.detail,
          novenaDay: 1,
          lastChecked: new Date(),
          lastPrayed: undefined,
        });
      }
    } catch (e) {
      log({ e });
    }
  }
);

const chooseNovenaDayCommand = vscode.commands.registerCommand(
  `${COMMAND_PREFIX}.chooseNovenaDay`,
  async () => {
    const chosen = await vscode.window.showQuickPick(
      NOVENA_DAYS.map((day) => String(day)),
      {
        canPickMany: false,
      }
    );
    log({ chosen });
    if (chosen) {
      await updateConfig({
        novenaDay: <Novena["day"]>Number(chosen),
      });
    }
  }
);

export default [prayCommand, chooseNovenaCommand, chooseNovenaDayCommand];
