import * as td from "testdouble";
td.replace("vscode", {
  window: { createOutputChannel: td.function() },
  workspace: { getConfiguration: td.function() },
});
import { expect } from "chai";
import { ExtensionConfig } from "../config";
import { ExtensionConfigProps, Novena } from "../types";

it("should convert from Novena to ExtensionConfig", () => {
  // GIVEN
  const novena = {
    title: "St. Therese of Lisieux",
    day: <Novena["day"]>1,
    novenaLink: "the link",
  };

  // WHEN
  const config = ExtensionConfig.convertFromCommunity(novena);

  // THEN
  expect(config).to.include(<ExtensionConfigProps>{
    prayCommunityNovena: true,
    novenaName: "St. Therese of Lisieux",
    novenaLink: "the link",
    novenaDay: 1,
    lastPrayed: undefined,
  });
  expect(config.lastChecked).to.be.an.instanceof(Date);
});

it("should convert from QuickPickItem to ExtensionConfig", () => {
  // GIVEN
  const chosen = { label: "St. Jude", detail: "the link" };

  // WHEN
  const config = ExtensionConfig.convertFromChosen(chosen);

  // THEN
  expect(config).to.include(<ExtensionConfigProps>{
    prayCommunityNovena: false,
    novenaName: "St. Jude",
    novenaLink: "the link",
    novenaDay: 1,
    lastPrayed: undefined,
  });

  expect(config.lastChecked).to.be.an.instanceof(Date);
});
