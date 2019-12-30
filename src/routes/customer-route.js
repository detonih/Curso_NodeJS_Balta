'use strict';
//rota para customers

const express = require('express');
const router = express.Router();
//preciso chamar o arquivo controller aqui dentro para poder exportar as rotas direto no controller
const controller = require('../controllers/customer-controller');
const authService = require('../services/auth-service');

router.post('/', controller.post);
router.post('/authenticate', controller.authenticate);//cria a rota para atuenticação do usuario. Depois pode-se criar uma rota só para oa utenticate ao inves de jogar isso dentro da rota customer e depois autenticate
router.post('/refresh-token', authService.authorize, controller.refreshToken); //nao tem como fazer um refresh token se nao tiver um token valido

module.exports = router; 