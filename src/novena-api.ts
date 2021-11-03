import { WritableStream } from "htmlparser2/lib/WritableStream";
import fetch from "node-fetch";
import { QuickPickItem } from "vscode";
import { COMMUNITY_NOVENA } from "./constants";
import { ExtensionConfigProps, Novena, PostSection } from "./types";
import { log, LogLevel } from "./logger";

export async function getLatestNovenaMetadata(): Promise<Novena> {
  const novena = new Novena();

  let postCount = 0;
  let anchorInSectionCount = 0;
  let isHeaderAnchorTag = false;
  let postSection: PostSection | undefined;
  let isDateSection = false;
  let postDate = "";

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
      } else if (tagname === "a" && postCount === 1 && !!postSection) {
        anchorInSectionCount++;
        if (postSection.isHeader && anchorInSectionCount === 1) {
          novena.podcastLink = attributes.href;
          isHeaderAnchorTag = true;
        } else if (postSection.isContent && anchorInSectionCount === 1) {
          novena.novenaLink = attributes.href;
        }
      } else if (
        postCount === 1 &&
        tagname === "div" &&
        classNames.includes("entry-meta") &&
        classNames.includes("date")
      ) {
        isDateSection = true;
      }
    },
    ontext(text: string) {
      if (isHeaderAnchorTag) {
        novena.title += text;
      } else if (isDateSection) {
        postDate += text;
      }
    },
    onclosetag(tagname: string) {
      isHeaderAnchorTag = false;
      if (postCount === 1 && tagname === "a") {
        if (postSection?.isHeader && anchorInSectionCount === 1) {
          novena.day =
            <Novena["day"]>Number(novena.title?.match(/Day (\d)/)?.[1]) ||
            undefined;
          const matches = novena.title.match(
            /^(Final Prayer|Day \d)\s.\s(.*)\s\d{4}$/
          );
          novena.isFinalDay = matches?.[1] === "Final Prayer" || false;
          novena.title = matches?.[2] || novena.title;
        }
      } else if (tagname === "div" && isDateSection) {
        const matches =
          /([a-zA-Z]{6,}),([a-zA-Z]{3,})(\d{1,2})[a-z]{2},(\d{4})/.exec(
            postDate.replace(/\n/g, "")
          );
        const parsedDate = `${matches?.[1]}, ${matches?.[2]} ${matches?.[3]}, ${matches?.[4]}`;
        novena.postDate = matches?.[1] ? new Date(parsedDate) : undefined;
        isDateSection = false;
      }
    },
  });
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch("https://p.praymorenovenas.com/category/podcast");
      log(LogLevel.info, { getLatestNovenaMetadataStatus: res.status });
      if (res.status !== 200) {
        log(
          LogLevel.error,
          `getLatestNovenaMetadata: status code ${res.status}`
        );
        throw new Error("getLatestNovenaMetadata: Bad status code");
      } else {
        res?.body
          ?.pipe(parserStream)
          .on("finish", () => {
            log(
              LogLevel.debug,
              `getLatestNovenaMetadata: Found ${novena.title} day ${novena.day}`
            );
            resolve(novena);
          })
          .on("error", reject);
      }
    } catch (e: any) {
      log(LogLevel.error, `getLatestNovenaMetadata: ${e.message}`);
      reject(e);
    }
  });
}

export async function getNovenaText(
  config: ExtensionConfigProps
): Promise<string | undefined> {
  if (!config.novenaDay || !config.novenaLink) {
    log(LogLevel.warning, "Either Novena day or Novena link were not provided");
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
    try {
      const res = await fetch(config.novenaLink!);
      log(LogLevel.info, { getNovenaTextStatus: res.status });
      if (res.status !== 200) {
        log(LogLevel.error, `getNovenaText: ${res.status}`);
        throw new Error("getNovenaText: Bad status code");
      } else {
        res?.body
          ?.pipe(parserStream)
          .on("finish", () => {
            resolve(novenaText.replace(/(<p><\/p>|\n)/g, ""));
          })
          .on("error", reject);
      }
    } catch (e: any) {
      log(LogLevel.error, `getNovenaText: ${e.message}`);
      reject(e);
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
        log(LogLevel.debug, `Adding Novena ${novena.label}`);
        novenas.push(novena);
        novena = { label: "" };
      }
    },
  });
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch("https://www.praymorenovenas.com/novenas");
      log(LogLevel.info, { getNovenaListStatus: res.status });
      if (res.status !== 200) {
        log(LogLevel.error, `getNovenaList: status code ${res.status}`);
        throw new Error("Bad status code");
      } else {
        res?.body
          ?.pipe(parserStream)
          .on("finish", () => {
            resolve(novenas);
          })
          .on("error", reject);
      }
    } catch (e: any) {
      log(LogLevel.error, `getNovenaList: ${e.message}`);
      reject(e);
    }
  });
}
