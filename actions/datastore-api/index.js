const _ = require('lodash');
const routes = require('openwhisk-routes');
const openwhisk = require('openwhisk');

exports.main = routes(action => {
  const handle = (getParams) => (req, res) => {
    const ow = openwhisk();

    return ow.actions.invoke({
      name: `${req.wsk.config.openwhisk.package}/datastore`,
      blocking: true,
      result: true,
      params: getParams(req)
    }).then(result => {
      if (result.statusCode === 200) {
        res.send(result.result);
      } else if (result.statusCode && result.error) {
        res.status(500).send(result.error);
      } else {
        res.sendStatus(500);
      }
    });
  }

  action.post('/', handle(req => ({ operation: 'create', doc: req.body })));
  action.get('/', handle(req => ({ operation: 'list', filter: req.body })));
  action.get('/:id', handle(req => ({ operation: 'get', id: req.params.id })));
  action.post('/:id', handle(req => ({ operation: 'update', id: req.params.id, doc: req.body })));
  action.delete('/:id', handle(req => ({ operation: 'delete', id: req.params.id })));
}, { ignoreProperties: ['config'] });