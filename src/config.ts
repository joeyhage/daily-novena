import * as vscode from "vscode";
import { COMMAND_PREFIX, CONFIG_STORAGE_KEY } from "./constants";
import { getLatestNovenaMetadata } from "./novena-api";
import { ExtensionConfigProps, Novena } from "./types";
import { log, LogLevel } from "./logger";
import { toStartOfDay } from "./util";

export class ExtensionConfig {
  private readonly globalState: vscode.ExtensionContext["globalState"];

  constructor(globalState: vscode.ExtensionContext["globalState"]) {
    this.globalState = globalState;
  }

  static async init(
    globalState: vscode.ExtensionContext["globalState"]
  ): Promise<ExtensionConfig> {
    if (!globalState.get(CONFIG_STORAGE_KEY)) {
      const extensionConfig = new ExtensionConfig(globalState);

      await extensionConfig.update(
        ExtensionConfig.convertFromCommunity(await getLatestNovenaMetadata())
      );
      globalState.setKeysForSync([CONFIG_STORAGE_KEY]);
      return extensionConfig;
    }
    return new ExtensionConfig(globalState);
  }

  get(): ExtensionConfigProps {
    const config =
      this.globalState.get<ExtensionConfigProps>(CONFIG_STORAGE_KEY);
    log(LogLevel.debug, { message: "get config", config });
    return config
      ? {
          ...config,
          lastChecked: ExtensionConfig.convertToDate(config.lastChecked),
          lastPrayed: ExtensionConfig.convertToDate(config.lastPrayed),
          mostRecentCommunityDate: ExtensionConfig.convertToDate(config.mostRecentCommunityDate),
        }
      : { prayCommunityNovena: true };
  }

  async update(config: Partial<ExtensionConfigProps>) {
    const oldConfig = this.get();
    const newConfig = { ...oldConfig, ...config };
    log(LogLevel.debug, { message: "update config", oldConfig, newConfig });
    await this.globalState.update(CONFIG_STORAGE_KEY, {
      ...oldConfig,
      ...config,
    });
  }

  static getWorkspaceConfiguration(setting: string) {
    const value = vscode.workspace
      .getConfiguration(COMMAND_PREFIX)
      .get(setting);
    log(LogLevel.debug, {
      message: "getWorkspaceConfiguration",
      setting,
      value,
    });
    return vscode.workspace.getConfiguration(COMMAND_PREFIX).get(setting);
  }

  static convertFromCommunity(
    novena: Pick<Novena, "title" | "day" | "novenaLink" | "podcastLink" | "postDate">
  ): ExtensionConfigProps {
    return {
      prayCommunityNovena: true,
      novenaName: novena.title,
      novenaLink: novena.novenaLink,
      podcastLink: novena.podcastLink,
      novenaDay: novena.day,
      lastChecked: toStartOfDay(new Date()),
      lastPrayed: undefined,
      mostRecentCommunityDate: novena.postDate,
    };
  }

  static convertFromChosen(chosen: vscode.QuickPickItem): ExtensionConfigProps {
    return {
      prayCommunityNovena: false,
      novenaName: chosen?.label,
      novenaLink: chosen?.detail,
      novenaDay: 1,
      lastChecked: toStartOfDay(new Date()),
      lastPrayed: undefined,
    };
  }

  private static convertToDate(
    dateString: Date | string | undefined
  ): Date | undefined {
    return dateString ? new Date(dateString) : undefined;
  }
}
