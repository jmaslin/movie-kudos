const Twit = require('twit');

const IS_DEV = process.env.IS_TRAVIS ? true : false;
const TWITTER_ENDPOINT = 'https://api.twitter.com/1.1/statuses/update.json';

let twitterConfig;

if (!IS_DEV) {
  twitterConfig = require('./config.json').twitter;
} else {
  twitterConfig = {
    "consumer_key": process.env.TRAVIS_TWITTER_CONSUMER_KEY,
    "consumer_secret": process.env.TRAVIS_TWITTER_CONSUMER_SECRET,
    "access_token": process.env.TRAVIS_TWITTER_TOKEN,
    "access_token_secret": process.env.TRAVIS_TWITTER_TOKEN_SECRET
  };
}

const T = new Twit(twitterConfig);

const findPerson = async function findPerson(query: string) {
  const { err, data, res } = await T.get('users/search', { q: query});

  if (err) {
    return { error: 'Error looking up person.' };
  }

  if (data.length === 0) {
    return { error: 'Could not find a match.' };
  } else if (data[0].verified === true) {
    return { username: data[0].screen_name };
  } else {
    return { error: 'Not a verified account, do not @ them.' };
  }
};

const buildTweet = async function buildTweet(data: any) {
  const twitterUser = await findPerson(data.person.name);
  const kudosPerson = twitterUser.username ? `@${twitterUser.username}` : data.person.name;
  const status = `Kudos to ${kudosPerson} for their role as ${data.person.role} on the movie ${data.movieName}! #MovieKudos`;

  return status;
};

const sendTweet = async function sendTweet(data: any) {
  const status: string = await buildTweet(data);

  return T.post('statuses/update', { status });
};

module.exports = { findPerson, buildTweet, sendTweet };
