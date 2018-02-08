const config = require('./config.json');
const request = require('request-promise');

const MOVIE_DB_ENDPOINT = 'https://api.themoviedb.org/3';
const MOVIE_DB_API_KEY = process.env.IS_TRAVIS ?
  process.env.TRAVIS_MOVIE_API_KEY :
  config.movie_db.api_key;

interface Person {
  name: string;
  role: string;
}

interface MovieResult {
  id: number;
  name: string;
}

interface MovieDB_Movie {
  vote_count: number;
  id: number;
  video: boolean;
  vote_average: number;
  title: string;
  popularity: number;
  poster_path: string;
  original_language: string;
  original_title: string;
  genre_ids: Array<number>;
  backdrop_path: string;
  adult: boolean;
  overview: string;
  release_date: string;
}

interface MovieDB_Person {
  cast_id: number;
  character?: string;
  job?: string;
  credit_id: string;
  gender: number;
  id: number;
  name: string;
  order: number;
  profile_path: string;
}

const searchForMovie = async function searchForMovie(query: string) {
  const url = `${MOVIE_DB_ENDPOINT}/search/movie?query=${encodeURIComponent(query)}&api_key=${MOVIE_DB_API_KEY}`

  const res = await request(url);
  const data = JSON.parse(res);

  if (data && data.total_results > 0) {
    return data;
  }
};

const filterCastMembers = function filterCastMembers(data: any) {
  return data.filter((person: any) => {
    // Filter out dead people
    if (person.job && person.job === 'In Memory Of') { return false; }
    if (!person.name) { return false; }
    if (!person.character && !person.job) { return false; }

    return true;
  });
};

const getRandomPerson = function getRandomPerson(groupMembers: Array<MovieDB_Person>) {
  const randomNumber = Math.floor( Math.random() * groupMembers.length );

  return groupMembers[randomNumber];
}

const getRole = function getRole(person: MovieDB_Person) {
  let roleName = person.character ? person.character : person.job;
  return roleName.replace(/ *\([^)]*\) */g, '');
};

const pickGroupToUse = function pickGroupToUse(personType: string) {
  let groupToUse;

  if (personType === '') {
    groupToUse = Math.random() > 0.5 ? 'cast' : 'crew';
  } else if (personType === 'crew') {
    groupToUse = 'crew';
  } else if (personType === 'cast' || personType.includes('act')) {
    groupToUse = 'cast';
  }

  return groupToUse;
}

// TODO: Update this logic
const getPersonOnMovie = function getPersonOnMovie(data: any, personType: string) {
  const groupToUse = pickGroupToUse(personType);

  const groupMembers: Array<MovieDB_Person> = filterCastMembers(data[groupToUse]);
  const person: MovieDB_Person = getRandomPerson(groupMembers);

  const name: string = person.name;
  const role: string = getRole(person);

  return { name, role };
};

const getCastMember = async function getCastMember(movieId: number, personType: string) {
  const url = `${MOVIE_DB_ENDPOINT}/movie/${movieId}/credits?api_key=${MOVIE_DB_API_KEY}`;

  const res = await request(url);
  const data = JSON.parse(res);

  if (data.cast && data.cast.length > 0) {
    return getPersonOnMovie(data, personType);
  }
};

const pickMovieFromResults = function pickMovieFromResults(results: Array<MovieDB_Movie>) {
  if (results.length === 1) {
    return results[0];
  } else {
    const randomNumber = Math.floor( Math.random() * Math.round(results.length * 0.3) );
    return results[randomNumber];
  }
};

const findMovie = async function findMovie(query: string) {
  const movieSearchData = await searchForMovie(query);

  if (movieSearchData) {
    const movieResult: MovieDB_Movie = pickMovieFromResults(movieSearchData.results);

    return {
      id: movieResult.id,
      name: movieResult.original_title
    };
  }
};

const getSinglePersonFromMovie = async function getSinglePersonFromMovie(query: string, personType: string) {
  const movie: MovieResult = await findMovie(query);

  if (!movie) {
    return { error: 'Could not find movie.' };
  }

  const castMember: Person = await getCastMember(movie.id, personType);

  if (!castMember || !castMember.name) {
    return { error: 'Could not find cast member.' };
  }

  return {
    movieName: movie.name,
    person: castMember
  };
};

module.exports = { findMovie, getSinglePersonFromMovie };
