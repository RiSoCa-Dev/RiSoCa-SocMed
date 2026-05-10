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
import { Badge, Button, Card, EmptyState, Field, Input, PageHeader, Select, Textarea } from '../components/ui';

type Platform = PlatformKey;
type PrivacyStatus = 'private' | 'unlisted' | 'public';

type BatchItem = {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  description: string;
  scheduledAt: string;
  privacyStatus: PrivacyStatus;
  selectedPlatforms: Platform[];
  status: 'draft' | 'uploading' | 'scheduled' | 'error';
  error?: string;
};

function defaultScheduleDate() {
  const date = new Date(Date.now() + 30 * 60 * 1000);
  date.setSeconds(0, 0);
  return date.toISOString().slice(0, 16);
}

function safeTitle(file: File) {
  return file.name.replace(/\.[^/.]+$/, '').slice(0, 95) || 'Scheduled Video';
}

function fileSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

export default function BatchScheduler() {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeItemId) || items[0] || null,
    [items, activeItemId]
  );

  const scheduledCount = useMemo(
    () => items.filter((item) => item.status === 'scheduled').length,
    [items]
  );

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    const nextItems: BatchItem[] = Array.from(files)
      .filter((file) => file.type.startsWith('video/'))
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        title: safeTitle(file),
        description: '',
        scheduledAt: defaultScheduleDate(),
        privacyStatus: 'private',
        selectedPlatforms: ['youtube'],
        status: 'draft',
      }));

    setItems((current) => [...current, ...nextItems]);
    setActiveItemId((current) => current || nextItems[0]?.id || null);
    setMessage(null);
  }

  function updateItem(id: string, patch: Partial<BatchItem>) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              ...patch,
              status: item.status === 'scheduled' ? 'draft' : patch.status || item.status,
              error: patch.error,
            }
          : item
      )
    );
  }

  function removeItem(id: string) {
    setItems((current) => {
      const removed = current.find((item) => item.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      const next = current.filter((item) => item.id !== id);
      if (activeItemId === id) {
        setActiveItemId(next[0]?.id || null);
      }
      return next;
    });
  }

  function togglePlatform(item: BatchItem, platform: Platform) {
    const exists = item.selectedPlatforms.includes(platform);
    const next = exists
      ? item.selectedPlatforms.filter((p) => p !== platform)
      : [...item.selectedPlatforms, platform];

    updateItem(item.id, { selectedPlatforms: next.length ? next : ['youtube'] });
  }

  async function scheduleOne(item: BatchItem) {
    if (!item.selectedPlatforms.includes('youtube')) {
      throw new Error('Only YouTube auto-upload is live right now. Other platforms are prepared for previews and credential setup.');
    }

    if (!item.title.trim()) throw new Error('Title is required.');

    const scheduledAt = new Date(item.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      throw new Error('Valid schedule date/time is required.');
    }

    if (scheduledAt.getTime() <= Date.now() + 20 * 60 * 1000) {
      throw new Error('YouTube scheduled uploads need a publish time at least 20 minutes from now.');
    }

    await scheduleYoutubeVideo({
      file: item.file,
      title: item.title.trim(),
      description: item.description.trim(),
      scheduledAt,
      privacyStatus: item.privacyStatus,
    });
  }

  async function handleScheduleSelected() {
    if (!activeItem) {
      setMessage('Add a video first.');
      return;
    }

    setIsScheduling(true);
    setMessage(null);
    updateItem(activeItem.id, { status: 'uploading', error: undefined });

    try {
      await scheduleOne(activeItem);
      updateItem(activeItem.id, { status: 'scheduled', error: undefined });
      setMessage('Post scheduled successfully. The upload worker will publish it after the scheduled time.');
    } catch (error) {
      updateItem(activeItem.id, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown scheduling error',
      });
    } finally {
      setIsScheduling(false);
    }
  }

  async function handleScheduleAll() {
    if (!items.length) {
      setMessage('Add at least one video first.');
      return;
    }

    setIsScheduling(true);
    setMessage(null);
    let successCount = 0;

    for (const item of items) {
      if (item.status === 'scheduled') continue;
      updateItem(item.id, { status: 'uploading', error: undefined });

      try {
        await scheduleOne(item);
        successCount += 1;
        updateItem(item.id, { status: 'scheduled', error: undefined });
      } catch (error) {
        updateItem(item.id, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown scheduling error',
        });
      }
    }

    setIsScheduling(false);
    setMessage(
      successCount
        ? `${successCount} video${successCount === 1 ? '' : 's'} scheduled successfully.`
        : 'No videos were scheduled. Check item errors.'
    );
  }

  return (
    <main className="min-h-screen p-4 text-white sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          eyebrow={<Badge tone="primary"><FaCalendarAlt />Private Composer</Badge>}
          title="Create and schedule posts"
          description="Upload videos, tune captions, preview each platform, and publish through the integrations that are ready."
          action={(
            <label className="group cursor-pointer rounded-2xl bg-blue-600 px-6 py-4 font-bold shadow-lg transition hover:bg-blue-500">
              <input
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={(event) => handleFiles(event.target.files)}
              />
              <span className="flex items-center gap-3">
                <FaCloudUploadAlt className="text-xl transition group-hover:-translate-y-0.5" />
                Add Videos
              </span>
            </label>
          )}
        />

        {message && (
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-blue-100">
            {message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[320px_1fr_420px]">
          <aside className="space-y-4">
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-black">Queue</h2>
                  <p className="text-sm text-slate-400">{items.length} videos · {scheduledCount} scheduled</p>
                </div>
                <Button
                  type="button"
                  variant="success"
                  onClick={handleScheduleAll}
                  disabled={!items.length || isScheduling}
                  className="px-3 py-2"
                >
                  All
                </Button>
              </div>

              {items.length === 0 ? (
                <EmptyState title="Queue is empty" description="Add videos to start composing your private publishing batch." />
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setActiveItemId(item.id)}
                      className={`w-full rounded-2xl border p-3 text-left transition ${
                        activeItem?.id === item.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex gap-3">
                        <video src={item.previewUrl} className="h-16 w-11 rounded-lg object-cover" muted />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-100">{item.title}</p>
                          <p className="text-xs text-slate-500">{fileSize(item.file.size)}</p>
                          <StatusPill status={item.status} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </aside>

          <section className="space-y-5">
            {!activeItem ? (
              <div className="flex min-h-[520px] items-center justify-center">
                <EmptyState icon={<FaCloudUploadAlt />} title="No video selected" description="Upload a video to open the composer, previews, and scheduling controls." />
              </div>
            ) : (
              <>
                <Card>
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black">Post details</h2>
                      <p className="text-sm text-slate-400">{activeItem.file.name}</p>
                    </div>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => removeItem(activeItem.id)}
                      className="px-3 py-2"
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="space-y-5">
                    <Field label="Title" hint={`${activeItem.title.length}/100`}>
                      <Input
                        value={activeItem.title}
                        maxLength={100}
                        onChange={(event) => updateItem(activeItem.id, { title: event.target.value })}
                      />
                    </Field>

                    <Field label="Description / Caption" hint={`${activeItem.description.length}/5000`}>
                      <Textarea
                        value={activeItem.description}
                        rows={5}
                        maxLength={5000}
                        onChange={(event) => updateItem(activeItem.id, { description: event.target.value })}
                        placeholder="Write your caption, hashtags, or video description..."
                      />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Schedule time">
                        <Input
                          type="datetime-local"
                          value={activeItem.scheduledAt}
                          onChange={(event) => updateItem(activeItem.id, { scheduledAt: event.target.value })}
                        />
                      </Field>

                      <Field label="YouTube privacy">
                        <Select
                          value={activeItem.privacyStatus}
                          onChange={(event) =>
                            updateItem(activeItem.id, { privacyStatus: event.target.value as PrivacyStatus })
                          }
                        >
                          <option value="private">Private</option>
                          <option value="unlisted">Unlisted</option>
                          <option value="public">Public</option>
                        </Select>
                      </Field>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h2 className="mb-4 text-xl font-black">Platforms</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {platforms.map((platform) => {
                      const selected = activeItem.selectedPlatforms.includes(platform.id);
                      return (
                        <button
                          type="button"
                          key={platform.id}
                          onClick={() => togglePlatform(activeItem, platform.id)}
                          className={`rounded-2xl border p-4 text-left transition ${
                            selected
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${platform.iconClassName}`}>
                              {platform.icon}
                            </span>
                            <div>
                              <p className="font-semibold">{platform.name}</p>
                              <p className="text-xs text-slate-400">{platform.schedulerSummary}</p>
                            </div>
                          </div>
                          {!platform.canAutoPublish && (
                            <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                              Preview enabled. Auto-publish worker is not active yet.
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </Card>

                {activeItem.error && (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                    <FaExclamationTriangle className="mr-2 inline" />
                    {activeItem.error}
                  </div>
                )}

                <Button
                  type="button"
                  variant="success"
                  onClick={handleScheduleSelected}
                  disabled={isScheduling}
                  className="w-full px-6 py-4 text-lg"
                >
                  {isScheduling ? <FaSpinner className="animate-spin" /> : <FaRocket />}
                  Schedule Selected Post
                </Button>
              </>
            )}
          </section>

          <aside className="xl:sticky xl:top-6 xl:self-start">
            <Card>
              <div className="mb-4 flex items-center gap-2">
                <FaPlay className="text-blue-300" />
                <h2 className="text-xl font-black">Live Preview</h2>
              </div>

              {activeItem ? (
                <div className="grid grid-cols-2 gap-4">
                  {platforms.map((platform) => (
                    <PlatformPreview
                      key={platform.id}
                      platform={platform.id}
                      name={platform.name}
                      label={platform.contentType}
                      selected={activeItem.selectedPlatforms.includes(platform.id)}
                      title={activeItem.title}
                      description={activeItem.description}
                      mediaUrl={activeItem.previewUrl}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-400">
                  Preview appears after upload.
                </div>
              )}
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}

function StatusPill({ status }: { status: BatchItem['status'] }) {
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
      className={`overflow-hidden rounded-2xl border transition ${
        selected ? 'border-blue-500 bg-slate-950 shadow-lg shadow-blue-950/30' : 'border-slate-800 bg-slate-950/60 opacity-45'
      }`}
    >
      <div className="flex items-center gap-2 border-b border-slate-800 px-3 py-2">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm ${platformMap[platform].iconClassName}`}>
          {platformMap[platform].icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="text-[10px] text-slate-500">{label}</p>
        </div>
      </div>

      <div className="p-3">
        <div className="relative mx-auto aspect-[9/16] max-h-56 overflow-hidden rounded-xl bg-slate-900">
          <video src={mediaUrl} className="h-full w-full object-cover" muted playsInline loop autoPlay />
          <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-[10px]">9:16</div>
        </div>

        <p className="mt-3 line-clamp-2 text-xs font-semibold text-slate-100">{title || 'Untitled post'}</p>
        <p className="mt-1 line-clamp-2 text-[11px] text-slate-400">
          {description || 'Caption preview will appear here.'}
        </p>
      </div>
    </div>
  );
}
