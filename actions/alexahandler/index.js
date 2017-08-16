const _ = require('lodash');
const openwhisk = require('openwhisk');
const routes = require('openwhisk-routes');

const SESSIONCONTEXT = 'sessioncontext';

exports.main = routes(action => {
  const ow = openwhisk();

  action.all('/', (req, res) => {
    ow.actions
      .invoke({
        name: `${req.wsk.config.openwhisk.package}/datastore`,
        blocking: true,
        result: true,
        params: {
          operation: 'list',
          filter: {
            type: SESSIONCONTEXT,
            sessionid: _.get(req, 'body.session.sessionId')
          }
        }
      })
      .then(result => {
        if (_.size(result.result) < 1) {
          return ow.actions
            .invoke({
              name: `${req.wsk.config.openwhisk.package}/datastore`,
              blocking: true,
              result: true,
              params: {
                operation: 'create',
                doc: {
                  type: SESSIONCONTEXT,
                  sessionid: _.get(req, 'body.session.sessionId')
                }
              }
            })
            .then(result => result.result);
        } else {
          return _.head(result.result);
        }
      })
      .then(context => ow.actions.invoke({
        name: `${req.wsk.config.openwhisk.package}/conversation`,
        blocking: true,
        result: true,
        params: {
          text: _.get(req, 'body.request.intent.slots.Utterance.value', 'Lorem ipsum foo bar'),
          context,
          userid: _.get(req, 'body.session.user.userId')
        }
      }))
      .then(({ text, context }) => ow.actions
        .invoke({
          name: `${req.wsk.config.openwhisk.package}/datastore`,
          blocking: true,
          result: true,
          params: {
            operation: 'update',
            doc: context,
            id: context._id
          }
        })
        .then(result => {
          console.log(`Input: ${_.get(req, 'body.request.intent.slots.Utterance.value', 'Lorem ipsum foo bar')}`);
          console.log(`Output: ${text}`);
          console.log(`ShouldEndSession: ${context.shouldEndSession}`);
          return result;
        })
        .then(result => res.send({
          version: "1.0",
          response: {
            shouldEndSession: context.shouldEndSession,
            outputSpeech: {
              type: "PlainText",
              text: text
            }
          }
        })));
  });
}, { ignoreProperties: ['config'] });