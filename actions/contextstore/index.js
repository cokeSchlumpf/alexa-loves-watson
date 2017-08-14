const _ = require('lodash');
const cloudantclient = require('cloudant');
const routes = require('openwhisk-routes');

let db;

const init = (params) => {
  const cloudantConfig = {
    url: _.get(params, 'config.cloudant.url'),
    plugin: 'promises'
  };

  db = cloudantclient(cloudantConfig)
    .db
    .use(_.get(params, 'config.cloudant.database'));
}

exports.main = (params) => {
  return routes(action => {
    action.post('/', (req, res) => {
      db
        .insert(req.body)
        .then(data => {
          res.json(data);
        })
        .catch(error => {
          res.sendStatus(500);
        });
    });

    action.get('/', (req, res) => {
      db
        .list({
          include_docs: true
        })
        .then(data => _.map(_.get(data, 'rows', []), row => _
          .chain(row)
          .get('doc', {})
          .omit('_rev')
          .value()))
        .then(data => {
          // filter. not really sophisticated and smart, but ok for this example
          if (_.size(_.keys(req.body)) > 0) {
            return _.filter(data, req.body);
          } else {
            return data;
          }
        })
        .then(data => {
          res.send(data);
        })
        .catch(error => {
          res.sendStatus(500);
        })
    });

    action.get('/:id', (req, res) => {
      db
        .get(req.params.id)
        .then(data => _.omit(data, '_rev'))
        .then(data => {
          res.send(data);
        })
        .catch(error => {
          res.sendStatus(404);
        });
    });

    action.post('/:id', (req, res) => {
      db
        .get(req.params.id)
        .then(olddoc =>
          db.insert(_.assign({}, req.body, { _id: req.params.id, _rev: olddoc._rev })))
        .then(data => {
          res.send(data);
        })
        .catch(error => {
          res.sendStatus(500);
        });
    });
  },
    {
      init,
      ignoreProperties: ['config']
    })(params);
}