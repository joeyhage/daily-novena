import { WritableStream } from "htmlparser2/lib/WritableStream";
import fetch from "node-fetch";
import { QuickPickItem } from "vscode";
import { COMMUNITY_NOVENA } from "./constants";
import { ExtensionConfig, Novena, PostSection } from "./types";

export async function getLatestNovenaMetadata(): Promise<Novena> {
  const novena = new Novena();
  let postSection: PostSection | undefined;
  let isMetadataAnchorTag = false;

  const parserStream = new WritableStream({
    onopentag(tagname: string, attributes: { class?: string; href?: string }) {
      if (novena.isComplete()) {
        return;
      }
      const classNames = attributes.class?.split(" ") || [];
      if (
        tagname === "div" &&
        (classNames.includes(PostSection.headerClassName) ||
          classNames.includes(PostSection.contentClassName))
      ) {
        postSection = new PostSection(attributes.class!);
      } else if (!!postSection && tagname === "a") {
        isMetadataAnchorTag = true;
        if (postSection.isHeader) {
          novena.podcastLink = attributes.href;
        } else if (postSection.isContent) {
          novena.novenaLink = attributes.href;
        }
      }
    },
    ontext(text: string) {
      if (isMetadataAnchorTag && postSection?.isHeader) {
        novena.title += text.replace(/\n/, "");
      }
    },
    onclosetag(tagname: string) {
      if (isMetadataAnchorTag && tagname === "a") {
        postSection = undefined;
        isMetadataAnchorTag = false;
        novena.day =
          <Novena["day"]>novena.title?.match(/[Dd]ay (\d)/)?.[1] || undefined;
      }
    },
  });
  return new Promise(async (resolve, reject) => {
    const res = await fetch("https://p.praymorenovenas.com/category/podcast");
    if (res.status !== 200) {
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
      throw new Error("Bad status code");
    } else {
      res?.body
        ?.pipe(parserStream)
        .on("finish", () => resolve(novenas))
        .on("error", reject);
    }
  });
}
