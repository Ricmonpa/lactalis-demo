import { google } from 'googleapis';
import { prisma } from '../prisma';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI
);

// Set refresh token if available
if (process.env.YOUTUBE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
  });
}

interface UploadToYouTubeParams {
  contentId: string;
  muxPlaybackId: string;
  title: string;
  description?: string;
  category?: string;
}

export async function uploadToYouTube({
  contentId,
  muxPlaybackId,
  title,
  description = '',
  category = 'Education',
}: UploadToYouTubeParams): Promise<{ success: boolean; youtubeVideoId?: string; youtubeUrl?: string; error?: string }> {
  let tempFilePath: string | null = null;

  try {
    console.log(`[YouTube Upload] Starting upload for contentId: ${contentId}, muxPlaybackId: ${muxPlaybackId}`);

    // 1. Update status to processing
    await prisma.videoAsset.update({
      where: { contentId },
      data: { youtubeStatus: 'processing' },
    });

    // 2. Download video from Mux
    const muxVideoUrl = `https://stream.mux.com/${muxPlaybackId}/high.mp4`;
    console.log(`[YouTube Upload] Downloading video from: ${muxVideoUrl}`);

    tempFilePath = path.join('/tmp', `video-${contentId}-${Date.now()}.mp4`);
    
    await downloadFile(muxVideoUrl, tempFilePath);
    console.log(`[YouTube Upload] Video downloaded to: ${tempFilePath}`);

    // 3. Upload to YouTube
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const fileSize = fs.statSync(tempFilePath).size;
    console.log(`[YouTube Upload] File size: ${fileSize} bytes`);

    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: `[Lactalis] ${title}`,
          description: description || `Video de capacitación - ${title}`,
          categoryId: '27', // Education
          tags: ['lactalis', 'capacitacion', 'educacion'],
        },
        status: {
          privacyStatus: 'unlisted',
        },
      },
      media: {
        body: fs.createReadStream(tempFilePath),
      },
    }, {
      onUploadProgress: (evt) => {
        if (evt.bytesRead) {
          const progress = ((evt.bytesRead / fileSize) * 100).toFixed(2);
          console.log(`[YouTube Upload] Upload progress: ${progress}%`);
        }
      },
    });

    const youtubeVideoId = response.data.id;
    if (!youtubeVideoId) {
      throw new Error('YouTube upload succeeded but no video ID returned');
    }

    const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;
    console.log(`[YouTube Upload] Success! Video ID: ${youtubeVideoId}, URL: ${youtubeUrl}`);

    // 4. Update VideoAsset in DB
    await prisma.videoAsset.update({
      where: { contentId },
      data: {
        youtubeVideoId,
        youtubeUrl,
        youtubeStatus: 'uploaded',
      },
    });

    // 5. Clean up temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      console.log(`[YouTube Upload] Temp file deleted: ${tempFilePath}`);
    }

    return {
      success: true,
      youtubeVideoId,
      youtubeUrl,
    };
  } catch (error: any) {
    console.error(`[YouTube Upload] Error:`, error);

    // Update status to error
    try {
      await prisma.videoAsset.update({
        where: { contentId },
        data: {
          youtubeStatus: 'error',
        },
      });
    } catch (dbError) {
      console.error(`[YouTube Upload] Failed to update error status:`, dbError);
    }

    // Clean up temp file on error
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log(`[YouTube Upload] Temp file deleted after error: ${tempFilePath}`);
      } catch (cleanupError) {
        console.error(`[YouTube Upload] Failed to delete temp file:`, cleanupError);
      }
    }

    return {
      success: false,
      error: error.message || 'Unknown error during YouTube upload',
    };
  }
}

/**
 * Download a file from a URL to a local path
 */
function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    const request = httpModule.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        file.close();
        if (fs.existsSync(destPath)) {
          fs.unlinkSync(destPath);
        }
        const redirectUrl = response.headers.location;
        if (!redirectUrl) {
          reject(new Error('Redirect location not found'));
          return;
        }
        return downloadFile(redirectUrl, destPath)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        file.close();
        if (fs.existsSync(destPath)) {
          fs.unlinkSync(destPath);
        }
        reject(new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });

      file.on('error', (err) => {
        file.close();
        if (fs.existsSync(destPath)) {
          fs.unlinkSync(destPath);
        }
        reject(err);
      });
    });

    request.on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath);
      }
      reject(err);
    });

    request.setTimeout(300000, () => {
      request.destroy();
      file.close();
      if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath);
      }
      reject(new Error('Download timeout after 5 minutes'));
    });
  });
}

