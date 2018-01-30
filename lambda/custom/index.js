/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/

'use strict';
const Alexa = require('alexa-sdk');
const movie = require('./movie');
const twitter = require('./twitter');

const APP_ID = "amzn1.ask.skill.2d379926-4e22-4182-9b56-b71edb172d03";

const SKILL_NAME = 'Movie Kudos';
const GET_KUDODS_MESSAGE = "You should thank: ";
const HELP_MESSAGE = 'You can say thank someone from Star Wars, or any movie, or you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

//=========================================================================================================================================
//Editing anything below this line might break your skill.
//=========================================================================================================================================

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handlers = {
    'LaunchRequest': function () {
        this.emit('GetNewFactIntent');
    },
    'KudosIntent': function (input) {
      const movieName = input ? input : this.event.request.intent.slots.Movie.value;

      movie.findMovie(input).then((data) => {
        const message = `${data.person.name} for their role as ${data.person.role} in the movie ${data.movieName}`
        const speechOutput = GET_KUDODS_MESSAGE + message;

        twitter.sendTweet(data);

        this.response.cardRenderer(SKILL_NAME, message);
        this.response.speak(speechOutput);
        this.emit(':responseReady');
      });
    },
    // 'GetNewFactIntent': function () {
    //     const factArr = data;
    //     const factIndex = Math.floor(Math.random() * factArr.length);
    //     const randomFact = factArr[factIndex];
    //     const speechOutput = GET_FACT_MESSAGE + randomFact;
    //
    //     this.response.cardRenderer(SKILL_NAME, randomFact);
    //     this.response.speak(speechOutput);
    //     this.emit(':responseReady');
    // },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
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
};
