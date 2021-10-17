import fs from "fs";
import { posix } from "path";
import * as vscode from "vscode";
import { COMMAND_PREFIX } from "./constants";
import { ExtensionConfig } from "./types";
import { log } from "./util";

let extConfigPath: string;

export async function onActivate(context: vscode.ExtensionContext) {
  extConfigPath = posix.resolve(
    context.extensionPath,
    `${COMMAND_PREFIX}.config.json`
  );
  if (!fs.existsSync(extConfigPath)) {
    log("Config file does not exist. Creating one now...");
    await updateConfig(new ExtensionConfig());
  }
}

export async function updateConfig(
  config: Partial<ExtensionConfig>
): Promise<void> {
  const oldConfig = await getConfig();
  return handleFile<void>(async (file) => {
    log({ oldConfig, config });
    await file.writeFile(
      JSON.stringify({ ...oldConfig, ...config }, undefined, 2)
    );
  }, "w");
}

export async function getConfig(): Promise<ExtensionConfig | undefined> {
  return handleFile<ExtensionConfig>(async (file) => {
    const rawContent = await file.readFile({ encoding: "utf-8" });
    return JSON.parse(rawContent);
  }, "r");
}

async function handleFile<T>(
  func: (file: fs.promises.FileHandle) => Promise<T>,
  flags: string
): Promise<T | undefined> {
  let file: fs.promises.FileHandle | undefined;
  try {
    file = await fs.promises.open(extConfigPath, flags);
    return func(file);
  } catch (e) {
    log({ message: "config file error", e });
  } finally {
    await file?.close();
    log("Config file closed successfully");
  }
  return undefined;
}
