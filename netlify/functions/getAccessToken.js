// netlify/functions/getAccessToken.js
require('dotenv').config();
const docusign = require('docusign-esign');
const { DS_CLIENT_ID, DS_PRIVATE_KEY, DS_REDIRECT_URI } = process.env;

exports.handler = async (event) => {
  const { code } = event.queryStringParameters;

  if (!code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Authorization code is missing!' }),
    };
  }

  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath('https://demo.docusign.net/restapi');

  try {
    const tokenApi = new docusign.OAuthApi(apiClient);
    const tokenResponse = await tokenApi.getOAuthToken({
      clientId: DS_CLIENT_ID,
      clientSecret: DS_PRIVATE_KEY,
      code: code,
      redirectUri: DS_REDIRECT_URI,
    });

    const accessToken = tokenResponse.access_token;
    const accountId = tokenResponse.accounts[0].account_id;

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Token retrieved!',
        accessToken,
        accountId,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
        stack: err.stack,
      }),
    };
  }
};
