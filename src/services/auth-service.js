'use stricts';

const jwt = require('jsonwebtoken');

//Gera o Token, (data) passa os dados para imputar dentro do token (neste caso o email do cliente)
exports.generateToken = async (data) => {
    return jwt.sign(data, global.SALT_KEY, { expiresIn: '1d'});
};            // ^ gera o token                ^ tempo de expiraçã 1 dia

//Recebe um token e cria uma variavel e verifica o token com a salt key
exports.decodeToken = async (token) => {
    let data = await jwt.verify(token, global.SALT_KEY); //aqui ta dizendo que o await nao tem efeito
    return data;
};


//Essa função serve como um interceptador de rotas. Todas as rotas que quisermos nao autorizar para o usuario.
exports.authorize = (req, res, next) => {
    //Busca o token nesses 3 lugares. Via queryString (req.query.toekn) é aquela que passa na url ?token=MEU_TOKEN
    //req.headers vc vai no postman em headers e adiciona uma nova key (x-acess-token) passando o value com o token
    //ou coloca o token no body do json igual tava fazendo até agora {"token": "MEU TOKEN"}
    let token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (!token) {//se nao achou o token da acesso restrito
        res.status(401).json({
            message: 'Restrict acess'
        });
    } else { // se achou entra no processo de verificar o token
        jwt.verify(token, global.SALT_KEY, (error, decoded) => {
            if (error) {//se nao conseguir, seja pq inspirou ou é invalido
                res.status(401).json({
                    message: 'Invalid Token'
                });
            } else {
                next(); //vai dar vazão na requisição, vai continuar
            }
        });
    }
};

//Metodo para verificar que se é admin ou nao (para autorizar fazer o CRUD)
//tambem é um metodo "interceptor"

exports.isAdmin = (req, res, next) => {
    let token = req.body.token || req.query.token || req.headers['x-access-token'];

    if(!token) {
        res.status(401).json({
            message: 'Invalid Token'
        });
    } else { //se um callback for fornecido, a função verify() atua assincorna. Neste caso o callback esta sendo passado como uma funcao (error, decoded). Acho que por isso nao precisa de async/await
        jwt.verify(token, global.SALT_KEY, (error, decoded) => {
            if (error) {                           // ^ esse é o nosso token decodificado pela função autehnticate no customer-controller
                res.status(401).json({
                    message: 'Invalid Token'
                });
            } else {
                if (decoded.roles.includes('admin')) { //verifica se a string "admin" ta dentro do array que foi gerado pela propriedade "roles" no schema do customer-model
                    next();
                } else {
                    res.status(403).json({
                        message: 'Restricted function for admins'
                    });
                }
            }
        });
    }
};