const handler = require('netlify-cms-oauth-provider-node');

exports.handler = handler({
  // These should match what you set in Auth0
  provider: 'auth0',
  clientId: '2Ud5AqjVGaxCs1SRjti4jg32AMeK0HNC',
  clientSecret: 'Ag7OVGQKGjZwtv9GEuXKq5MFdZewBbTFAfLad94UnAMtr5Fi1tNnSfnTCR6eJaCe',
  authorizeUrl: 'https://dev-piuhjo7tbh61jome.us.auth0.com/authorize',
  accessTokenUrl: 'https://dev-piuhjo7tbh61jome.us.auth0.com/oauth/token',
  userUrl: 'https://dev-piuhjo7tbh61jome.us.auth0.com/userinfo',
});
