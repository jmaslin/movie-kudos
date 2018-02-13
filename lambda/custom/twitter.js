var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Twit = require('twit');
var twitterConfig = require('./config.json').twitter;
const TWITTER_ENDPOINT = 'https://api.twitter.com/1.1/statuses/update.json';
const T = new Twit(twitterConfig);
const findPerson = function findPerson(query) {
    return __awaiter(this, void 0, void 0, function* () {
        const { err, data, res } = yield T.get('users/search', { q: query });
        if (err) {
            return { error: 'Error looking up person.' };
        }
        if (data.length === 0) {
            return { error: 'Could not find a match.' };
        }
        else if (data[0].verified === true) {
            return { username: data[0].screen_name };
        }
        else {
            return { error: 'Not a verified account, do not @ them.' };
        }
    });
};
const buildTweet = function buildTweet(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const twitterUser = yield findPerson(data.person.name);
        const kudosPerson = twitterUser.username ? `@${twitterUser.username}` : data.person.name;
        const status = `Kudos to ${kudosPerson} for their role as ${data.person.role} on the movie ${data.movieName}! #MovieKudos`;
        return status;
    });
};
const sendTweet = function sendTweet(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const status = yield buildTweet(data);
        return T.post('statuses/update', { status });
    });
};
module.exports = { findPerson, buildTweet, sendTweet };
//# sourceMappingURL=twitter.js.map