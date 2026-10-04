'use client';

import { useState } from 'react';
import Image from 'next/image';
import { IoPlayCircle, IoLogoYoutube } from 'react-icons/io5';
import { useConsent } from './ConsentProvider';

// Click-to-load YouTube embed that doubles as a consent gate.
// Until the visitor plays, no request to youtube.com is made (privacy + TTI win).
// On play: if media consent is granted, the player loads directly; otherwise we
// surface a brief two-click notice before loading the third-party iframe.
// Callers must pass key={videoId} so that switching videos starts from the facade.
export default function ConsentedYouTube({ videoId, title, poster }) {
  const { status, accept } = useConsent();
  const [loaded, setLoaded] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (!videoId) return null;

  if (loaded) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups allow-forms"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    );
  }

  const handlePlay = () => {
    if (status === 'accepted') {
      setLoaded(true);
    } else {
      setConfirming(true);
    }
  };

  const loadAndAccept = () => {
    accept();
    setLoaded(true);
  };

  return (
    <div className="absolute inset-0">
      {poster ? (
        <Image
          src={poster}
          alt={title || 'Video thumbnail'}
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-900" />
      )}
      <div className="absolute inset-0 bg-black/45" />

      {!confirming ? (
        <button
          type="button"
          onClick={handlePlay}
          aria-label={`Play video: ${title || 'video'}`}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white transition-colors hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-white/40"
        >
          <IoPlayCircle className="h-16 w-16 drop-shadow-lg" aria-hidden="true" />
          <span className="text-sm font-bold drop-shadow">Play video</span>
        </button>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 px-6 text-center text-white">
          <IoLogoYoutube className="h-9 w-9 text-red-500" aria-hidden="true" />
          <p className="max-w-sm text-sm leading-6">
            This video is hosted on YouTube and may set third-party cookies.
            Loading it counts as consent to embedded media.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={loadAndAccept}
              className="inline-flex h-10 items-center justify-center rounded-full bg-red-700 px-5 text-sm font-bold text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Load video
            </button>
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-full border border-white/30 bg-white/10 px-5 text-sm font-bold text-white transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Watch on YouTube
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
