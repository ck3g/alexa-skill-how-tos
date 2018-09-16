/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');

const tableName = 'ToyRobotStates';
const persistenceAdapter = new DynamoDbPersistenceAdapter({
  tableName,
  createTable: true
});

const CARD_TITLE = 'The Toy Robot Simulator';
const HELP_MESSAGE = 'You can place your robot to a default position using "Place" command. Once the robot is in the position you can move it using "move" command, rotate it using "turn left" or "turn right" commands. In between, you can use the "Report" command to ask for its current position.';
const WELCOME_MESSAGE = `Welcome to the toy robot simulator! ${HELP_MESSAGE}`;

const calculateNewPosition = (position) => {
  switch (position.direction) {
    case 'north':
      position.x = Math.min(position.x + 1, 4);
      return;
    case 'east':
      position.y = Math.min(position.y + 1, 4);
      return;
    case 'south':
      position.x = Math.max(position.x - 1, 0);
      return;
    case 'west':
      position.x = Math.max(position.y - 1, 0);
      return;

    default:
  }

  return position;
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    return new Promise((resolve, reject) => {
      handlerInput.attributesManager.getPersistentAttributes()
        .then((attributes) => {
          const { position } = attributes;

          let speechText = WELCOME_MESSAGE;

          if (typeof position !== 'undefined') {
            const { direction, x, y } = position;

            speechText = `The position has been restored. The robot is in position ${x} ${y} facing ${direction}.`;
          }

          resolve(handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard(CARD_TITLE, speechText)
            .getResponse());
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  },
};

const PlaceIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'PlaceIntent';
  },
  handle(handlerInput) {
    return new Promise((resolve, reject) => {
      handlerInput.attributesManager.getPersistentAttributes()
        .then((attributes) => {
          const speechText = 'The robot is in the initial position.';

          attributes.position = {
            'direction': 'north',
            'x': 0,
            'y': 0
          };

          handlerInput.attributesManager.setPersistentAttributes(attributes);
          handlerInput.attributesManager.savePersistentAttributes();

          resolve(handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard(CARD_TITLE, speechText)
            .getResponse());
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
};

const ReportIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ReportIntent';
  },
  async handle(handlerInput) {
    const attributes = await handlerInput.attributesManager.getPersistentAttributes();
    const { position } = attributes;

    let speechText = '';

    if (typeof position === 'undefined') {
      speechText = 'The robot is not in the position yet. You need to place it first.';
    } else {
      const { direction, x, y } = position;

      speechText = `The robot is in position ${x} ${y} facing ${direction}.`;
    }

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(CARD_TITLE, speechText)
      .getResponse();
  },
};

const TurnRightIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'TurnRightIntent';
  },
  async handle(handlerInput) {
    const attributes = await handlerInput.attributesManager.getPersistentAttributes();
    const { position } = attributes;
    const rotateDirections = {
      north: 'east',
      east: 'south',
      south: 'west',
      west: 'north'
    };
    let speechText = '';

    if (typeof position === 'undefined') {
      speechText = 'The robot is not in the position yet. You need to place it first.';
    } else {
      position.direction = rotateDirections[position.direction];
      speechText = 'Beep-Boop.';
    }

    handlerInput.attributesManager.setPersistentAttributes(attributes);
    await handlerInput.attributesManager.savePersistentAttributes();

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(CARD_TITLE, speechText)
      .getResponse();
  },
};

const TurnLeftIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'TurnLeftIntent';
  },
  async handle(handlerInput) {
    const attributes = await handlerInput.attributesManager.getPersistentAttributes();
    const { position } = attributes;
    const rotateDirections = {
      north: 'west',
      west: 'south',
      south: 'east',
      east: 'north'
    };
    let speechText = '';

    if (typeof position === 'undefined') {
      speechText = 'The robot is not in the position yet. You need to place it first.';
    } else {
      position.direction = rotateDirections[position.direction];
      speechText = 'Beep-Boop.';
    }

    handlerInput.attributesManager.setPersistentAttributes(attributes);
    await handlerInput.attributesManager.savePersistentAttributes();

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(CARD_TITLE, speechText)
      .getResponse();
  },
};

const MoveIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'MoveIntent';
  },
  async handle(handlerInput) {
    const attributes = await handlerInput.attributesManager.getPersistentAttributes();
    let { position } = attributes;
    let speechText = '';

    if (typeof position === 'undefined') {
      speechText = 'The robot is not in the position yet. You need to place it first.';
    } else {
      position = calculateNewPosition(position);
      speechText = 'Beep-Boop.';
    }

    handlerInput.attributesManager.setPersistentAttributes(attributes);
    await handlerInput.attributesManager.savePersistentAttributes();

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(CARD_TITLE, speechText)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_MESSAGE)
      .withSimpleCard(CARD_TITLE, HELP_MESSAGE)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'The connection with the robot terminated!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(CARD_TITLE, speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    PlaceIntentHandler,
    ReportIntentHandler,
    TurnRightIntentHandler,
    TurnLeftIntentHandler,
    MoveIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .withPersistenceAdapter(persistenceAdapter)
  .addErrorHandlers(ErrorHandler)
  .lambda();
