const Movie = require('../src/movie');

test('findMovie returns data about a movie', async function() {
  const movieData = await Movie.findMovie('star wars episode 4');
  expect(movieData.id).toBe(11);
  expect(movieData.name).toBe('Star Wars');
});

test('findMovie returns data about a movie', async function() {
  const movieData = await Movie.findMovie('also complete gibberish');
  expect(movieData).toBe(undefined);
});

test('getSinglePersonFromMovie returns someone', async function() {
  const movieResult = await Movie.getSinglePersonFromMovie('star wars', '');
  expect(movieResult.movieName.toLowerCase().includes('star wars')).toBe(true);
});

test('getSinglePersonFromMovie no result', async function() {
  const movieResult = await Movie.getSinglePersonFromMovie('this is complete gibberish', '');
  expect(movieResult.hasOwnProperty('error')).toBe(true);
});
