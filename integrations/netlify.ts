import axios from 'axios';

const NETLIFY_BUILD_HOOK = process.env.NETLIFY_BUILD_HOOK;

/**
 * Sends webhook to Netlify to build &
 * publish new version of the site.
 */
export const triggerNetlify = async (): Promise<void> => {
  await axios.post(NETLIFY_BUILD_HOOK, {});
}