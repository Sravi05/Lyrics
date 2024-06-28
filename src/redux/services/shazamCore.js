
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQueryWithRetry = async (args, api, extraOptions, retries = 5, delayMs = 1000) => {
  for (let i = 0; i < retries; i++) {
    const result = await fetchBaseQuery(args, api, extraOptions);
    if (result.error && result.error.status === 429) {
      // Too Many Requests
      console.error('Rate limit exceeded, retrying...');
      const retryAfter = result.meta.response.headers.get('Retry-After');
      const delayTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : delayMs;
      await new Promise(resolve => setTimeout(resolve, delayTime * (i + 1)));
      continue;
    }
    return result;
  }
};

export const shazamCoreApi = createApi({
  reducerPath: 'shazamCoreApi',
  baseQuery: baseQueryWithRetry,
  endpoints: (builder) => ({
    getTopCharts: builder.query({ query: () => 'v1/charts/world' }),
    getSongsByGenre: builder.query({ query: (genre) => `v1/charts/genre-world?genre_code=${genre}` }),
    getSongsByCountry: builder.query({ query: (countryCode) => `v1/charts/country?country_code=${countryCode}` }),
    getSongsBySearch: builder.query({ query: (searchTerm) => `v1/search/multi?search_type=SONGS_ARTISTS&query=${searchTerm}` }),
    getArtistDetails: builder.query({ query: (artistId) => `v2/artists/details?artist_id=${artistId}` }),
    getSongDetails: builder.query({ query: ({ songid }) => `v1/tracks/details?track_id=${songid}` }),
    getSongRelated: builder.query({ query: ({ songid }) => `v1/tracks/related?track_id=${songid}` }),
  }),
});

export const {
  useGetTopChartsQuery,
  useGetSongsByGenreQuery,
  useGetSongsByCountryQuery,
  useGetSongsBySearchQuery,
  useGetArtistDetailsQuery,
  useGetSongDetailsQuery,
  useGetSongRelatedQuery,
} = shazamCoreApi;
