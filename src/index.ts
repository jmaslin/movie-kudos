const Alexa = require('alexa-sdk');
const movie = require('./movie');
// const twitter = require('./twitter');

const APP_ID = "amzn1.ask.skill.2d379926-4e22-4182-9b56-b71edb172d03";

const SKILL_NAME = 'Movie Kudos';
const GET_KUDODS_MESSAGE = "You should thank: ";
const HELP_MESSAGE = 'You can say thank someone from Star Wars, or any movie, or you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

const handlers = {
    'LaunchRequest': function () {
      this.attributes.speechOutput = 'Welcome to Movie Kudos! ' + HELP_MESSAGE;
      this.attributes.repromptSpeech = HELP_MESSAGE;

      this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
      this.emit(':responseReady');
    },
    'KudosIntent': async function () {
      const movieSlot = this.event.request.intent.slots.Movie;
      const personTypeSlot = this.event.request.intent.slots.Type;

      let movieName;
      let personType = '';

      if (movieSlot && movieSlot.value) {
        movieName = movieSlot.value;
      }

      if (personTypeSlot && personTypeSlot.value) {
        personType = personTypeSlot.value;
      }

      const data = await movie.getSinglePersonFromMovie(movieName, personType);

      if (data.movieName) {
        const message = `${data.person.name} for their role as ${data.person.role} in the movie ${data.movieName}`
        const speechOutput = GET_KUDODS_MESSAGE + message;

        // twitter.sendTweet(data);

        this.response.cardRenderer(SKILL_NAME, message);
        this.response.speak(speechOutput);
      } else {
        this.response.speak('Sorry, I could not find that movie.');
      }

      this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
      const speechOutput = HELP_MESSAGE;
      const reprompt = HELP_REPROMPT;

      this.response.speak(speechOutput).listen(reprompt);
      this.emit(':responseReady');
    },
    'AMAZON.RepeatIntent': function () {
      this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
      this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
      this.response.speak(STOP_MESSAGE);
      this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
      this.response.speak(STOP_MESSAGE);
      this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
      console.log(`Session ended: ${this.event.request.reason}`);
    },
    'Unhandled': function () {
      this.attributes.speechOutput = HELP_MESSAGE;
      this.attributes.repromptSpeech = HELP_REPROMPT;
      this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
      this.emit(':responseReady');
    },
};

exports.handler = function(event: any, context: any, callback: any) {
  const alexa = Alexa.handler(event, context, callback);

  alexa.appId = APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
