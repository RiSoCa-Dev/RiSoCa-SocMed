import { getFunctionUrl, supabase } from './supabase';

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
}: ScheduleYoutubeVideoInput) {
  const publishAt = scheduledAt.toISOString();

  const sessionResponse = await fetch(
    getFunctionUrl('youtube-create-upload-session'),
    {
      method: 'POST',
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
        publishAt,
        fileSize: file.size,
        mimeType: file.type || 'video/mp4',
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
    await supabase
      .from('scheduled_posts')
      .update({
        status: 'failed',
        upload_error: JSON.stringify(uploadResult),
      })
      .eq('id', sessionData.scheduledPostId);

    throw new Error(
      'YouTube upload failed: ' + JSON.stringify(uploadResult)
    );
  }

  await supabase
    .from('scheduled_posts')
    .update({
      status: 'uploaded',
      youtube_video_id: uploadResult?.id ?? null,
      uploaded_at: new Date().toISOString(),
    })
    .eq('id', sessionData.scheduledPostId);

  return {
    scheduledPostId: sessionData.scheduledPostId,
    youtubeVideoId: uploadResult?.id,
  };
}