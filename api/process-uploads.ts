export default async function handler(_req: any, res: any) {
  try {
    const response = await fetch(
      "https://oiqqdanhxmmckwpruedg.supabase.co/functions/v1/process-scheduled-uploads"
    );

    const data = await response.json();
    res.status(response.ok ? 200 : response.status).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to process uploads" });
  }
}
