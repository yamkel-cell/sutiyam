import { createBeginHandler, createCompleteHandler } from 'netlify-cms-oauth-provider-node';

const config = {
  provider: 'auth0',
  clientId: '2Ud5AqjVGaxCs1SRjti4jg32AMeK0HNC',
  clientSecret: 'Ag7OVGQKGjZwtv9GEuXKq5MFdZewBbTFAfLad94UnAMtr5Fi1tNnSfnTCR6eJaCe',
  authorizeUrl: 'https://dev-piuhjo7tbh61jome.us.auth0.com/authorize',
  accessTokenUrl: 'https://dev-piuhjo7tbh61jome.us.auth0.com/oauth/token',
  userUrl: 'https://dev-piuhjo7tbh61jome.us.auth0.com/userinfo',
};

export const begin = createBeginHandler(config);
export const complete = createCompleteHandler(config);
