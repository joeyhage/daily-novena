import { expect } from "chai";
import { getLatestNovenaMetadata, getNovenaList } from "../novena-api";
import { Novena } from "../types";

const NOVENA_LINK_REGEX = "https://www\\.praymorenovenas\\.com/[a-zA-Z\\d-]+";

it("should obtain Novena metadata for most recent Novena", async () => {
  // WHEN
  const novena = await getLatestNovenaMetadata();

  // THEN
  expect(novena).to.satisfy((actual: Novena) => {
    return (
      (/^[Dd]ay \d/.test(actual.title) &&
        novena.day! >= 0 &&
        novena.day! <= 9) ||
      (/^Final Prayer/.test(actual.title) && typeof novena.day === "undefined")
    );
  });
  expect(novena.novenaLink).to.match(new RegExp(`^${NOVENA_LINK_REGEX}$`));
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
