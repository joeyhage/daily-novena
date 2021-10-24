import * as vscode from "vscode";
import { CONFIG_STORAGE_KEY } from "./constants";
import { getLatestNovenaMetadata } from "./novena-api";
import { ExtensionConfigProps, Novena } from "./types";
import { log, LogLevel } from "./logger";

export class ExtensionConfig {
  private readonly globalState: vscode.ExtensionContext["globalState"];

  constructor(globalState: vscode.ExtensionContext["globalState"]) {
    this.globalState = globalState;
    if (!globalState.keys().includes(CONFIG_STORAGE_KEY)) {
      getLatestNovenaMetadata().then(async (novena) => {
        await this.update(ExtensionConfig.convertFromCommunity(novena));
        this.globalState.setKeysForSync([CONFIG_STORAGE_KEY]);
      });
    }
  }

  get(): ExtensionConfigProps {
    const config =
      this.globalState.get<ExtensionConfigProps>(CONFIG_STORAGE_KEY)!;
    log(LogLevel.debug, { message: "get config", config });
    return config;
  }

  async update(config: Partial<ExtensionConfigProps>) {
    const oldConfig = this.get();
    const newConfig = { ...oldConfig, ...config };
    log(LogLevel.debug, { oldConfig, newConfig });
    await this.globalState.update(CONFIG_STORAGE_KEY, {
      ...oldConfig,
      ...config,
    });
  }

  static convertFromCommunity(
    novena: Pick<Novena, "title" | "day" | "novenaLink">
  ): ExtensionConfigProps {
    return {
      prayCommunityNovena: true,
      novenaName: novena.title,
      novenaLink: novena.novenaLink,
      novenaDay: novena.day,
      lastChecked: new Date(),
      lastPrayed: undefined,
    };
  }

  static convertFromChosen(chosen: vscode.QuickPickItem): ExtensionConfigProps {
    return {
      prayCommunityNovena: false,
      novenaName: chosen?.label,
      novenaLink: chosen?.detail,
      novenaDay: 1,
      lastChecked: new Date(),
      lastPrayed: undefined,
    };
  }
}
