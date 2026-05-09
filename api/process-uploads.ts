type JsonResponse = {
  status: (code: number) => {
    json: (body: unknown) => void;
  };
};

export default async function handler(_req: unknown, res: JsonResponse) {
  try {
    const response = await fetch(
      "https://oiqqdanhxmmckwpruedg.supabase.co/functions/v1/process-scheduled-uploads"
    );

    const data = await response.json();
    res.status(response.ok ? 200 : response.status).json(data);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to process uploads",
    });
  }
}
