import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    console.log('[YouTube OAuth] Starting OAuth flow');

    // Validate required environment variables
    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${appUrl}/api/auth/youtube/callback`;

    if (!clientId || !clientSecret) {
      console.error('[YouTube OAuth] Missing YOUTUBE_CLIENT_ID or YOUTUBE_CLIENT_SECRET');
      return NextResponse.json(
        { 
          error: 'Missing YouTube OAuth credentials',
          message: 'Please set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET in your .env file'
        },
        { status: 500 }
      );
    }

    console.log('[YouTube OAuth] Client ID:', clientId);
    console.log('[YouTube OAuth] Redirect URI:', redirectUri);

    // Create OAuth2Client instance
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    // Generate authorization URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // CRITICAL: Required to get refresh token
      scope: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly'
      ],
      prompt: 'consent', // Force consent screen to ensure refresh token
    });

    console.log('[YouTube OAuth] Generated auth URL, redirecting user...');

    // Redirect to Google authorization page
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('[YouTube OAuth] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initiate OAuth flow',
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

