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

  try {
    const apiClient = new docusign.ApiClient();
    apiClient.setBasePath('https://demo.docusign.net/restapi');

    // This is the CORRECT way to exchange the code using JWT
    const tokenResponse = await apiClient.generateAccessToken(
      DS_CLIENT_ID,
      DS_PRIVATE_KEY.replace(/\\n/g, '\n'), // Just in case it's stored with escaped newlines
      'signature',
      3600
    );

    const accessToken = tokenResponse.accessToken;

    // Optionally get user info
    const userInfo = await apiClient.getUserInfo(accessToken);
    const accountId = userInfo.accounts[0].accountId;

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Access token retrieved!',
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
