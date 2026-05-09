import { getFunctionUrl } from './supabase';
import { getOwnerFunctionHeaders } from './functionAuth';

type ScheduleYoutubeVideoInput = {
  file: File;
  title: string;
  description: string;
  scheduledAt: Date;
  privacyStatus?: 'private' | 'unlisted' | 'public';
};

type CreateUploadSessionResponse = {
  uploadUrl: string;
  scheduledPostId: string;
};

export async function scheduleYoutubeVideo({
  file,
  title,
  description,
  scheduledAt,
  privacyStatus = 'private',
}: ScheduleYoutubeVideoInput) {
  const publishAt = scheduledAt.toISOString();
  const headers = await getOwnerFunctionHeaders();

  const sessionResponse = await fetch(
    getFunctionUrl('youtube-create-upload-session'),
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title,
        description,
        publishAt,
        fileSize: file.size,
        mimeType: file.type || 'video/mp4',
        privacyStatus,
      }),
    }
  );

  const sessionData = (await sessionResponse.json()) as
    | CreateUploadSessionResponse
    | { error: string };

  if (!sessionResponse.ok || 'error' in sessionData) {
    throw new Error(
      'Could not create YouTube upload session: ' +
        ('error' in sessionData ? sessionData.error : sessionResponse.statusText)
    );
  }

  const uploadResponse = await fetch(sessionData.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'video/mp4',
      'Content-Length': String(file.size),
    },
    body: file,
  });

  const uploadResult = await uploadResponse.json().catch(() => null);

  if (!uploadResponse.ok) {
    await completeYoutubeUpload({
      headers,
      scheduledPostId: sessionData.scheduledPostId,
      ok: false,
      error: uploadResult,
      privacyStatus,
    });

    throw new Error(
      'YouTube upload failed: ' + JSON.stringify(uploadResult)
    );
  }

  await completeYoutubeUpload({
    headers,
    scheduledPostId: sessionData.scheduledPostId,
    ok: true,
    youtubeVideoId: uploadResult?.id ?? null,
    privacyStatus,
  });

  return {
    scheduledPostId: sessionData.scheduledPostId,
    youtubeVideoId: uploadResult?.id,
  };
}

async function completeYoutubeUpload({
  headers,
  scheduledPostId,
  ok,
  youtubeVideoId,
  error,
  privacyStatus,
}: {
  headers: HeadersInit;
  scheduledPostId: string;
  ok: boolean;
  youtubeVideoId?: string | null;
  error?: unknown;
  privacyStatus: 'private' | 'unlisted' | 'public';
}) {
  const response = await fetch(getFunctionUrl('youtube-complete-upload'), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      scheduledPostId,
      ok,
      youtubeVideoId,
      error,
      privacyStatus,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(
      'Could not update upload status: ' + JSON.stringify(data)
    );
  }
}