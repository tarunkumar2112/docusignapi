require('dotenv').config(); // Load environment variables
const docusign = require('docusign-esign');
const { DS_CLIENT_ID, DS_USER_ID, DS_PRIVATE_KEY, DS_REDIRECT_URI } = process.env;

exports.handler = async (event, context) => {
  // Get the access token and account ID from the query string parameters
  const { accessToken, accountId } = event.queryStringParameters;

  if (!accessToken || !accountId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Missing accessToken or accountId parameter.',
      }),
    };
  }

  // Step 1: Initialize the DocuSign API Client
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath('https://demo.docusign.net/restapi'); // Use sandbox base path for testing

  // Step 2: Set the access token for authentication
  apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);

  // Step 3: Create an instance of the Accounts API
  const accountsApi = new docusign.AccountsApi(apiClient);

  try {
    // Step 4: Get account information using the accountId
    const accountInfo = await accountsApi.getAccountInformation(accountId);

    // Step 5: Return the account information
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Account information retrieved successfully!',
        accountInfo: accountInfo,
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
