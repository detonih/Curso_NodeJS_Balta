'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config');

const app = express();
const router = express.Router();

//Conecta ao banco
mongoose.connect(config.connectionString);

//Carrega os models
const Product = require('./models/product-model');
const Customer = require('./models/customer-model');
const Order = require('./models/order-model');

//Carrega as rotas
const indexRoute = require('./routes/index-route');
const productRoute = require('./routes/product-route');
const customerRoute = require('./routes/customer-route');
const orderRoute = require('./routes/order-route');

app.use(bodyParser.json({
    limit: '5mb' //cria um limite para o corpo do json que vamos receber
})); //todo conteudo será convertido para json
app.use(bodyParser.urlencoded({
    extended: false 
})); //codifica as URL, por ex para espaços em branco na URL

//Habilita o CORS -> pesquisar mais sobre o CORS 
app.use((req, res, next) => {
    res.header('Acess-Control-Allow-Origin', '*');//aqui colca-se as urls que vão acessar seu site. Por padrao os navegadores nao deixam que outras origins acessem a api. Entao é necessário liber-alas. Com o * libera tudo.
    res.header('Acess-Control-Allow-Headers', 'Origin, X-Requested-with, Content-Type, Accept, x-access-token');
    res.header('Acess-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
});



//aqui é como se criasse o "nome" pra rota, que vai aparecer na URL depois do barra/
app.use('/', indexRoute); //atribimos a rota route
app.use('/products', productRoute); //atribuimos a rota create
app.use('/customer', customerRoute);
app.use('/order', orderRoute);

module.exports = app; //exportamos o app que é o express