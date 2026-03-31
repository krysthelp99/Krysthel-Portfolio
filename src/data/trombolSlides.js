const baseUrl = import.meta.env.BASE_URL || '/';
const root = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

/** Slides from /public/files2(trombol)/ */
export const TROMBOL_SLIDE_URLS = [19, 20, 21, 22].map((n) =>
  encodeURI(`${root}files2(trombol)/${n}.jpg`)
);
