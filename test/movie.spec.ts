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

test('getRoleFromMovie gives the person who plays role', async function() {
  let result = await Movie.getRoleFromMovie('star wars episode 4', 'director');
  expect(result.person.name).toBe('George Lucas');

  result = await Movie.getRoleFromMovie('star wars episode 4', 'luke skywalker');
  expect(result.person.name).toBe('Mark Hamill');
});

test('getRoleFromMovie returns an error', async function() {
  const result = await Movie.getRoleFromMovie('star wars', 'wizard master');
  expect(result.error).toBe('Role not found.');
});
