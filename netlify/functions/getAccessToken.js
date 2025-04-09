require('dotenv').config();
const docusign = require('docusign-esign');
const { DS_CLIENT_ID, DS_CLIENT_SECRET, DS_REDIRECT_URI } = process.env;

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
    apiClient.setOAuthBasePath('account-d.docusign.com'); // Important for OAuth

    const results = await apiClient.requestAccessToken(
      DS_CLIENT_ID,
      DS_CLIENT_SECRET,
      'authorization_code',
      code,
      DS_REDIRECT_URI
    );

    const accessToken = results.access_token;

    // Get user info to fetch accountId
    const userInfo = await apiClient.getUserInfo(accessToken);
    const accountId = userInfo.accounts[0].accountId;

    console.log('Access Token:', accessToken);
    console.log('Account ID:', accountId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Access token received!',
        accessToken,
        accountId,
      }),
    };
  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message,
        stack: err.stack,
      }),
    };
  }
};
