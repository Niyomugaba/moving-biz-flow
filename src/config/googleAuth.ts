
// Google OAuth Configuration
// These credentials are used for Google Sheets API integration

export const GOOGLE_OAUTH_CONFIG = {
  // OAuth 2.0 Client ID
  clientId: '365487981669-h7p7pbpu7hvbu2gmtrh3jdns4so24a3t.apps.googleusercontent.com',
  
  // OAuth 2.0 Client Secret  
  clientSecret: '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',
  
  // Required scopes for Google Sheets access
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets'
  ],
  
  // OAuth 2.0 endpoints
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  
  // Redirect URI for OAuth flow (OAuth 2.0 Playground)
  redirectUri: 'https://developers.google.com/oauthplayground'
};

// Helper function to generate OAuth URL
export const generateOAuthUrl = (state?: string) => {
  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CONFIG.clientId,
    redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUri,
    scope: GOOGLE_OAUTH_CONFIG.scopes.join(' '),
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    ...(state && { state })
  });
  
  return `${GOOGLE_OAUTH_CONFIG.authUrl}?${params.toString()}`;
};
