const _ = require('lodash');
const Promise = require('bluebird');
const WatsonConversation = require('watson-developer-cloud/conversation/v1');

exports.main = (params) => {
  const conversation = Promise.promisifyAll(new WatsonConversation({
    username: _.get(params, 'config.conversation.username', 'no username'),
    password: _.get(params, 'config.conversation.password', 'no password'),
    path: {
      workspace_id: _.get(params, 'config.conversation.workspace', 'no workspace')
    },
    version_date: WatsonConversation.VERSION_DATE_2017_04_21
  }));

  return conversation
    .messageAsync({
      input: { text: _.get(params, 'text', '') },
      context: _.get(params, 'context', {})
    })
    .then(conversationresponse => {
      return {
        context: _.get(conversationresponse, 'context', {}),
        text: _.join(_.get(conversationresponse, 'output.text', []), ' ')
      };
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