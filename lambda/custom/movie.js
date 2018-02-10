var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const IS_DEV = process.env.IS_TRAVIS ? true : false;
const MOVIE_DB_ENDPOINT = "https://api.themoviedb.org/3";
let MOVIE_DB_API_KEY = '';
if (!IS_DEV) {
    const movieConfig = require('./config.json').movie_db;
    MOVIE_DB_API_KEY = movieConfig.api_key;
}
else {
    MOVIE_DB_API_KEY = process.env.TRAVIS_MOVIE_API_KEY;
}
const request = require('request-promise');
const searchForMovie = function searchForMovie(query) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${MOVIE_DB_ENDPOINT}/search/movie?query=${encodeURIComponent(query)}&api_key=${MOVIE_DB_API_KEY}`;
        const res = yield request(url);
        const data = JSON.parse(res);
        if (data && data.total_results > 0) {
            return data;
        }
    });
};
const filterCastMembers = function filterCastMembers(data) {
    return data.filter((person) => {
        // Filter out dead people
        if (person.job && person.job === 'In Memory Of') {
            return false;
        }
        if (!person.name) {
            return false;
        }
        if (!person.character && !person.job) {
            return false;
        }
        return true;
    });
};
const getRandomPerson = function getRandomPerson(groupMembers) {
    const randomNumber = Math.floor(Math.random() * groupMembers.length);
    return groupMembers[randomNumber];
};
const getRole = function getRole(person) {
    let roleName = person.character ? person.character : person.job;
    return roleName.replace(/ *\([^)]*\) */g, '');
};
const pickGroupToUse = function pickGroupToUse(personType) {
    let groupToUse;
    if (personType === '') {
        groupToUse = Math.random() > 0.5 ? 'cast' : 'crew';
    }
    else if (personType === 'crew') {
        groupToUse = 'crew';
    }
    else if (personType === 'cast' || personType.includes('act')) {
        groupToUse = 'cast';
    }
    return groupToUse;
};
// TODO: Update this logic
const getPersonOnMovie = function getPersonOnMovie(data, personType) {
    const groupToUse = pickGroupToUse(personType);
    const groupMembers = filterCastMembers(data[groupToUse]);
    const person = getRandomPerson(groupMembers);
    const name = person.name;
    const role = getRole(person);
    return { name, role };
};
const getMovieCredits = function getMovieCredits(movieId) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${MOVIE_DB_ENDPOINT}/movie/${movieId}/credits?api_key=${MOVIE_DB_API_KEY}`;
        const res = yield request(url);
        const data = JSON.parse(res);
        if (data.cast && data.cast.length > 0) {
            return data;
        }
    });
};
const pickMovieFromResults = function pickMovieFromResults(results) {
    if (results.length === 1) {
        return results[0];
    }
    else {
        const randomNumber = Math.floor(Math.random() * Math.round(results.length * 0.3));
        return results[randomNumber];
    }
};
const findMovie = function findMovie(query) {
    return __awaiter(this, void 0, void 0, function* () {
        const movieSearchData = yield searchForMovie(query);
        if (movieSearchData) {
            const movieResult = pickMovieFromResults(movieSearchData.results);
            return {
                id: movieResult.id,
                name: movieResult.original_title
            };
        }
    });
};
const getSinglePersonFromMovie = function getSinglePersonFromMovie(query, personType) {
    return __awaiter(this, void 0, void 0, function* () {
        const movie = yield findMovie(query);
        if (!movie) {
            return { error: 'Could not find movie.' };
        }
        const movieCredits = yield getMovieCredits(movie.id);
        const castMember = getPersonOnMovie(movieCredits, personType);
        if (!castMember || !castMember.name) {
            return { error: 'Could not find cast member.' };
        }
        return {
            movieName: movie.name,
            person: castMember
        };
    });
};
const getRoleFromMovie = function getRoleFromMovie(movieName, roleName) {
    return __awaiter(this, void 0, void 0, function* () {
        const movie = yield findMovie(movieName);
        if (!movie) {
            return { error: 'Could not find movie.' };
        }
        const movieCredits = yield getMovieCredits(movie.id);
        const creditList = movieCredits.cast.concat(movieCredits.crew);
        const results = creditList.filter((person) => {
            const role = person.job ? person.job : person.character;
            if (role.toLowerCase().includes(roleName.toLowerCase())) {
                return true;
            }
        });
        if (results.length > 0) {
            return { movie, person: results[0] };
        }
        else {
            return { movie, error: 'Role not found.' };
        }
    });
};
module.exports = { findMovie, getRoleFromMovie, getSinglePersonFromMovie };
//# sourceMappingURL=movie.js.map