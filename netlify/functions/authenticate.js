require('dotenv').config(); // Load environment variables
const docusign = require('docusign-esign');
const { DS_CLIENT_ID, DS_USER_ID, DS_PRIVATE_KEY, DS_REDIRECT_URI } = process.env;

exports.handler = async (event, context) => {
  const { code } = event.queryStringParameters; // Get the authorization code from the query params

  // Step 1: Initialize the DocuSign API Client
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath('https://demo.docusign.net/restapi'); // Use sandbox base path for testing

  const authApi = new docusign.AuthenticationApi(apiClient);

  try {
    if (!code) {
      // Step 2: No authorization code, redirect the user to DocuSign login page
      const oauthRequest = {
        clientId: DS_CLIENT_ID,
        redirectUri: DS_REDIRECT_URI,
        scope: 'signature', // Choose the scope you need (e.g., signature)
      };

      // Generate the authorization URL manually
      const authUri = `https://account-d.docusign.com/oauth/auth?response_type=code&scope=${oauthRequest.scope}&client_id=${oauthRequest.clientId}&redirect_uri=${encodeURIComponent(oauthRequest.redirectUri)}`;

      return {
        statusCode: 302, // Redirect response
        headers: {
          Location: authUri, // Redirect to DocuSign login page
        },
        body: JSON.stringify({
          message: 'Redirecting to DocuSign for authorization...',
        }),
      };
    }

    // Step 3: Authorization code received, exchange it for an access token
    const tokenApi = new docusign.OAuthApi(apiClient);
    const tokenResponse = await tokenApi.getOAuthToken({
      clientId: DS_CLIENT_ID,
      clientSecret: DS_PRIVATE_KEY, // Use your private key (secret) here
      code: code, // Authorization code received in the query string
      redirectUri: DS_REDIRECT_URI, // Same as in your DocuSign application settings
    });

    // Step 4: Access token and other details
    const accessToken = tokenResponse.access_token;
    const accountId = tokenResponse.accounts[0].account_id; // Retrieve the account ID

    // Respond with the access token and account ID
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Successfully authenticated with DocuSign!',
        accessToken: accessToken,
        accountId: accountId,
      }),
    };
  } catch (error) {
    // Handle errors
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
      }),
    };
  }
};
