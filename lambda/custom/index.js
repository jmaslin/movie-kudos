var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const Alexa = require('alexa-sdk');
const movie = require('./movie');
const twitter = require('./twitter');
const APP_ID = "amzn1.ask.skill.2d379926-4e22-4182-9b56-b71edb172d03";
const SKILL_NAME = 'Movie Kudos';
const GET_KUDODS_MESSAGE = "You should thank: ";
const HELP_MESSAGE = 'You can say thank someone from Star Wars, or you can ask who played a role. What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';
const handlers = {
    'LaunchRequest': function () {
        this.attributes.speechOutput = 'Welcome to Movie Kudos! ' + HELP_MESSAGE;
        this.attributes.repromptSpeech = HELP_MESSAGE;
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'LookupPersonIntent': function () {
        return __awaiter(this, void 0, void 0, function* () {
            const movieSlot = this.event.request.intent.slots.Movie;
            const roleSlot = this.event.request.intent.slots.Role;
            const characterSlot = this.event.request.intent.slots.Character;
            let movieName;
            let role;
            if (movieSlot && movieSlot.value) {
                movieName = movieSlot.value;
            }
            if (roleSlot && roleSlot.value) {
                role = roleSlot.value;
            }
            else if (characterSlot && characterSlot.value) {
                role = characterSlot.value;
            }
            const data = yield movie.getRoleFromMovie(movieName, role);
            if (!data.movie) {
                this.response.speak('Sorry, I could not find that movie.');
            }
            else if (!data.person) {
                this.response.speak('Sorry, I could not find out who played that role.');
            }
            else if (data.person.character) {
                const message = `The character ${data.person.character} in ${data.movie.name} was played by ${data.person.name}.`;
                this.response.cardRenderer(SKILL_NAME, message);
                this.response.speak(message);
            }
            else if (data.person.job) {
                const message = `The ${data.person.job} in ${data.movie.name} was ${data.person.name}.`;
                this.response.cardRenderer(SKILL_NAME, message);
                this.response.speak(message);
            }
            else {
                this.response.speak('Sorry, there was an error looking up that role.');
            }
            this.emit(':responseReady');
        });
    },
    'KudosIntent': function () {
        return __awaiter(this, void 0, void 0, function* () {
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
            const data = yield movie.getSinglePersonFromMovie(movieName, personType);
            if (data.movieName) {
                const message = `${data.person.name} for their role as ${data.person.role} in the movie ${data.movieName}`;
                const speechOutput = GET_KUDODS_MESSAGE + message;
                twitter.sendTweet(data);
                this.response.cardRenderer(SKILL_NAME, message);
                this.response.speak(speechOutput);
            }
            else {
                this.response.speak('Sorry, I could not find that movie.');
            }
            this.emit(':responseReady');
        });
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
exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
//# sourceMappingURL=index.js.map