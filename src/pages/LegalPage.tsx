type LegalType = 'privacy' | 'terms' | 'data-deletion';

const updated = 'May 8, 2026';

const content: Record<LegalType, { title: string; intro: string; sections: Array<{ heading: string; body: string }> }> = {
  privacy: {
    title: 'Privacy Policy',
    intro: 'RiSoCa Scheduler is a private content scheduling dashboard used to connect creator accounts and automate publishing workflows.',
    sections: [
      { heading: 'Information we process', body: 'The app may process your login email, scheduled post metadata, uploaded media files, connected platform account identifiers, and OAuth tokens needed to publish content on your behalf.' },
      { heading: 'How information is used', body: 'Information is used only to authenticate you, store scheduled posts, connect your chosen platforms, and publish content that you schedule through the app.' },
      { heading: 'Third-party platforms', body: 'When you connect platforms such as YouTube, Facebook, Instagram, TikTok, X, LinkedIn, or Pinterest, the app uses granted permissions only for account connection, scheduling, and publishing workflows.' },
      { heading: 'Storage and security', body: 'Application data is stored in Supabase. OAuth secrets are handled by Supabase Edge Functions and should not be exposed in frontend code.' },
      { heading: 'Contact', body: 'For privacy requests, contact risoca.developer@gmail.com.' },
    ],
  },
  terms: {
    title: 'Terms of Service',
    intro: 'These terms describe acceptable use of RiSoCa Scheduler.',
    sections: [
      { heading: 'Use of the app', body: 'RiSoCa Scheduler is provided as a private automation tool for scheduling and publishing your own content to accounts you control or are authorized to manage.' },
      { heading: 'Platform rules', body: 'You are responsible for following the terms, content rules, API policies, and community guidelines of each connected platform.' },
      { heading: 'Content responsibility', body: 'You are responsible for all uploaded media, captions, metadata, and scheduled publishing actions created through the app.' },
      { heading: 'Availability', body: 'Automation depends on platform APIs, OAuth tokens, quotas, and third-party service availability. Publishing may fail if a platform changes access rules or tokens expire.' },
      { heading: 'Contact', body: 'For support or terms questions, contact risoca.developer@gmail.com.' },
    ],
  },
  'data-deletion': {
    title: 'User Data Deletion',
    intro: 'Use this page to request deletion of RiSoCa Scheduler data connected to your account.',
    sections: [
      { heading: 'How to request deletion', body: 'Email risoca.developer@gmail.com with the subject "RiSoCa Data Deletion Request" and include the email address used to sign in.' },
      { heading: 'What will be deleted', body: 'We will delete connected platform account records, scheduled post metadata, uploaded media files stored for scheduling, and related automation logs where applicable.' },
      { heading: 'Third-party platform data', body: 'Content already published to third-party platforms must be deleted directly from those platforms unless the app still has valid permission to remove it.' },
      { heading: 'Processing time', body: 'Deletion requests are normally handled as soon as possible after verification of account ownership.' },
    ],
  },
};

export default function LegalPage({ type }: { type: LegalType }) {
  const page = content[type];
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <a href="/" className="mb-8 inline-flex rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-900">Back to RiSoCa Scheduler</a>
        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <p className="text-sm font-semibold text-blue-300">RiSoCa Scheduler</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">{page.title}</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: {updated}</p>
          <p className="mt-6 text-lg leading-8 text-slate-300">{page.intro}</p>
          <div className="mt-8 space-y-6">
            {page.sections.map((section) => (
              <div key={section.heading} className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <h2 className="text-xl font-bold">{section.heading}</h2>
                <p className="mt-3 leading-7 text-slate-300">{section.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
