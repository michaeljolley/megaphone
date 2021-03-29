import { AzureFunction, Context } from "@azure/functions"

import { getItemsToPublish, markAsPromoted, markAsPublished } from '../integrations/airtable';
import { triggerNetlify } from '../integrations/netlify';
import { tweet } from '../integrations/twitter';
import { AirtableItem } from '../models/airtableItem';

const timeStamp = new Date();

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {

  // Look in Airtable to see if anything needs to be published
  const itemsToPublish: AirtableItem[] = await getItemsToPublish();

  // Filter items to those who need to be published and/or
  // promoted and handle.
  const workItems = itemsToPublish.filter(f => new Date(f.PublishDate) < timeStamp);
  for (const item of workItems) {
    await processItem(item);
  }

  context.log('Megaphone ran!', timeStamp);
};

/**
 * Publishes and/or promotes items
 * @param item Airtable item identified to get worked on
 */
const processItem = async (item: AirtableItem): Promise<void> => {

  if (item.Status === 'Staged') {

    /**
     * Publish as needed
     */
    switch (item.Target) {
      case 'BBB blog':
        console.log(`Triggering Netlify build for: ${item.Headline}`);
        await triggerNetlify();
        break;
    }

    await markAsPublished(item);
  }
  else if (item.PromotionReady && new Date(item.PromotionDate) < timeStamp) {

    /**
     * Promote as needed
     */
    await tweet(item);

    await markAsPromoted(item);
  }
}

export default timerTrigger;

/**
 * Using Markdown to create blog posts & documentation is great, but how do I remember everything!?
 *
 * The Markdownlint extension for @code makes it easy to lint markdown and make sure I'm writing valid Markdown.
 *
 * https://youtu.be/NfgYfqQBc_8
 *
 *
 *
 *
 *
 *
 */