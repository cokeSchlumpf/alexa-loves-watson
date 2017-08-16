const _ = require('lodash');
const Promise = require('bluebird');
const openwhisk = require('openwhisk');
const WatsonConversation = require('watson-developer-cloud/conversation/v1');

const SHOPPINGLIST = 'SHOPPINGLIST';

exports.main = (params) => {
  const ow = openwhisk();
  const conversation = Promise.promisifyAll(new WatsonConversation({
    username: _.get(params, 'config.conversation.username', 'no username'),
    password: _.get(params, 'config.conversation.password', 'no password'),
    path: {
      workspace_id: _.get(params, 'config.conversation.workspace', 'no workspace')
    },
    version_date: WatsonConversation.VERSION_DATE_2017_04_21
  }));

  return ow.actions
    .invoke({
      name: `${params.config.openwhisk.package}/datastore`,
      blocking: true,
      result: true,
      params: {
        operation: 'list',
        filter: {
          type: SHOPPINGLIST,
          userid: params.userid
        }
      }
    })
    .then(result => {
      if (_.size(result.result) < 1) {
        return ow.actions
          .invoke({
            name: `${params.config.openwhisk.package}/datastore`,
            blocking: true,
            result: true,
            params: {
              operation: 'create',
              doc: {
                type: SHOPPINGLIST,
                userid: params.userid,
                items: {},
                list: []
              }
            }
          })
          .then(result => result.result);
      } else {
        return _.head(result.result);
      }
    })
    .then(shoppinglist => conversation.messageAsync({
      input: { text: params.text },
      context: _.assign({}, params.context || {}, { shoppinglist })
    }))
    .then(conversationresponse => {
      return {
        context: _.get(conversationresponse, 'context', {}),
        text: _.join(_.get(conversationresponse, 'output.text', []), ' ')
      };
    })
    .then(conversationresponse => ow.actions
      .invoke({
        name: `${params.config.openwhisk.package}/datastore`,
        blocking: true,
        result: true,
        params: {
          operation: 'update',
          doc: _.get(conversationresponse, 'context.shoppinglist')
        }
      })
      .then(result => ({
        context: _.assign({}, conversationresponse.context, { shoppinglist: result.result }),
        text: conversationresponse.text
      }))
    )
    .then(conversationresponse => {
      if (_.isUndefined(conversationresponse.context.shouldEndSession)) {
        conversationresponse.context.shouldEndSession = false
      }

      return conversationresponse;
    })
    .catch(error => {
      return {
        error: {
          message: 'There was an error contacting Watson Conversation Service. Sorry!',
          cause: error
        }
      };
    });
}