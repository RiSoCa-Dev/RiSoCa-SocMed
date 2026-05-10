import { useMemo, useState } from 'react';
import {
  FaCalendarAlt,
  FaCloudUploadAlt,
  FaExclamationTriangle,
  FaPlay,
  FaRocket,
  FaSpinner,
} from 'react-icons/fa';
import { scheduleYoutubeVideo } from '../lib/scheduleUpload';
import { platformMap, platforms, type PlatformKey } from '../lib/platforms';
import { Badge, Button, Card, Field, Input, Select, Textarea } from '../components/ui';
import { clearScheduledPostsCache } from '../lib/appCache';

type Platform = PlatformKey;
type PrivacyStatus = 'private' | 'unlisted' | 'public';

type ComposerState = {
  file: File;
  previewUrl: string;
  title: string;
  description: string;
  tags: string;
  categoryId: string;
  privacyStatus: PrivacyStatus;
  scheduledDate: string;
  scheduledTime: string;
  selectedPlatforms: Platform[];
  status: 'draft' | 'uploading' | 'scheduled' | 'error';
  error?: string;
};

const youtubeCategories = [
  { id: '1', label: 'Film & Animation' },
  { id: '2', label: 'Autos & Vehicles' },
  { id: '10', label: 'Music' },
  { id: '15', label: 'Pets & Animals' },
  { id: '17', label: 'Sports' },
  { id: '19', label: 'Travel & Events' },
  { id: '20', label: 'Gaming' },
  { id: '22', label: 'People & Blogs' },
  { id: '23', label: 'Comedy' },
  { id: '24', label: 'Entertainment' },
  { id: '26', label: 'Howto & Style' },
  { id: '27', label: 'Education' },
  { id: '28', label: 'Science & Technology' },
];

function defaultScheduleParts() {
  const date = new Date(Date.now() + 30 * 60 * 1000);
  date.setSeconds(0, 0);
  return {
    scheduledDate: toDateInputValue(date),
    scheduledTime: toTimeInputValue(date),
  };
}

function safeTitle(file: File) {
  return file.name.replace(/\.[^/.]+$/, '').slice(0, 95) || 'Scheduled Video';
}

function fileSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function toDateInputValue(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function toTimeInputValue(date: Date) {
  return [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
  ].join(':');
}

function scheduleDateFromParts(dateValue: string, timeValue: string) {
  if (!dateValue || !timeValue) return null;
  const [year, month, day] = dateValue.split('-').map(Number);
  const [hours, minutes] = timeValue.split(':').map(Number);
  if ([year, month, day, hours, minutes].some((value) => Number.isNaN(value))) {
    return null;
  }
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function formatLocalSchedule(date: Date | null) {
  if (!date) return 'Select a valid local date and time.';
  return `Publishes at ${date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })} local time.`;
}

export default function BatchScheduler() {
  const [item, setItem] = useState<ComposerState | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const scheduledAt = useMemo(
    () => item ? scheduleDateFromParts(item.scheduledDate, item.scheduledTime) : null,
    [item]
  );

  const scheduleHelper = useMemo(() => formatLocalSchedule(scheduledAt), [scheduledAt]);

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    const file = Array.from(files).find((candidate) => candidate.type.startsWith('video/'));
    if (!file) return;

    setItem((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return {
        file,
        previewUrl: URL.createObjectURL(file),
        title: safeTitle(file),
        description: '',
        tags: '',
        categoryId: '22',
        privacyStatus: 'public',
        ...defaultScheduleParts(),
        selectedPlatforms: ['youtube'],
        status: 'draft',
      };
    });
    setMessage(null);
  }

  function updateItem(patch: Partial<ComposerState>) {
    setItem((current) =>
      current
        ? {
            ...current,
            ...patch,
            status: current.status === 'scheduled' ? 'draft' : patch.status || current.status,
            error: patch.error,
          }
        : current
    );
  }

  function removeItem() {
    setItem((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);
      return null;
    });
  }

  function togglePlatform(platform: Platform) {
    if (!item) return;
    const exists = item.selectedPlatforms.includes(platform);
    const next = exists
      ? item.selectedPlatforms.filter((current) => current !== platform)
      : [...item.selectedPlatforms, platform];

    updateItem({ selectedPlatforms: next.length ? next : ['youtube'] });
  }

  async function scheduleOne(current: ComposerState) {
    if (!current.selectedPlatforms.includes('youtube')) {
      throw new Error('Only YouTube auto-upload is live right now. Other platforms are prepared for previews and credential setup.');
    }

    if (!current.title.trim()) throw new Error('Title is required.');

    const nextScheduledAt = scheduleDateFromParts(current.scheduledDate, current.scheduledTime);
    if (!nextScheduledAt || Number.isNaN(nextScheduledAt.getTime())) {
      throw new Error('Valid schedule date/time is required.');
    }

    if (nextScheduledAt.getTime() <= Date.now() + 20 * 60 * 1000) {
      throw new Error('YouTube scheduled uploads need a publish time at least 20 minutes from now.');
    }

    await scheduleYoutubeVideo({
      file: current.file,
      title: current.title.trim(),
      description: current.description.trim(),
      scheduledAt: nextScheduledAt,
      privacyStatus: current.privacyStatus,
      tags: current.tags,
      categoryId: current.categoryId,
    });
  }

  async function handleScheduleSelected() {
    if (!item) {
      setMessage('Add a video first.');
      return;
    }

    setIsScheduling(true);
    setMessage(null);
    updateItem({ status: 'uploading', error: undefined });

    try {
      await scheduleOne(item);
      clearScheduledPostsCache();
      updateItem({ status: 'scheduled', error: undefined });
      setMessage('Post scheduled successfully. YouTube will publish it at the selected time.');
    } catch (error) {
      updateItem({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown scheduling error',
      });
    } finally {
      setIsScheduling(false);
    }
  }

  return (
    <main className="min-h-screen p-2.5 text-white sm:p-3">
      <div className="mx-auto max-w-[96rem] space-y-2.5">
        <header>
          <Badge tone="primary"><FaCalendarAlt />Private Composer</Badge>
          <h1 className="mt-1.5 text-lg font-black tracking-tight text-white">Create scheduled post</h1>
          <p className="mt-1 text-xs text-slate-400">Upload one video, complete YouTube metadata, preview each channel, and pick a local publish time.</p>
        </header>

        {message && (
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-blue-100">
            {message}
          </div>
        )}

        <Card className="space-y-2.5">
          <SectionLabel>Post to</SectionLabel>
          <div className="flex flex-wrap gap-3">
            {platforms.slice(0, 4).map((platform) => {
              const selected = item?.selectedPlatforms.includes(platform.id) ?? platform.id === 'youtube';
              return (
                <button
                  type="button"
                  key={platform.id}
                  title={platform.name}
                  aria-label={platform.name}
                  onClick={() => togglePlatform(platform.id)}
                  disabled={!item}
                  className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border text-xl transition disabled:cursor-not-allowed disabled:opacity-70 ${
                    selected ? 'border-blue-500 bg-blue-600 text-white ring-2 ring-blue-500/40' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  {platform.icon}
                  {selected && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-500">{item?.selectedPlatforms.length || 1} platform selected</p>
        </Card>

        <div className="grid gap-3 xl:grid-cols-[1fr_300px]">
          <section className="space-y-3">
            <Card>
              <SectionLabel>Media</SectionLabel>
              <label className="mt-2.5 block cursor-pointer rounded-xl border border-dashed border-slate-600 bg-slate-950/60 p-3 text-center transition hover:border-blue-400/70 hover:bg-blue-500/5">
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(event) => handleFiles(event.target.files)}
                />
                {item ? (
                  <div className="grid gap-3 sm:grid-cols-[110px_1fr] sm:text-left">
                    <video src={item.previewUrl} className="mx-auto aspect-[9/16] h-36 rounded-lg bg-slate-950 object-cover" muted playsInline controls />
                    <div className="flex flex-col justify-center">
                      <p className="font-bold text-slate-100">{item.file.name}</p>
                      <p className="mt-1 text-xs text-slate-400">{fileSize(item.file.size)}</p>
                      <p className="mt-2 text-[10px] text-slate-500">Click here to replace the uploaded video.</p>
                      <Button type="button" variant="danger" onClick={(event) => { event.preventDefault(); removeItem(); }} className="mt-3 w-fit px-2.5 py-1.5">
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                    <div className="py-4">
                    <FaCloudUploadAlt className="mx-auto mb-2 text-3xl text-slate-500" />
                    <p className="font-black text-slate-100">Upload Media</p>
                    <p className="mt-1.5 text-xs text-slate-400">Click or drag a video to upload.</p>
                    <p className="mt-1.5 text-[10px] text-slate-600">Supports MP4, MOV, MPEG, and vertical short-form videos.</p>
                  </div>
                )}
              </label>
            </Card>

            <Card className="space-y-3">
              <SectionLabel>Platform Settings</SectionLabel>
              {!item ? (
                <p className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400">Upload a video to unlock YouTube settings.</p>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <div className="mb-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-md text-sm ${platformMap.youtube.iconClassName}`}>{platformMap.youtube.icon}</span>
                      <div>
                        <h2 className="font-black">YouTube Settings</h2>
                        <p className="text-[10px] text-slate-500">Metadata sent to the YouTube upload API.</p>
                      </div>
                    </div>
                    <StatusPill status={item.status} />
                  </div>

                  <div className="space-y-3">
                    <Field label="Video Title" hint={`${item.title.length}/100`}>
                      <Input value={item.title} maxLength={100} placeholder="Enter video title" onChange={(event) => updateItem({ title: event.target.value })} />
                    </Field>

                    <Field label="Description" hint={`${item.description.length}/5000 characters`}>
                      <Textarea value={item.description} rows={3} maxLength={5000} placeholder="Describe your video, add links, timestamps, or hashtags..." onChange={(event) => updateItem({ description: event.target.value })} />
                    </Field>

                    <Field label="Tags" hint="Comma separated. YouTube uses tags for discovery and typo matching.">
                      <Input value={item.tags} placeholder="shorts, tutorial, risoca" onChange={(event) => updateItem({ tags: event.target.value })} />
                    </Field>

                    <div className="grid gap-3 md:grid-cols-2">
                      <Field label="Category">
                        <Select value={item.categoryId} onChange={(event) => updateItem({ categoryId: event.target.value })}>
                          {youtubeCategories.map((category) => (
                            <option key={category.id} value={category.id}>{category.label}</option>
                          ))}
                        </Select>
                      </Field>

                      <Field label="Visibility">
                        <Select value={item.privacyStatus} onChange={(event) => updateItem({ privacyStatus: event.target.value as PrivacyStatus })}>
                          <option value="public">Scheduled public release</option>
                          <option value="private">Upload private now</option>
                          <option value="unlisted">Upload unlisted now</option>
                        </Select>
                      </Field>

                    </div>
                  </div>
                </div>
              )}
            </Card>
          </section>

          <aside className="space-y-3 xl:sticky xl:top-3 xl:self-start">
            <Card>
              <div className="mb-3 flex items-center gap-2">
                <FaPlay className="text-blue-300" />
                <h2 className="text-base font-black">Post Preview</h2>
              </div>

              {item ? (
                <div className="grid grid-cols-2 gap-2">
                  {platforms.slice(0, 4).map((platform) => (
                    <PlatformPreview
                      key={platform.id}
                      platform={platform.id}
                      name={platform.name}
                      label={platform.contentType}
                      selected={item.selectedPlatforms.includes(platform.id)}
                      title={item.title}
                      description={item.description}
                      mediaUrl={item.previewUrl}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-700 p-5 text-center text-xs text-slate-400">
                  Preview appears after upload.
                </div>
              )}
            </Card>
          </aside>
        </div>

        <Card className="sticky bottom-2 z-30 border-blue-500/20 bg-slate-950/95 shadow-xl shadow-slate-950/50">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid gap-2.5 sm:grid-cols-2">
              <Field label="Date">
                <Input type="date" value={item?.scheduledDate || defaultScheduleParts().scheduledDate} disabled={!item} onChange={(event) => updateItem({ scheduledDate: event.target.value })} />
              </Field>
              <Field label="Time">
                <Input type="time" value={item?.scheduledTime || defaultScheduleParts().scheduledTime} disabled={!item} onChange={(event) => updateItem({ scheduledTime: event.target.value })} />
              </Field>
            </div>

            <div className="flex flex-col gap-2.5 lg:items-end">
              <p className="text-xs text-slate-400">{scheduleHelper}</p>
              {item?.error && (
                <p className="max-w-xl text-xs text-red-300">
                  <FaExclamationTriangle className="mr-2 inline" />
                  {item.error}
                </p>
              )}
              <Button type="button" onClick={handleScheduleSelected} disabled={!item || isScheduling} className="min-w-40 bg-gradient-to-r from-blue-600 to-fuchsia-600">
                {isScheduling ? <FaSpinner className="animate-spin" /> : <FaRocket />}
                Schedule Post
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-l-4 border-blue-500 pl-2.5 text-xs font-black text-slate-100">
      {children}
    </p>
  );
}

function StatusPill({ status }: { status: ComposerState['status'] }) {
  const tone = {
    draft: 'default',
    uploading: 'primary',
    scheduled: 'success',
    error: 'danger',
  }[status] as 'default' | 'primary' | 'success' | 'danger';

  return (
    <Badge tone={tone} className="mt-2 capitalize">
      {status}
    </Badge>
  );
}

function PlatformPreview({
  platform,
  name,
  label,
  selected,
  title,
  description,
  mediaUrl,
}: {
  platform: Platform;
  name: string;
  label: string;
  selected: boolean;
  title: string;
  description: string;
  mediaUrl: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border transition ${
        selected ? 'border-blue-500 bg-slate-950 shadow-lg shadow-blue-950/30' : 'border-slate-800 bg-slate-950/60 opacity-45'
      }`}
    >
      <div className="flex items-center gap-1.5 border-b border-slate-800 px-2 py-1.5">
        <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] ${platformMap[platform].iconClassName}`}>
          {platformMap[platform].icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">{name}</p>
          <p className="text-[10px] text-slate-500">{label}</p>
        </div>
      </div>

      <div className="p-2">
        <div className="relative mx-auto aspect-[9/16] max-h-36 overflow-hidden rounded-md bg-slate-900">
          <video src={mediaUrl} className="h-full w-full object-cover" muted playsInline loop autoPlay />
          <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-[10px]">9:16</div>
        </div>

        <p className="mt-2 line-clamp-2 text-[11px] font-semibold text-slate-100">{title || 'Untitled post'}</p>
        <p className="mt-1 line-clamp-2 text-[11px] text-slate-400">
          {description || 'Caption preview will appear here.'}
        </p>
      </div>
    </div>
  );
}
