'use strict';
//rota para products

const express = require('express');
const router = express.Router();
//preciso chamar o arquivo controller aqui dentro para poder exportar as rotas direto no controller
const controller = require('../controllers/product-controller');
const authService = require('../services/auth-service');

router.get('/', controller.get);
router.get('/:slug', controller.getBySlug);
router.get('/admin/:id', controller.getById); //aqui poderiamos ter um conflito de rota no get do slug com id, assim adicionamos /admin/
router.get('/tags/:tag', controller.getByTag);
router.post('/', authService.isAdmin, controller.post); 
router.put('/:id', authService.isAdmin, controller.put);
router.delete('/', authService.isAdmin, controller.delete);
//authService nao vai permitir acessar uma rota sem estar autorizado. Para criação atualizacao e delete de produtos somente admins.
//isAdmin permite que somente administradores acessem determinada rota

module.exports = router;