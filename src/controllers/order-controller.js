'use stricts';

const repository = require('../repositories/order-repository');
const guid = require('guid'); //gera unique IDs
const authService = require('../services/auth-service');

//aqui precisamos de um get tbm para enviar esses dados pra tela
exports.get = async(req, res, next) => {
    try {
        var data = await repository.get();
            res.status(200).send(data);
    } catch (e) {
        res.status(500).send({
            message: 'Fail while requisition process'
        });
    };
}

exports.post = async(req, res, next) => { 
//podemos depois criar as validações, o professor ficou com preguiça

    try {

        //Recupera o token (obtem as infos do token)
        const token = req.body.token || req.query.token || req.headers['x-access-token'];
        
        //Decodifica o token
        const data = await authService.decodeToken(token);

        await repository.create({ //compoms o JSON somente com as infos que queremos
            //toda vez que um pedido é feito, é errado usar o customer: req.body.customer, pois qualquer pessoa pode passar o nome no corpo e fazer pedidos em nome de outra pessoa
            //precisamos entao, pegar o token ,desencriptar o token e ver o usuario logado
            //como essa é uma info sensivel é melhor pegar ela direto do token
            //customer: req.body.customer, substitui esse por:
            customer: data.id,
            number: guid.raw().substring(0 ,6), //vai gerar um unique ID para o pedido, pegando o que é passado no schema. Outros items do schema como data são criados por lá mesmo.
            items: req.body.items
        });
        res.status(201).send({
            message: 'Order registered sucessfully!'
        });
    } catch (e) {
        res.status(500).send({
            message: 'Fail while order registration!'
        });
    };
};