import * as td from "testdouble";
let appendLine = td.function("appendLine");
let get = td.function("get");
td.replace("vscode", {
  window: { createOutputChannel: () => ({ appendLine }) },
  workspace: { getConfiguration: () => ({ get }) },
});
import { log, LogLevel, setLevel } from "../logger";

afterEach(() => {
  setLevel(undefined);
  td.reset();
});

it("should always log when level is `always`", () => {
  // GIVEN
  td.when(get("logLevel")).thenReturn(LogLevel[LogLevel.none]);

  // WHEN
  log(LogLevel.always, "Test");

  // THEN
  td.verify(appendLine('ALWAYS: "Test"'), { times: 1 });
});

it("should not log when user-set `LogLevel` is `none`", () => {
  // GIVEN
  td.when(get("logLevel")).thenReturn(LogLevel[LogLevel.none]);

  // WHEN
  log(LogLevel.info, "Test");

  // THEN
  td.verify(appendLine(td.matchers.anything()), { times: 0 });
});

it("should log errors when user-set `LogLevel` is `error`", () => {
  // GIVEN
  td.when(get("logLevel")).thenReturn(LogLevel[LogLevel.error]);

  // WHEN
  log(LogLevel.error, "Unexpected error");

  // THEN
  td.verify(appendLine('ERROR: "Unexpected error"'), { times: 1 });
});

it("should log info when user-set `LogLevel` is `debug`", () => {
  // GIVEN
  td.when(get("logLevel")).thenReturn(LogLevel[LogLevel.debug]);

  // WHEN
  log(LogLevel.info, "Hello");

  // THEN
  td.verify(appendLine('INFO: "Hello"'), { times: 1 });
});
