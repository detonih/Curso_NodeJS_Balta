'use strict';
//rota para customers

const express = require('express');
const router = express.Router();
//preciso chamar o arquivo controller aqui dentro para poder exportar as rotas direto no controller
const controller = require('../controllers/order-controller');
const authService = require('../services/auth-service');

router.get('/', authService.authorize, controller.get); //mesmo esquema só faz o pedido quem estiver logado

router.post('/', authService.authorize, controller.post);

module.exports = router;