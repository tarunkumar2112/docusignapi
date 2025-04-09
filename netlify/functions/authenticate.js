require('dotenv').config(); // Load environment variables
const docusign = require('docusign-esign');
const { DS_CLIENT_ID, DS_REDIRECT_URI } = process.env;

exports.handler = async (event, context) => {
  const { code } = event.queryStringParameters; // Get the authorization code from the query params

  // Step 1: Initialize the DocuSign API Client
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath('https://demo.docusign.net/restapi'); // Use sandbox base path for testing

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

  // If authorization code exists, redirect to another function to get the access token
  return {
    statusCode: 302,
    headers: {
      Location: `${process.env.DOCUSIGN_API_URL}/getAccessToken?code=${code}`, // Redirect to the second file to handle access token
    },
    body: JSON.stringify({
      message: 'Redirecting to fetch access token...',
    }),
  };
};
