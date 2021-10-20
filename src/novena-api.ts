import { WritableStream } from "htmlparser2/lib/WritableStream";
import fetch from "node-fetch";
import { QuickPickItem } from "vscode";
import { COMMUNITY_NOVENA } from "./constants";
import { ExtensionConfig, Novena, PostSection } from "./types";
import { log } from "./util";

export async function getLatestNovenaMetadata(): Promise<Novena> {
  const novena = new Novena();

  let postCount = 0;
  let anchorInSectionCount = 0;
  let isHeaderAnchorTag = false;
  let postSection: PostSection | undefined;

  const parserStream = new WritableStream({
    onopentag(tagname: string, attributes: { class?: string; href?: string }) {
      const classNames = attributes.class?.split(" ") || [];
      if (tagname === "div" && classNames.includes("post")) {
        postCount++;
        anchorInSectionCount = 0;
      }
      if (
        postCount === 1 &&
        (classNames.includes(PostSection.headerClassName) ||
          classNames.includes(PostSection.contentClassName))
      ) {
        postSection = new PostSection(classNames);
        anchorInSectionCount = 0;
      } else if (postCount === 1 && !!postSection && tagname === "a") {
        anchorInSectionCount++;
        if (postSection.isHeader && anchorInSectionCount === 1) {
          novena.podcastLink = attributes.href;
          isHeaderAnchorTag = true;
        } else if (postSection.isContent && anchorInSectionCount === 1) {
          novena.novenaLink = attributes.href;
        }
      }
    },
    ontext(text: string) {
      if (isHeaderAnchorTag) {
        novena.title += text;
      }
    },
    onclosetag(tagname: string) {
      isHeaderAnchorTag = false;
      if (postCount === 1 && tagname === "a") {
        if (postSection?.isHeader && anchorInSectionCount === 1) {
          novena.day =
            <Novena["day"]>Number(novena.title?.match(/Day (\d)/)?.[1]) || undefined;
          novena.title = novena.title.match(/^(Final Prayer|Day \d)\s.\s(.*)\s\d{4}$/)?.[2] || novena.title;
        }
      }
    },
  });
  return new Promise(async (resolve, reject) => {
    const res = await fetch("https://p.praymorenovenas.com/category/podcast");
    if (res.status !== 200) {
      log(`getLatestNovenaMetadata: status code ${res.status}`);
      throw new Error("Bad status code");
    } else {
      res?.body
        ?.pipe(parserStream)
        .on("finish", () => resolve(novena))
        .on("error", reject);
    }
  });
}

export async function getNovenaText(
  config: ExtensionConfig
): Promise<string | undefined> {
  if (!config.novenaDay || !config.novenaLink) {
    return;
  }
  let isDayItem = false;
  let currentDayItem = 0;
  let novenaText = "";
  const parserStream = new WritableStream({
    onopentag(tagname: string, attributes: { class?: string; href?: string }) {
      const classNames = attributes.class?.split(" ") || [];
      if (tagname === "div" && classNames.includes("day-item__body")) {
        isDayItem = true;
        currentDayItem++;
      }
      if (isDayItem && tagname === "p") {
        novenaText += "<p>";
      }
    },
    ontext(text: string) {
      if (isDayItem && currentDayItem === config.novenaDay) {
        novenaText += text;
      }
    },
    onclosetag(tagname: string) {
      if (isDayItem && tagname === "div") {
        isDayItem = false;
      } else if (isDayItem && tagname === "p") {
        novenaText += "</p>";
      }
    },
  });
  return new Promise(async (resolve, reject) => {
    const res = await fetch(config.novenaLink!);
    if (res.status !== 200) {
      log(`getNovenaText: status code ${res.status}`);
      throw new Error("Bad status code");
    } else {
      res?.body
        ?.pipe(parserStream)
        .on("finish", () => resolve(novenaText))
        .on("error", reject);
    }
  });
}

export async function getNovenaList(): Promise<QuickPickItem[]> {
  let isMainContent = false;
  let isAfterNovenaHeading = false;
  let isBeforeOtherPrayers = true;
  let isNovenaAnchorTag = false;
  let novena = <QuickPickItem>{ label: "" };
  const novenas = <QuickPickItem[]>[
    {
      label: COMMUNITY_NOVENA,
      detail: "Set current Novena and day to community Novena.",
    },
  ];

  const parserStream = new WritableStream({
    onopentag(tagname: string, attributes: { class?: string; href?: string }) {
      if (tagname === "main") {
        isMainContent = true;
      } else if (isMainContent && tagname === "h1") {
        isAfterNovenaHeading = true;
      } else if (isMainContent && tagname === "h2") {
        isBeforeOtherPrayers = false;
      } else if (
        isAfterNovenaHeading &&
        isBeforeOtherPrayers &&
        tagname === "a"
      ) {
        isNovenaAnchorTag = true;
        novena.detail = `https://www.praymorenovenas.com${attributes.href}`;
      }
    },
    ontext(text: string) {
      if (isNovenaAnchorTag) {
        novena.label += text;
      }
    },
    onclosetag(tagname: string) {
      if (tagname === "main") {
        isMainContent = false;
      } else if (isNovenaAnchorTag && tagname === "a") {
        isNovenaAnchorTag = false;
        novenas.push(novena);
        novena = { label: "" };
      }
    },
  });
  return new Promise(async (resolve, reject) => {
    const res = await fetch("https://www.praymorenovenas.com/novenas");
    if (res.status !== 200) {
      log(`getNovenaList: status code ${res.status}`);
      throw new Error("Bad status code");
    } else {
      res?.body
        ?.pipe(parserStream)
        .on("finish", () => resolve(novenas))
        .on("error", reject);
    }
  });
}
