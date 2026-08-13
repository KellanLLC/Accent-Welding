import { defineCloudflareConfig } from '@opennextjs/cloudflare';

/**
 * The site has no ISR and no `revalidate` anywhere, so the default
 * (no incremental cache) is correct. Adding the R2 cache override would only
 * add a bucket to provision and nothing to put in it.
 *
 * See https://opennext.js.org/cloudflare/caching if that changes.
 */
export default defineCloudflareConfig();
