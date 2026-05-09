import { getFunctionUrl } from './supabase';
import { getOwnerFunctionHeaders } from './functionAuth';

type ScheduleYoutubeVideoInput = {
  file: File;
  title: string;
  description: string;
  scheduledAt: Date;
  privacyStatus?: 'private' | 'unlisted' | 'public';
};

type ScheduleYoutubeVideoResponse = {
  scheduledPostId: string;
  youtubeVideoId?: string | null;
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
  const formData = new FormData();

  formData.set('file', file);
  formData.set('title', title);
  formData.set('description', description);
  formData.set('publishAt', publishAt);
  formData.set('privacyStatus', privacyStatus);
  formData.set('mimeType', file.type || 'video/mp4');

  const uploadResponse = await fetch(
    getFunctionUrl('youtube-create-upload-session'),
    {
      method: 'POST',
      headers: withFormDataHeaders(headers),
      body: formData,
    }
  );

  const uploadData = (await uploadResponse.json()) as
    | ScheduleYoutubeVideoResponse
    | { error: string };

  if (!uploadResponse.ok || 'error' in uploadData) {
    throw new Error(
      'Could not upload YouTube video: ' +
        ('error' in uploadData ? uploadData.error : uploadResponse.statusText)
    );
  }

  return {
    scheduledPostId: uploadData.scheduledPostId,
    youtubeVideoId: uploadData.youtubeVideoId,
  };
}

function withFormDataHeaders(headers: HeadersInit) {
  const nextHeaders = new Headers(headers);
  nextHeaders.delete('Content-Type');
  return nextHeaders;
}