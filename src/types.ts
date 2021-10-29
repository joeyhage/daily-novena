import { NOVENA_DAYS } from "./constants";

export class Novena {
  title = "";
  isFinalDay = false;
  novenaLink?: string;
  podcastLink?: string;
  day?: typeof NOVENA_DAYS[number];
  text?: string;
  postDate?: Date;

  isComplete(): boolean {
    return Boolean(this.title) && Boolean(this.novenaLink);
  }
}

export class PostSection {
  static readonly headerClassName = "entry-title";
  static readonly contentClassName = "entry-content";

  isHeader = false;
  isContent = false;

  constructor(sectionClassNames: string[]) {
    this.isHeader = sectionClassNames.includes(PostSection.headerClassName);
    this.isContent = !this.isHeader;
  }
}

export interface ExtensionConfigProps {
  prayCommunityNovena: boolean;
  novenaName?: Novena["title"];
  novenaLink?: Novena["novenaLink"];
  novenaDay?: Novena["day"];
  lastChecked?: Date;
  lastPrayed?: Date;
  mostRecentCommunityDate?: Date;
}
