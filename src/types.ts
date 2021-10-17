import { NOVENA_DAYS } from "./constants";

export class Novena {
  title: string = "";
  novenaLink?: string;
  podcastLink?: string;
  day?: typeof NOVENA_DAYS[number];
  text?: string;

  isComplete(): boolean {
    return !!this.title && !!this.novenaLink;
  }
}

export class PostSection {
  static readonly headerClassName = "entry-header";
  static readonly contentClassName = "entry-content";

  isHeader = false;
  isContent = false;

  constructor(sectionClassNames: string) {
    if (sectionClassNames.includes(PostSection.headerClassName)) {
      this.isHeader = true;
    } else {
      this.isContent = true;
    }
  }
}

export class ExtensionConfig {
  prayCommunityNovena: boolean = true;
  novenaName?: Novena['title'];
  novenaLink: Novena['novenaLink'];
  novenaDay: Novena['day'];
  lastChecked?: Date;
  lastPrayed?: Date;
}
