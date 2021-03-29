export class AirtableItem {
  constructor(
    public id: string,
    public Headline: string,
    public Target:
      "YouTube" |
      "BBB blog" |
      "Vonage blog" |
      "Twitch" |
      "Vonage Twitch" |
      "3rd Party",
    public Status: "Staged" | "Published",
    public PublishDate: Date,
    public PromotionReady: boolean,
    public PromotionDate: Date,
    public Image?: AirtableImage[],
    public Tweet?: string,
    public ImageAltText?: string
  ) { }
}

export class AirtableImage {
  constructor(
    public url: string,
    public size: number,
    public type: string
  ) { }
}