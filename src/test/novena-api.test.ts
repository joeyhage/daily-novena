import * as td from "testdouble";
td.replace("../util", {
  log: console.log,
});
import { expect } from "chai";
import { getLatestNovenaMetadata, getNovenaList } from "../novena-api";

const NOVENA_LINK_REGEX = "https://www\\.praymorenovenas\\.com/[a-zA-Z\\d-]+";

afterEach(() => {
  td.reset();
});

it("should obtain Novena metadata for most recent Novena", async () => {
  // WHEN
  const novena = await getLatestNovenaMetadata();

  // THEN
  expect(novena.title).to.match(/^[a-zA-Záí.,'"’&| -]+$/);
  expect(novena.day).to.be.within(1, 9);
  expect(novena.novenaLink).to.match(new RegExp(`^${NOVENA_LINK_REGEX}$`));
  expect(novena.podcastLink).to.not.be.empty;
});

it("should build approximately 250 Novenas for `QuickPick` when Novena list is retrieved", async () => {
  // WHEN
  const novenaList = await getNovenaList();

  // THEN
  expect(novenaList).to.have.length.within(245, 255);
  novenaList.forEach((novena) => {
    expect(novena.label).to.match(
      /^[a-zA-Záí.,'"’&| -]+$/,
      `${JSON.stringify(novena)} had empty label`
    );
    expect(novena.detail).to.match(
      new RegExp(
        `^(${NOVENA_LINK_REGEX}|Set current Novena and day to community Novena\.)$`
      ),
      `${novena.detail} did not match expected url.`
    );
  });
});
