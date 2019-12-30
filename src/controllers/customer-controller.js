'use stricts';

const ValidatonContract = require('../validators/fluent-validator');
const repository = require('../repositories/customer-repository');
const md5 = require('md5');
const emailService = require('../services/email-service');
const authService = require('../services/auth-service');

exports.post = async(req, res, next) => { 
    let contract = new ValidatonContract(); //chamou as funções contidas no arquivo fluent-validator.js e jogou dentro de uma variavel contract
    contract.hasMinLen(req.body.name, 3, 'Name must to have at least 3 characters'); 
    contract.isEmail(req.body.email, 3, 'Invalid e-mail'); 
    contract.hasMinLen(req.body.password, 6, 'Passwaord must to have at least 6 characters');
    

    //Se os dados forem inválidos
    if (!contract.isValid()) {
        res.status(400).send(contract.errors()).end();
        return;
    }

    try {
        await repository.create({ //vamos compor essa requisição e encriptar a senha. Compor é quando dizemos exatamente o que qeuremos ao inves de colocar req.body que pega tudo
            name: req.body.name,
            email: req.body.email,
            password: md5(req.body.password + global.SALT_KEY), // o md5 vai gerar uma hash juntamente com a concatenação do salt key, ou seja, caso alguem tenha acesso ao password ainda sim vai existir o salt key, é uma segurança a mais
            roles: ['user'] //cria o perfil como user. Precisaria criar um controller ou uma função para criação de admin. Professor preguiçoso da porra.
        });
        //aqui usamos a função criada como serviço de email e passamos o parametros, substituimos
        // o parametro body pela variavel global criada para o template de email, dando um replace 
        //no {0} pelo name de algum lugar que nao sei qual é, acho que é do customer em algum lugar, acho que no repository pq pega no DB
        //aqui nao usamos o await pq nao tratamos os erros tbm, mesmo que demore pra ir o email nao vai travar a requisição
        emailService.send(
            req.body.email, 
            'Welcome to Node Store', 
            global.EMAIL_TMPL.replace('{0}', req.body.name
            ));

        res.status(201).send({
            message: 'Customer registered sucessfully!'
        });
    } catch (e) {
        res.status(500).send({
            message: 'Fail while customer registration!'
        });
    };
};

exports.authenticate = async(req, res, next) => { 
//aqui removemos a parte do contract mas é pq o prof é preguiçoso, mas é bom fazer

    try {
        const customer = await repository.authenticate({ 
            email: req.body.email,
            password: md5(req.body.password + global.SALT_KEY) //é aqui que ta encriptando a senha pra bater com a autenticação no repository
        });
        console.log(customer);
        //verifica se o usuario existe
        if(!customer) {
            res.status(404).send({ //404 not found
                message: "Invalid user or password"
            });
            return res;
        }

        //pega as infos do custumer e manda gerar um token. Tudo que coloca aqui fica dentro no nosso token e json
        const token = await authService.generateToken({
            id: customer._id, //isso serve para na hora dos pedidos (order-controller) pra decodificar o token ter o id do usuario, se nao teriamos que buscar o usuario pelo email pra poder pegar o id 
            email: customer.email,
            name: customer.name,
            roles: customer.roles //usado no isAdmin do auth-service. Nessa função é passado como o parametro decoded da função jwt.verify().
        });

        res.status(201).send({ //toda vez que o user logar retorna o token nome e email. Nao se retorna o password
            token: token,
            data: {
            email: customer.email,
            name: customer.name //podemos aqui retornar o "roles" pra facilitar a vida do fronte noia
            }
        });
    } catch (e) {
        res.status(500).send({
            message: 'Fail while customer registration!'
        });
    };
};

//Refresh no token. Quando o token está para inspirar. Se ja inspirou nao tem o que fazer. Tem que
//logar de novo
exports.refreshToken = async(req, res, next) => { 
    
        try {
            //Recupera o token (obtem as infos do token)
            const token = req.body.token || req.query.token || req.headers['x-access-token'];

            //Decodifica o token
            const data = await authService.decodeToken(token);

            const customer = await repository.getById(data.id);
            
            //verifica se o usuario existe
            if(!customer) {
                res.status(404).send({ //404 not found
                    message: "Customer not find"
                });
                return;
            }
    
            
            const tokenData = await authService.generateToken({
                id: customer._id, 
                email: customer.email,
                name: customer.name,
                roles: customer.roles //mesmo esquema vai permitir verificar se é admin ou nao pelo auth-service
            });
    
            res.status(201).send({ 
                token: tokenData,
                data: {
                    email: customer.email,
                    name: customer.name
                }
            });
        } catch (e) {
            res.status(500).send({
                message: 'Fail while refresh token!'
            });
        };
    };