const svg = (inner: string, sw = 1.5) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

export const ICONS = {
  logo: svg(
    '<path d="M13.8 3h-3.6"/><path d="M14.2 3l.3 3H9.5L9.8 3"/><rect x="9" y="6" width="6" height="9" rx="1.6"/><path d="M8.5 15h7"/><path d="M12 8.6v2.4"/>',
    1.4,
  ),
  food: svg(
    '<path d="M12 21V8"/><path d="M12 8c0-2-1.5-3-3-3 0 2 1.5 3 3 3z"/><path d="M12 12.5c0-2 1.5-3 3-3 0 2-1.5 3-3 3z"/><path d="M12 17c0-2 1.5-3 3-3 0 2-1.5 3-3 3z"/>',
  ),
  flask: svg(
    '<path d="M10 3h4"/><path d="M10.8 3v5.6L6.2 18a3.4 3.4 0 0 0 3 5h5.6a3.4 3.4 0 0 0 3-5L13.2 8.6V3"/><path d="M7.7 19.2h8.6"/>',
  ),
  drop: svg('<path d="M12 3.5s6.5 7 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 10.5 12 3.5 12 3.5z"/>'),
  succubus: svg(
    '<path d="M12 3.5s6.5 7 6.5 11.5a6.5 6.5 0 0 1-13 0C5.5 10.5 12 3.5 12 3.5z"/><path d="M17.8 4.2a3 3 0 0 1 3 3"/>',
  ),
  hp: svg('<path d="M12 3c1.4 3 4.2 4.6 4.2 8.2a4.2 4.2 0 0 1-8.4 0c0-1.1.4-2 1-2.9C9.6 9.6 10.8 6.5 12 3z"/>'),
  pressure: svg('<path d="M5.5 15.5a7 7 0 0 1 13 0"/><path d="M12 15.5l3.6-3"/>'),
  corruption: svg(
    '<path d="M3 12s3.6-6.2 9-6.2S21 12 21 12s-3.6 6.2-9 6.2S3 12 3 12z"/><circle cx="12" cy="12" r="2.6"/>',
  ),
  mechanism: svg(
    '<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.6M12 18.4V21M3 12h2.6M18.4 12H21M5.6 5.6l1.9 1.9M16.5 16.5l1.9 1.9M18.4 5.6l-1.9 1.9M7.5 16.5l-1.9 1.9"/>',
  ),
  endurance: svg('<path d="M12 3.2l7 2.6v5.8c0 4.4-2.9 7.3-7 8.9-4.1-1.6-7-4.5-7-8.9V5.8l7-2.6z"/>'),
  reading: svg('<path d="M2 6c2-1.5 4.5-1.5 7 0v13c-2.5-1.5-5-1.5-7 0z"/><path d="M22 6c-2-1.5-4.5-1.5-7 0v13c2.5-1.5 5-1.5 7 0z"/>'),
  save: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'),
  fullscreen: svg('<path d="M4 9V4h5"/><path d="M20 9V4h-5"/><path d="M4 15v5h5"/><path d="M20 15v5h-5"/>'),
  chevron: svg('<path d="M6 9l6 6 6-6"/>'),
  refresh: svg('<path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v4h-4"/>'),
  edit: svg('<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1z"/><path d="M14.5 6.5l3 3"/>'),
  recruit: svg('<circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.5-6 5.5-6 1.7 0 3.2.7 4.2 1.9"/><path d="M18.5 14.5v6"/><path d="M15.5 17.5h6"/>'),
  panel: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9.5 4v16"/>'),
};
