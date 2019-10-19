var express = require('express');
var router = express.Router();
var accountApi = require('../api/account-manager');

exports.login = async (params) => {
  return await accountApi.login(params);
};

exports.logout = async (email) => {
  return await accountApi.logout(email);
};

exports.listRoles = async (email) => {
  return await accountApi.listRoles(email);
};

exports.rlink = async (link, full_link) => {
  return await accountApi.rlink(link, full_link);
};

exports.register = async (params) => {
  return await accountApi.register(params);
};

exports.activate = async (params) => {
  return await accountApi.activate(params);
};

exports.isExists = async (id) => {
  const user = await accountApi.find(id);
  if (user != null)
    return 409;
  return 200;
};

exports.saveToken = async (params) => {
  return await accountApi.saveToken(params);
};

exports.newToken = async (token) => {
  return await accountApi.newToken(token);
};

router.use(require('../api/rbac'));
router.get('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const users = await accountApi.getAllUser();
    res.status(200).json(users);
  })
  .get('/my-account', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const user = await accountApi.getUser(req.decoded.payload.email);
    res.status(200).json(user);
  })
  .get('/:e', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const user = await accountApi.getUser(req.params.e);
    if (user != null)
      res.status(200).json(user);
    else res.status(404).json({
      msg: 'utilisateur non trouve'
    });
  })
  .post('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const out = await accountApi.register(req.body, true);
    res.status(out.status).json(out.user);
  })
  .delete('/:e', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const state = await accountApi.delete(req.params.e);
    res.status(state).json();
  })
  .patch('/my-account', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const out = await accountApi.edit(req.decoded.payload.email, req.body);
    res.status(out.status).json({
      msg: out.msg
    });
  })
  .patch('/:e', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const state = await accountApi.edit(req.params.e, req.body);
    res.status(state.status).json({
      out: state.msg
    });
  });

exports.route = router;