'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface Props {
  url: string;
}

export function ShareSidebar({ url }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wa = `https://wa.me/?text=${encodeURIComponent(`Practice interview prep: ${url}`)}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const li = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const tw = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Ace your next interview with AI prep!')}`;

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-900">Share with Friends</p>
      <div className="mt-3 flex items-center gap-2">
        {/* WhatsApp */}
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on WhatsApp"
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80"
          style={{ backgroundColor: '#25D366' }}
        >
          W
        </a>
        {/* Facebook */}
        <a
          href={fb}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Facebook"
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80"
          style={{ backgroundColor: '#1877F2' }}
        >
          f
        </a>
        {/* LinkedIn */}
        <a
          href={li}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
          className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white transition-opacity hover:opacity-80"
          style={{ backgroundColor: '#0A66C2' }}
        >
          in
        </a>
        {/* X / Twitter */}
        <a
          href={tw}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X"
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80 bg-black"
        >
          𝕏
        </a>
      </div>

      <div className="mt-3 flex items-center gap-2 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
        <span className="flex-1 truncate text-xs text-gray-500 select-all">{url}</span>
        <button
          onClick={handleCopy}
          className="shrink-0 flex items-center gap-1 rounded-md bg-[#14a085] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0d8a72]"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
