import { useMemo, useState } from 'react';
import { FaCalendarAlt, FaCheckCircle, FaCloudUploadAlt, FaExclamationTriangle, FaRocket, FaSpinner, FaYoutube } from 'react-icons/fa';
import { scheduleYoutubeVideo } from '../lib/scheduleUpload';

type PrivacyStatus = 'private' | 'unlisted' | 'public';

type BatchItem = {
  id: string;
  file: File;
  title: string;
  description: string;
  scheduledAt: string;
  privacyStatus: PrivacyStatus;
  status: 'ready' | 'uploading' | 'scheduled' | 'error';
  error?: string;
};

function defaultScheduleDate() {
  const date = new Date(Date.now() + 10 * 60 * 1000);
  date.setSeconds(0, 0);
  return date.toISOString().slice(0, 16);
}

function safeTitle(file: File) {
  return file.name.replace(/\.[^/.]+$/, '').slice(0, 95) || 'YouTube Video';
}

export default function BatchScheduler() {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const readyCount = useMemo(
    () => items.filter((item) => item.status === 'ready' || item.status === 'error').length,
    [items]
  );

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;

    const nextItems: BatchItem[] = Array.from(files)
      .filter((file) => file.type.startsWith('video/'))
      .map((file) => ({
        id: `${Date.now()}-${crypto.randomUUID()}`,
        file,
        title: safeTitle(file),
        description: '',
        scheduledAt: defaultScheduleDate(),
        privacyStatus: 'private',
        status: 'ready',
      }));

    setItems((current) => [...current, ...nextItems]);
    setMessage(null);
  };

  const updateItem = (id: string, patch: Partial<BatchItem>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const scheduleOne = async (item: BatchItem) => {
    if (!item.title.trim()) {
      throw new Error('Title is required.');
    }

    const scheduledAt = new Date(item.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime())) {
      throw new Error('Valid schedule date/time is required.');
    }

    await scheduleYoutubeVideo({
      file: item.file,
      title: item.title.trim(),
      description: item.description.trim(),
      scheduledAt,
      privacyStatus: item.privacyStatus,
    });
  };

  const handleScheduleAll = async () => {
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
      successCount > 0
        ? `${successCount} video${successCount === 1 ? '' : 's'} saved to Supabase scheduler.`
        : 'No videos were scheduled. Check errors below.'
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-6 shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3 text-red-400">
                <FaYoutube className="text-3xl" />
                <span className="text-sm font-semibold uppercase tracking-wide">YouTube Auto Upload</span>
              </div>
              <h1 className="text-3xl font-bold">Scheduler</h1>
              <p className="mt-2 text-slate-300">
                Upload videos, choose schedule times, and save them for automatic YouTube upload.
              </p>
            </div>

            <label className="cursor-pointer rounded-xl bg-blue-600 px-5 py-3 font-semibold shadow-lg transition hover:bg-blue-500">
              <input
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={(event) => handleFiles(event.target.files)}
              />
              <span className="flex items-center gap-2">
                <FaCloudUploadAlt /> Add Videos
              </span>
            </label>
          </div>
        </div>

        {message && (
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-blue-100">
            {message}
          </div>
        )}

        <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Videos</h2>
              <p className="text-sm text-slate-400">{items.length} loaded, {readyCount} ready to schedule</p>
            </div>

            <button
              type="button"
              onClick={handleScheduleAll}
              disabled={isScheduling || items.length === 0}
              className="rounded-xl bg-green-600 px-5 py-3 font-semibold shadow-lg transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex items-center gap-2">
                {isScheduling ? <FaSpinner className="animate-spin" /> : <FaRocket />}
                Schedule All
              </span>
            </button>
          </div>

          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-600 p-10 text-center text-slate-400">
              No videos yet. Click <strong>Add Videos</strong> to start.
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
                  <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold">{item.file.name}</p>
                      <p className="text-sm text-slate-400">
                        {(item.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {item.status === 'scheduled' && (
                        <span className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-300">
                          <FaCheckCircle /> Scheduled
                        </span>
                      )}
                      {item.status === 'uploading' && (
                        <span className="flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-300">
                          <FaSpinner className="animate-spin" /> Saving
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span className="flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-sm text-red-300">
                          <FaExclamationTriangle /> Error
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="rounded-lg border border-slate-600 px-3 py-1 text-sm text-slate-300 transition hover:border-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-300">Title</span>
                      <input
                        value={item.title}
                        onChange={(event) => updateItem(item.id, { title: event.target.value, status: item.status === 'scheduled' ? 'ready' : item.status })}
                        className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-400"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-300">Schedule time</span>
                      <input
                        type="datetime-local"
                        value={item.scheduledAt}
                        onChange={(event) => updateItem(item.id, { scheduledAt: event.target.value, status: item.status === 'scheduled' ? 'ready' : item.status })}
                        className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-400"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-300">Privacy</span>
                      <select
                        value={item.privacyStatus}
                        onChange={(event) =>
                          updateItem(item.id, {
                            privacyStatus: event.target.value as PrivacyStatus,
                            status: item.status === 'scheduled' ? 'ready' : item.status,
                          })
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-400"
                      >
                        <option value="private">Private</option>
                        <option value="unlisted">Unlisted</option>
                        <option value="public">Public</option>
                      </select>
                    </label>

                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-medium text-slate-300">Description</span>
                      <textarea
                        value={item.description}
                        onChange={(event) => updateItem(item.id, { description: event.target.value, status: item.status === 'scheduled' ? 'ready' : item.status })}
                        rows={3}
                        className="w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white outline-none focus:border-blue-400"
                      />
                    </label>
                  </div>

                  {item.error && (
                    <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                      {item.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5 text-sm text-slate-300">
          <div className="mb-2 flex items-center gap-2 font-semibold text-slate-100">
            <FaCalendarAlt /> How automation runs
          </div>
          <p>
            This page only saves scheduled jobs. The upload happens when the
            <code className="mx-1 rounded bg-slate-950 px-2 py-1">process-scheduled-uploads</code>
            Edge Function runs after the scheduled time.
          </p>
        </div>
      </div>
    </div>
  );
}
