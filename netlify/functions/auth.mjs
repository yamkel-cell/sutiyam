import { createBeginHandler, createCompleteHandler } from 'netlify-cms-oauth-provider-node';

const config = {
  provider: 'auth0',
  clientId: process.env.oauthClientID,
  clientSecret: process.env.oauthClientSecret,
  authorizeUrl: 'https://dev-piuhjo7tbh61jome.us.auth0.com/authorize',
  accessTokenUrl: 'https://dev-piuhjo7tbh61jome.us.auth0.com/oauth/token',
  userUrl: 'https://dev-piuhjo7tbh61jome.us.auth0.com/userinfo',
  origin: process.env.origin,
  completeUrl: process.env.completeUrl,
};


export const begin = createBeginHandler(config);
export const complete = createCompleteHandler(config);
