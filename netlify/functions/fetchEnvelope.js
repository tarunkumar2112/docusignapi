require('dotenv').config(); // Load environment variables
const docusign = require('docusign-esign');
const { DS_ACCOUNT_ID } = process.env; // We still use the account ID from environment variables

exports.handler = async (event, context) => {
  try {
    // Get the access token and envelope ID from query parameters
    const { accessToken, envelopeId } = event.queryStringParameters;

    if (!accessToken) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Access token is required.',
        }),
      };
    }

    if (!envelopeId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Envelope ID is required.',
        }),
      };
    }

    // Set up the DocuSign API client
    const apiClient = new docusign.ApiClient();
    apiClient.setBasePath('https://demo.docusign.net/restapi'); // Use sandbox base path for testing

    // Add the access token to the request header
    apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);

    // Create an instance of the EnvelopesApi
    const envelopesApi = new docusign.EnvelopesApi(apiClient);

    // Fetch the envelope details
    const envelope = await envelopesApi.getEnvelope(DS_ACCOUNT_ID, envelopeId);

    // Respond with the envelope details
    return {
      statusCode: 200,
      body: JSON.stringify({
        envelope: envelope,
      }),
    };
  } catch (error) {
    console.error('Error fetching envelope:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
      }),
    };
  }
};
