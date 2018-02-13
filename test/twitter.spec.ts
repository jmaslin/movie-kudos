const Twitter = require('../src/twitter');

test('findPerson finds a person', async function() {
  const query = 'bill gates';
  const person = await Twitter.findPerson(query);

  expect(person.username).toBe('BillGates');
});

test('findPerson returns an error', async function() {
  const query = 'some random person that does not exist';
  const person = await Twitter.findPerson(query);

  expect(person.error).toBe('Could not find a match.');
})

test('buildTweet with a famous person', async function() {
  const data = {
    person: { name: 'Bill Gates', role: 'computer guy' },
    movieName: 'Silicon Valley'
  };
  const tweet = await Twitter.buildTweet(data);
  const expected = 'Kudos to @BillGates for their role as computer guy on the movie Silicon Valley! #MovieKudos';

  expect(tweet).toEqual(expected);
})

test('buildTweet with an unknown person', async function() {
  const data = {
    person: { name: 'Erlich Bachman', role: 'founder of Aviato' },
    movieName: 'Silicon Valley'
  };
  const tweet = await Twitter.buildTweet(data);
  const expected = 'Kudos to Erlich Bachman for their role as founder of Aviato on the movie Silicon Valley! #MovieKudos';

  expect(tweet).toEqual(expected);
})
