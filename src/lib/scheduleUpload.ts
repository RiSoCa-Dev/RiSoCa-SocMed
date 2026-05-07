import { supabase } from './supabase';

export interface ScheduleYoutubeVideoInput {
  file: File;
  title: string;
  description?: string;
  scheduledAt: Date;
  privacyStatus?: 'private' | 'unlisted' | 'public';
}

function safeFileName(name: string) {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

export async function scheduleYoutubeVideo(input: ScheduleYoutubeVideoInput) {
  const privacyStatus = input.privacyStatus || 'private';
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 10);
  const fileName = safeFileName(input.file.name || 'video.mp4');
  const videoPath = `scheduled/youtube/${timestamp}-${random}-${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('post-media')
    .upload(videoPath, input.file, {
      contentType: input.file.type || 'video/mp4',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  const { data, error: insertError } = await supabase
    .from('scheduled_posts')
    .insert({
      platform: 'youtube',
      title: input.title,
      description: input.description || '',
      video_path: videoPath,
      scheduled_at: input.scheduledAt.toISOString(),
      status: 'scheduled',
      privacy_status: privacyStatus,
    })
    .select('id')
    .single();

  if (insertError) {
    throw new Error(`Schedule save failed: ${insertError.message}`);
  }

  return { id: data.id as string, videoPath };
}
