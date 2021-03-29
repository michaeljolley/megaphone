import * as fs from 'fs';
import * as Path from 'path';
import axios from 'axios';
import * as Twitter from 'twit';

import { AirtableImage, AirtableItem } from '../models/airtableItem';
import { Tweet } from '../models/tweet';

const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET;
const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;

const twitter = new Twitter({
  access_token: TWITTER_API_KEY,
  access_token_secret: TWITTER_API_SECRET,
  consumer_key: TWITTER_CONSUMER_KEY,
  consumer_secret: TWITTER_CONSUMER_SECRET
});

const excludeImageTypes = [
  'BBB blog',
  'Vonage blog'
];

/**
 * Send tweet about the item
 */
export const tweet = async (item: AirtableItem): Promise<void> => {
  try {
    if (item.Tweet) {

      const status = new Tweet(item.Tweet);

      // Don't use images for certain targets
      if (!excludeImageTypes.includes(item.Target)) {
        if (item.Image && item.Image.length > 0) {
          const imageMediaId: string = await loadImage(item);
          status.media_ids = imageMediaId;
        }
      }
      await twitter.post('statuses/update', status);
    }
  }
  catch (err) {
    console.error(err);
  }
}

const loadImage = async (item: AirtableItem): Promise<string> => {
  const image = item.Image[0];
  const path = Path.resolve(__dirname, `${image.size}.png`);

  await downloadImage(image, path);
  const { media_id_string } = await initUpload(path, item);

  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }

  return media_id_string;
}

const downloadImage = async (image: AirtableImage, path: string): Promise<any> => {


  const response = await axios.get(image.url, {
    responseType: 'stream'
  });

  const writer = fs.createWriteStream(path);
  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

const initUpload = async (pathTo: string, item: AirtableItem): Promise<any> => {
  return new Promise((resolve, reject) => {
    twitter.postMediaChunked({
      file_path: pathTo
    }, function (err, data, response) {
      if (err) reject(err);

      if (item.ImageAltText) {
        const metadata = { media_id: data.media_id_string, alt_text: { text: item.ImageAltText } };
        twitter.post('media/metadata/create', metadata, function (err, mediaData, response) {
          if (err) reject(err);

          resolve(data);
        })
      } else {
        resolve(data);
      }
    })
  });
}
