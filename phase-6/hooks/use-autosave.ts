import { useEffect, useRef, useState } from 'react';

export function useAutosave(
  data: any,
  saveFn: (data: any) => Promise<boolean>,
  delayMs: number = 1500
) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    // Skip autosave on initial component mount
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    const handler = setTimeout(async () => {
      setIsSaving(true);
      setError(null);
      try {
        const success = await saveFn(data);
        if (success) {
          setLastSaved(new Date());
        } else {
          setError('Could not autosave changes.');
        }
      } catch (err: any) {
        setError(err.message || 'Autosave failed');
      } finally {
        setIsSaving(false);
      }
    }, delayMs);

    return () => clearTimeout(handler);
  }, [data, delayMs, saveFn]);

  return { isSaving, lastSaved, error };
}
