import * as td from "testdouble";
td.replace("vscode", {
  window: { createOutputChannel: () => ({ appendLine: console.log }) },
  workspace: { getConfiguration: () => ({ get: () => "error" }) },
});
import { expect } from "chai";
import {
  getLatestNovenaMetadata,
  getNovenaList,
  getNovenaText,
} from "../novena-api";
import { ExtensionConfigProps } from "../types";

const NOVENA_LINK_REGEX = "https://www\\.praymorenovenas\\.com/[a-zA-Z\\d-]+";

afterEach(() => {
  td.reset();
});

it("should obtain Novena metadata for most recent Novena", async () => {
  // WHEN
  const novena = await getLatestNovenaMetadata();

  // THEN
  expect(novena.title).to.match(
    /^[a-zA-Záí.,'"’&| -]+$/,
    `Title ${novena.title} did not match`
  );

  expect(novena).to.satisfy(
    () =>
      novena.isFinalDay || (Number(novena.day) >= 1 && Number(novena.day) <= 9),
    "Novena should be final day or be a day between 1 and 9"
  );
  expect(novena.novenaLink).to.match(
    new RegExp(`^${NOVENA_LINK_REGEX}$`),
    `Novena Link ${novena.novenaLink} did not match`
  );
  expect(novena.podcastLink).to.match(
    new RegExp("^.+$"),
    "Podcast Link was empty"
  );
  expect(novena.postDate?.toISOString()).to.match(
    /^\d{4}-\d{2}-\d{2}T/,
    "Novena post date was not valid"
  );
});

it("should build approximately 300 Novenas for `QuickPick` when Novena list is retrieved", async () => {
  // WHEN
  const novenaList = await getNovenaList();

  // THEN
  expect(novenaList).to.have.length.within(300, 350);
  novenaList.forEach((novena) => {
    expect(novena.label).to.match(
      /^[a-zA-Z0-9áí.,'"’&| -]+$/,
      `Novena '${JSON.stringify(novena)}' had empty label`
    );
    expect(novena.detail).to.match(
      new RegExp(
        `^(${NOVENA_LINK_REGEX}|Set current Novena and day to community Novena\.)$`
      ),
      `Detail '${novena.detail}' did not match expected url.`
    );
  });
});

it("should correctly extract the HTML for a given Novena and day", async () => {
  // GIVEN
  const config = <ExtensionConfigProps>{
    prayCommunityNovena: false,
    novenaLink: "https://www.praymorenovenas.com/st-therese-novena",
    novenaDay: 5,
  };

  // WHEN
  const text = await getNovenaText(config);

  // THEN
  expect(text).to.match(
    /^<p>In the name.+<p>Loving God, You gave St\. Therese the gift of forgiving others.+Amen\..<\/p>$/
  );
});
