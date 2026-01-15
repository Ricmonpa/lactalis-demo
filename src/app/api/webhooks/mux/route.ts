import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    console.log(`[Mux Webhook] Received event: ${type}`);

    // Handle video.asset.ready event
    if (type === 'video.asset.ready') {
      const { id: muxAssetId, playback_ids, status } = data;

      if (!muxAssetId) {
        console.error('[Mux Webhook] Missing muxAssetId in event data');
        return NextResponse.json({ error: 'Missing muxAssetId' }, { status: 400 });
      }

      // Find VideoAsset by muxAssetId
      const videoAsset = await prisma.videoAsset.findUnique({
        where: { muxAssetId },
        include: { content: true },
      });

      if (!videoAsset) {
        console.error(`[Mux Webhook] VideoAsset not found for muxAssetId: ${muxAssetId}`);
        return NextResponse.json({ error: 'VideoAsset not found' }, { status: 404 });
      }

      // Get playback ID (prefer public, fallback to signed)
      const playbackId = playback_ids?.find((p: any) => p.policy === 'public')?.id ||
                        playback_ids?.[0]?.id;

      if (!playbackId) {
        console.error(`[Mux Webhook] No playback ID found for asset: ${muxAssetId}`);
        return NextResponse.json({ error: 'No playback ID found' }, { status: 400 });
      }

      const muxUrl = `https://stream.mux.com/${playbackId}.m3u8`;

      // Update VideoAsset with Mux data
      await prisma.videoAsset.update({
        where: { id: videoAsset.id },
        data: {
          muxPlaybackId: playbackId,
          muxStatus: status === 'ready' ? 'ready' : 'errored',
          muxUrl,
        },
      });

      console.log(`[Mux Webhook] Updated VideoAsset ${videoAsset.id} with Mux data`);

      // Trigger YouTube upload in background
      try {
        const uploadUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/youtube/upload`;
        
        // Fire and forget - don't wait for response
        fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contentId: videoAsset.contentId,
            muxPlaybackId: playbackId,
            title: videoAsset.content.title,
            description: videoAsset.content.description || '',
            category: 'Education',
          }),
        }).catch((error) => {
          console.error(`[Mux Webhook] Failed to trigger YouTube upload:`, error);
        });

        console.log(`[Mux Webhook] Triggered YouTube upload for contentId: ${videoAsset.contentId}`);
      } catch (error) {
        console.error(`[Mux Webhook] Error triggering YouTube upload:`, error);
        // Don't fail the webhook if YouTube upload fails
      }

      return NextResponse.json({ success: true });
    }

    // Handle other event types if needed
    console.log(`[Mux Webhook] Unhandled event type: ${type}`);
    return NextResponse.json({ success: true, message: 'Event received but not processed' });
  } catch (error: any) {
    console.error('[Mux Webhook] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

