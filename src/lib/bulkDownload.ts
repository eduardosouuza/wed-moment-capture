import { zip } from 'fflate';

interface MediaItem {
  id: string;
  url: string;
  type: 'photo' | 'video';
}

export async function bulkDownloadEvent(
  items: MediaItem[],
  eventName: string,
  onProgress: (current: number, total: number) => void
): Promise<void> {
  const files: Record<string, Uint8Array> = {};
  let completed = 0;

  // Download in batches of 4 to not overwhelm the browser
  const BATCH = 4;
  for (let i = 0; i < items.length; i += BATCH) {
    const batch = items.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (item) => {
        const response = await fetch(item.url);
        if (!response.ok) throw new Error(`Falha ao baixar mídia ${item.id}`);
        const buffer = await response.arrayBuffer();
        const ext = item.type === 'photo' ? 'jpg' : 'mp4';
        files[`${item.type}-${item.id.slice(0, 8)}.${ext}`] = new Uint8Array(buffer);
        completed++;
        onProgress(completed, items.length);
      })
    );
  }

  return new Promise((resolve, reject) => {
    // level: 0 = store only (no compression for images/videos — already compressed)
    zip(files, { level: 0 }, (err, data) => {
      if (err) { reject(err); return; }
      const safeName = eventName
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]/gi, '-')
        .toLowerCase();
      const blob = new Blob([data], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${safeName}-fotos.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      resolve();
    });
  });
}
