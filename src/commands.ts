import * as vscode from "vscode";
import { ExtensionConfig } from "./config";
import { COMMAND_PREFIX, COMMUNITY_NOVENA, NOVENA_DAYS } from "./constants";
import {
  getLatestNovenaMetadata,
  getNovenaList,
  getNovenaText,
} from "./novena-api";
import { ExtensionConfigProps, Novena } from "./types";
import { log, LogLevel } from "./logger";
import { toStartOfDay } from "./util";

const retrievePrayer = async (
  config: ExtensionConfigProps
): Promise<Partial<Novena> | undefined> => {
  let novena: Partial<Novena> | undefined;
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Loading Novena",
      cancellable: false,
    },
    async (progress) => {
      try {
        progress?.report({ increment: 50 });
        const novenaText = await getNovenaText(config);
        novena = {
          title: config.novenaName,
          day: config.novenaDay,
          novenaLink: config.novenaLink,
          text: novenaText,
        };
      } catch (e) {
        log(LogLevel.error, e);
        novena = undefined;
      }
    }
  );
  return novena;
};

const displayPrayer = (novena: Partial<Novena>) => {
  const column = vscode.window.activeTextEditor
    ? vscode.window.activeTextEditor.viewColumn
    : 1;
  const panel = vscode.window.createWebviewPanel(
    COMMAND_PREFIX,
    `${novena.title} - Day ${novena.day}`,
    column || 1
  );
  const postDate = novena.postDate
    ? `<p>Posted on ${novena.postDate.toLocaleDateString()}</p>`
    : "";
  panel.webview.html = `<h1>${novena.title}</h1>${postDate}<h2>Day ${novena.day}</h2>${novena.text}`;
};

export const pray = async (extensionConfig: ExtensionConfig) => {
  const config = extensionConfig.get();
  const novena = await retrievePrayer(config);
  if (novena) {
    if (config.prayCommunityNovena) {
      novena.postDate = config.mostRecentCommunityDate;
    }
    displayPrayer(novena);
    extensionConfig.update({
      novenaDay: <Novena["day"]>(
        (config.novenaDay! < 9 ? config.novenaDay! + 1 : config.novenaDay!)
      ),
      lastPrayed: toStartOfDay(new Date()),
    });
  } else {
    vscode.window.showErrorMessage("An error occurred loading the Novena");
  }
};

const prayCommand = (extensionConfig: ExtensionConfig) => {
  return vscode.commands.registerCommand(`${COMMAND_PREFIX}.pray`, async () => {
    await pray(extensionConfig);
  });
};

const chooseNovenaCommand = (extensionConfig: ExtensionConfig) => {
  return vscode.commands.registerCommand(
    `${COMMAND_PREFIX}.chooseNovena`,
    async () => {
      try {
        const chosen = await vscode.window.showQuickPick(getNovenaList(), {
          canPickMany: false,
          ignoreFocusOut: false,
        });
        if (chosen?.label === COMMUNITY_NOVENA) {
          await extensionConfig.update(
            ExtensionConfig.convertFromCommunity(
              await getLatestNovenaMetadata()
            )
          );
        } else if (chosen) {
          await extensionConfig.update(
            ExtensionConfig.convertFromChosen(chosen)
          );
        }
      } catch (e) {
        log(LogLevel.error, { message: "Error in chooseNovenaCommand", e });
      }
    }
  );
};

const changeNovenaDayCommand = (extensionConfig: ExtensionConfig) => {
  return vscode.commands.registerCommand(
    `${COMMAND_PREFIX}.changeNovenaDay`,
    async () => {
      const chosen = await vscode.window.showQuickPick(
        NOVENA_DAYS.map((day) => String(day)),
        {
          canPickMany: false,
        }
      );
      if (chosen) {
        await extensionConfig.update({
          novenaDay: <Novena["day"]>Number(chosen),
        });
      }
    }
  );
};

export default [prayCommand, chooseNovenaCommand, changeNovenaDayCommand];
