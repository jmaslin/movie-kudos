const Twit = require('twit');
var twitterConfig = require('./config.json').twitter;
const TWITTER_ENDPOINT = 'https://api.twitter.com/1.1/statuses/update.json';
const T = new Twit(twitterConfig);
const sendTweet = function sendTweet(data) {
    const status = `Kudos to ${data.person.name} for their role as ${data.person.role} on the movie ${data.movieName}! #MovieKudos`;
    // todo: search personName, see if they have handle (verified), if do, make tweet an @
    return T.post('statuses/update', { status });
};
module.exports = { sendTweet };
//# sourceMappingURL=twitter.js.map