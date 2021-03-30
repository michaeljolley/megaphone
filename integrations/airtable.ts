import { Context } from '@azure/functions';
import axios from 'axios';
import { AirtableItem } from '../models/airtableItem';

const AIRTABLE_AUTH_KEY = process.env.AIRTABLE_AUTH_KEY;
const AIRTABLE_BASE_NAME = process.env.AIRTABLE_BASE_NAME;

const airtableHeaders = {
  Authorization: `Bearer ${AIRTABLE_AUTH_KEY}`
};

/**
 * Retrieves any records in Airtable that are flagged as "Staged"
 * @returns An array of records from Airtable
 */
export const getItemsToPublish = async (_context: Context): Promise<AirtableItem[]> => {

  const fields = [
    'fields%5B%5D=Headline',
    'fields%5B%5D=Target',
    'fields%5B%5D=PublishDate',
    'fields%5B%5D=Image',
    'fields%5B%5D=Tweet',
    'fields%5B%5D=Status',
    'fields%5B%5D=PromotionReady',
    'fields%5B%5D=PromotionDate',
    'fields%5B%5D=ImageAltText',
    'fields%5B%5D=PromotionComplete'
  ]

  const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_NAME}/Content%20Production?view=Staged+Content&${fields.join('&')}`

  try {
    const response = await axios.get(airtableUrl, {
      headers: airtableHeaders
    });
    return response.data.records.map((r: any) => new AirtableItem(
      r.id,
      r.fields.Headline,
      r.fields.Target,
      r.fields.Status,
      r.fields.PublishDate,
      r.fields.PromotionReady || false,
      r.fields.PromotionDate,
      r.fields.PromotionComplete,
      r.fields.Image,
      r.fields.Tweet,
      r.fields.ImageAltText));
  }
  catch (err) {
    _context.log(err);
  }

  return [];
}

/** 
 * Updates the item in Airtable as published.
*/
export const markAsPublished = async (item: AirtableItem, _context: Context): Promise<void> => {

  _context.log(`Marking ${item.Headline} as published`);

  const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_NAME}/Content%20Production/${item.id}`

  try {
    await axios.patch(airtableUrl, {
      fields: {
        Status: "Published"
      }
    }, {
      headers: airtableHeaders
    });
  }
  catch (err) {
    _context.log(err);
  }
}

/** 
 * Updates the item in Airtable as promoted.
*/
export const markAsPromoted = async (item: AirtableItem, _context: Context): Promise<void> => {

  _context.log(`Marking ${item.Headline} as promoted`);

  const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_NAME}/Content%20Production/${item.id}`

  try {
    await axios.patch(airtableUrl, {
      fields: {
        PromotionComplete: true,
        Status: "Done"
      }
    }, {
      headers: airtableHeaders
    });
  }
  catch (err) {
    _context.log(err);
  }
}

/** 
 * Updates the item in Airtable as promoted.
*/
export const markAsDone = async (item: AirtableItem, _context: Context): Promise<void> => {

  _context.log(`Marking ${item.Headline} as done`);

  const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_NAME}/Content%20Production/${item.id}`

  try {
    await axios.patch(airtableUrl, {
      fields: {
        Status: "Done"
      }
    }, {
      headers: airtableHeaders
    });
  }
  catch (err) {
    _context.log(err);
  }
}