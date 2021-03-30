import axios from 'axios';
import { Context } from '@azure/functions';

const NETLIFY_BUILD_HOOK = process.env.NETLIFY_BUILD_HOOK;

/**
 * Sends webhook to Netlify to build &
 * publish new version of the site.
 */
export const triggerNetlify = async (_context: Context): Promise<void> => {
  _context.log('Triggering Netlify build');
  await axios.post(NETLIFY_BUILD_HOOK, {});
}