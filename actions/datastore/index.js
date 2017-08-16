const _ = require('lodash');
const cloudantclient = require('cloudant');

exports.main = (params) => {
  const cloudantConfig = {
    url: _.get(params, 'config.cloudant.url'),
    plugin: 'promises'
  };

  const db = cloudantclient(cloudantConfig)
    .db
    .use(_.get(params, 'config.cloudant.database'));

  const successhandler = (statusCode = 200) => (result) => ({
    statusCode,
    result
  });

  const errorhandler = (message, statusCode = 500) => (error) => ({
    statusCode,
    error: {
      message,
      cause: error
    }
  });

  switch (params.operation) {
    case 'create':
      return db
        .insert(params.doc)
        .then(result => db.get(result.id))
        .then(successhandler())
        .catch(errorhandler('Cannot create document'));
    case 'read':
      return db
        .get(params.id)
        .then(successhandler())
        .catch(errorhandler(`Cannot find document with id '${params.id}'`, 400));
    case 'update':
      return db
        .get(params.id || _.get(params, 'doc._id'))
        .then(result => db.insert(_.assign({}, params.doc, { _rev: result._rev })))
        .then(result => db.get(result.id))
        .then(successhandler())
        .catch(errorhandler('Cannot update document.'));
    case 'delete':
      return db
        .get(params.id || _.get(params, 'doc._id'))
        .then(result => db.destroy(result._id, result._rev))
        .then(successhandler())
        .catch(errorhandler('Cannot delete document.'));
    case 'deleteall':
      return db
        .list({ include_docs: true })
        .then(docs => _.map(_.get(docs, 'rows', []), doc => _.get(doc, 'doc')))
        .then(docs => Promise.all(_.map(docs, doc => db.destroy(doc.id || doc._id, doc.rev || doc._rev))))
        .then(successhandler())
        .catch(errorhandler('Cannot delete all documents'));
    default:
      return db
        .list({ include_docs: true })
        .then(docs => _.map(_.get(docs, 'rows', []), doc => _.get(doc, 'doc')))
        .then(docs => {
          // filter. not really sophisticated and smart, but ok for this example
          if (_.size(_.keys(params.filter)) > 0) {
            return _.filter(docs, params.filter);
          } else {
            return docs;
          }
        })
        .then(successhandler())
        .catch(errorhandler('Cannot get list of documents.'));
  }
}