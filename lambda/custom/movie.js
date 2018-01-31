const config = require('./config.json');

const MOVIE_DB_ENDPOINT = 'https://api.themoviedb.org/3';
const MOVIE_DB_API_KEY = config.movie_db.api_key;

const getContent = function getContent(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? require('https') : require('http');
    const request = lib.get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
         reject(new Error('Failed to load page, status code: ' + response.statusCode));
       }
      const body = [];
      response.on('data', (chunk) => body.push(chunk));
      response.on('end', () => resolve(JSON.parse(body.join(''))));
    });
    request.on('error', (err) => reject(err))
  });
};

const getMovie = function getMovie(query) {
  // FIXME: Better format
  const url = `${MOVIE_DB_ENDPOINT}/search/movie?query=${encodeURIComponent(query)}&api_key=${MOVIE_DB_API_KEY}`

  return new Promise((resolve, reject) => {
    getContent(url).then((data) => {
      if (data.total_results === 0) {
        reject('movie not found')
      } else {
        resolve(data);
      }
    });
  });
};

const filterCastMembers = function filterCastMembers(data) {
  return data.filter((person) => {
    // Filter out dead people
    if (person.job && person.job === 'In Memory Of') { return false; }
    if (!person.name) { return false; }
    if (!person.character && !person.job) { return false; }

    return true;
  });
};

const getRandomCastMember = function getRandomCastMember(cast) {
  const randomNumber = Math.floor( Math.random() * cast.length );

  return cast[randomNumber];
}

// TODO: Update this logic
const pickCastMember = function pickCastMember(data) {
  const castMembers = filterCastMembers(data.cast);
  const person = getRandomCastMember(castMembers);

  person.role = person.character ? person.character : person.job;
  person.role = person.role.replace(/ *\([^)]*\) */g, '');

  return { name: person.name, role: person.role };
};

const getCastMember = function getCastMember(movieId) {
  // FIXME: Clean this up
  const url = [MOVIE_DB_ENDPOINT, 'movie', movieId, `credits?api_key=${MOVIE_DB_API_KEY}`].join('/');

  return new Promise((resolve, reject) => {
    getContent(url).then((data) => {
      if (data.cast && data.cast.length > 0) {
        resolve(pickCastMember(data));
      } else {
        reject('no cast');
      }
    });
  });
};

const pickMovieFromResults = function pickMovieFromResults(results) {
  if (results.length === 1) {
    return results[0];
  } else {
    // only look at top 20% of results
    const randomNumber = Math.floor( Math.random() * Math.round(results.length * 0.2) );
    return results[randomNumber];
  }
};

const findMovie = function findMovie(query) {
  const movieInfo = {};

  return new Promise((resolve, reject) => {
    getMovie(query).then((data) => {
      const movieResult = pickMovieFromResults(data.results);

      movieInfo.id = movieResult.id;
      movieInfo.movieName = movieResult.original_title;

      getCastMember(movieInfo.id).then((castMember) => {
        movieInfo.person = castMember;
        resolve(movieInfo);
      }).catch((err) => {
        console.log('Error getting cast member:', err);
        reject(err);
      });

    }).catch((err) => {
      console.log('Error finding movie:', err);
      reject(err);
    });
  });
};

module.exports = { findMovie };
