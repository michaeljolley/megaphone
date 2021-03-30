import { AzureFunction, Context } from "@azure/functions"

import { getItemsToPublish, markAsDone, markAsPromoted, markAsPublished } from '../integrations/airtable';
import { triggerNetlify } from '../integrations/netlify';
import { tweet } from '../integrations/twitter';
import { AirtableItem } from '../models/airtableItem';

/**
 * I'm running this function every 15 minutes. However, in 
 * Airtable I want to schedule things directly on the minute. If 
 * this function takes a moment to load or if it runs and I've got
 * something scheduled for that moment it won't hit until the next
 * run. So look for events firing < a minute from now.
 */
let timeStamp = new Date();
timeStamp.setMinutes(timeStamp.getMinutes() + 1);

let _context: Context;

const timerTrigger: AzureFunction = async function (context: Context, myTimer: any): Promise<void> {
  _context = context;

  // Look in Airtable to see if anything needs to be published
  const itemsToPublish: AirtableItem[] = await getItemsToPublish(_context);

  // Filter items to those who need to be published and/or
  // promoted and handle.
  const workItems = itemsToPublish.filter(f =>
    new Date(f.PublishDate) < timeStamp ||
    new Date(f.PromotionDate) < timeStamp);
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

  try {
    if (item.Status === 'Staged' && new Date(item.PublishDate) < timeStamp) {

      _context.log(`Publishing ${item.Headline} for ${item.Target}`);

      /**
       * Publish as needed
       */
      switch (item.Target) {
        case 'BBB blog':
          _context.log(`Triggering Netlify build for: ${item.Headline}`);
          await triggerNetlify(_context);
          break;
        case 'YouTube':
          _context.log(`Triggering Netlify build for: ${item.Headline}`);
          await triggerNetlify(_context);
          break;
      }

      await markAsPublished(item, _context);
    }
    else if (item.PromotionReady && new Date(item.PromotionDate) < timeStamp) {

      _context.log(`Promoting ${item.Headline}`);

      /**
       * Promote as needed
       */
      await tweet(item, _context);

      await markAsPromoted(item, _context);
    }
    else if (item.Status === 'Published' && (!item.PromotionReady || item.PromotionComplete)) {

      _context.log(`Marking ${item.Headline} as Done`);
      await markAsDone(item, _context);
    }
  }
  catch (err) {
    _context.log(`Error processing '${item.Headline}': ${err}`);
  }
}

export default timerTrigger;
