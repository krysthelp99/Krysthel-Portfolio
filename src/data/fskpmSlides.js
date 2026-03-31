const baseUrl = import.meta.env.BASE_URL || '/';
const root = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

/** Slides from /public/files(fskpm)/ — URL-encoded for reliable loading */
export const FSKPM_SLIDE_URLS = [8, 9, 10, 11, 12, 13].map((n) =>
  encodeURI(`${root}files(fskpm)/${n}.jpg`)
);
