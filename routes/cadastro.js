const express = require('express');
const router = express.Router();
const isNull = require('../script').isNull;
const Database = require('../Database');
const Cryptr = require('cryptr');
const config = require('../config');
const cryptr = new Cryptr(config.security.key);

router.get('/', (req, res, next) => {
    Database.query('SELECT * FROM modelo_user').then((results) => {
        res.json(results);
    }).catch((error) => {
        res.json(error);
    });
});

router.post('/', (req, res, next) => {
    var nome = req.body.nome;
    var usuario = req.body.usuario;

    Database.query(`INSERT INTO modelo_user (nome, usuario) VALUES ('${nome}', '${usuario}')`).then((results) => {
        res.json({
            mensagem: 'Concluído',
            results: results
        });
    }).catch((error) => {
        res.json({
            mensagem: 'Deu erro',
            error: error
        })
    });

    res.json(req.body);
});

module.exports = router;
