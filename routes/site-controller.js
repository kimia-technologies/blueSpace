var express = require('express');
var router = express.Router();
var siteApi = require('../api/site-manager');

exports.getServiceByType = async (t) => {
  return await siteApi.getAllFormuleOf(t);
};

exports.getOffer = async (f) => {
  return await siteApi.getAllServices(f);
};

exports.getAllTypes = async () => {
  return await siteApi.getAllType();
};

exports.getTypeInfo = async (t) => {
  return await siteApi.getType(t);
};

exports.getTypeFormule = async (t, f) => {
  return await siteApi.getTypeFormule(t, f);
};

exports.getImageOf = async (t) => {
  return await siteApi.getImage(t);
};

exports.getDomiciliation = async () => {
  return await siteApi.listDomiciliation();
};

var typeRouter = express.Router();
typeRouter.post('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const type = await siteApi.createType(req.body);
    res.status(200).json(type);
  })
  .delete('/t=:t', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const state = await siteApi.deleteType(req.params);
    res.sendStatus(state);
  });

var serviceRouter = express.Router();
serviceRouter.post('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const service = await siteApi.createService(req.body);
    res.status(200).json(service);
  })
  .delete('/s=:s', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const state = await siteApi.deleteService(req.params);
    res.sendStatus(state);
  });

var offreRouter = express.Router();
offreRouter.post('/t=:t/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const offres = await siteApi.createOffre(req.params, req.body);
    res.status(200).json(offres);
  })
  .delete('/t=:t', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const state = await siteApi.deleteOffre(req.params, req.body);
    res.sendStatus(state);
  });

var espaceRouter = express.Router();
espaceRouter.get('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const spaces = await siteApi.getAllSpaces();
    res.status(200).json(spaces);
  })
  .post('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const space = await siteApi.createSpace(req.body);
    res.status(200).json(space);
  })
  .delete('/s=:s', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const state = await siteApi.deleteSpace(req.params);
    res.sendStatus(state);
  });

var formuleRouter = express.Router();
formuleRouter.get('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const formule = await siteApi.getAllFormules();
    res.status(200).json(formule);
  })
  .get('/f=:f/services', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const services = await siteApi.getAllServices(req.params);
    res.status(200).json(services);
  })
  .post('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const formule = await siteApi.createFormule(req.body);
    res.status(200).json(formule);
  })
  .post('/f=:f/services', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const content = await siteApi.createContent(req.params, req.body);
    res.status(200).json(content);
  })
  .delete('/f=:f', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const state = await siteApi.deleteFormule(req.params);
    res.status(state).json();
  })
  .delete('/f=:f/services/t=:t&s=:s', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const state = await siteApi.deleteContent(req.params);
    res.status(state).json();
  });

var roleRouter = express.Router();
roleRouter.get('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.status(200).json(await siteApi.getRole());
  })
  .get('/permission/:r', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const permission = await siteApi.getPermission(req.params.r);
    res.status(200).json(permission);
  })
  .post('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const role = await siteApi.createRole(req.body);
    res.status(200).json(role);
  })
  .post('/permission/:r', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const state = await siteApi.setPermission(req.params.r, req.body);
    res.status(state).json();
  })
  .delete('/:r', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const state = await siteApi.deleteRole(req.params);
    res.status(state).json();
  })
  .delete('/permission/r=:r&res=:res', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const state = await siteApi.rmvPermission(req.params);
    res.status(state).json();
  })
  .patch('/:r', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const role = await siteApi.editRole(req.params, req.body);
    res.json(role);
  });

router.use(require('../api/rbac'));
router.use('/type', typeRouter)
  .use('/service', serviceRouter)
  .use('/offre', offreRouter)
  .use('/espace', espaceRouter)
  .use('/formule', formuleRouter)
  .use('/role', roleRouter);

exports.router = router;