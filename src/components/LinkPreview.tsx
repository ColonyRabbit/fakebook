import { useEffect, useState } from "react";

export default function LinkPreview({ url }: { url: string }) {
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      .then((res) => res.json())
      .then(setMeta)
      .catch(console.error);
  }, [url]);

  if (!meta)
    return (
      <a href={url} className="text-blue-500 underline">
        {url}
      </a>
    );

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition bg-white dark:bg-gray-900 block"
    >
      {meta.images?.[0] && (
        <img
          src={meta.images[0]}
          alt="preview"
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-3">
        <p className="font-bold text-gray-800 dark:text-gray-100">
          {meta.title}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
          {meta.description}
        </p>
      </div>
    </a>
  );
}
