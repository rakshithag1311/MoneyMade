import { supabase } from './supabase';

export interface DriveUploadResult {
  success: boolean;
  fileId?: string;
  fileName?: string;
  webViewLink?: string;
  error?: string;
}

export const uploadToGoogleDrive = async (
  blob: Blob,
  fileName: string
): Promise<DriveUploadResult> => {
  try {
    // Get the current session to check if user is authenticated with Google
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return {
        success: false,
        error: 'User not authenticated'
      };
    }

    // Check if user has Google OAuth provider
    const provider = session.user.app_metadata?.provider;
    
    if (provider !== 'google') {
      // User didn't sign in with Google, just download locally
      return {
        success: false,
        error: 'Google Drive upload requires Google sign-in. Downloading locally instead.'
      };
    }

    // Get the provider token (Google OAuth token)
    const providerToken = session.provider_token;
    
    if (!providerToken) {
      return {
        success: false,
        error: 'No Google access token available. Please sign in with Google.'
      };
    }

    // Create metadata for the file
    const metadata = {
      name: fileName,
      mimeType: 'application/pdf'
    };

    // Create form data for multipart upload
    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', blob);

    // Upload to Google Drive
    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${providerToken}`
        },
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to upload to Google Drive');
    }

    const result = await response.json();

    return {
      success: true,
      fileId: result.id,
      fileName: result.name,
      webViewLink: result.webViewLink
    };
  } catch (error: any) {
    console.error('Google Drive upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload to Google Drive'
    };
  }
};

export const checkGoogleDriveAccess = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return false;
    
    const provider = session.user.app_metadata?.provider;
    const providerToken = session.provider_token;
    
    return provider === 'google' && !!providerToken;
  } catch (error) {
    console.error('Error checking Google Drive access:', error);
    return false;
  }
};
