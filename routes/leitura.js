'use strict';

// configurações gerais, mexer com cautela
var express = require('express');
var router = express.Router();
var isNull = require('../script').isNull;
var Database = require('../Database');
const Cryptr = require('cryptr');
const config = require('../config');
const cryptr = new Cryptr(config.security.key);
const moment = require('moment-timezone');
// configurações gerais, mexer com cautela


// consulta que retorna os N últimos registros de leitura
router.get('/ultimas', (req, res, next) => {

    var limite_linhas = 10;
    var resposta = {};
    Database.query(`SELECT TOP ${limite_linhas} momento, temperatura, umidade FROM leitura order by momento desc`).then(resultados => {
        resultados = resultados.recordsets[0];

        resposta.cols = [
            {id: 'momento', label: 'momento', type: 'timeofday'},
            {id: 'temperatura', label: 'temperatura', type: 'number'},
            {id: 'umidade', label: 'umidade', type: 'number'}
        ];
        
        var linhas = [];
        
        for (var i = 1; i < resultados.length; i++) {
            var row = resultados[i];
            var momento = moment(row.momento).format('HH-mm-ss').split('-');
            var registro = {
                c: [{v: momento},
                    {v: row.temperatura},
                    {v: row.umidade}
                   ]
               };
            linhas.push(registro);
        }
        resposta.rows = linhas;
        
        res.json(resposta);
    }).catch(error => {
        console.log(error);
        res.status(400).json({"error": `erro na consulta junto ao banco de dados ${error}`});
    });

});

// consulta que retorna as médias de temperatura e umidade
router.get('/medias', (req, res, next) => {

    Database.query(`SELECT avg(temperatura) as media_temp, max(temperatura) as max_temp,
     min(temperatura) as min_temp, avg(umidade) as media_umid, max(umidade) as max_humi,
      min(umidade) as min_humi,
      SELECT PERCENTILE_CONT(0.25) WITHIN GROUP(ORDER BY CAST ([UMIDADE] AS FLOAT))OVER (PARTITION BY 1 ) AS [primeiro_quartilh],
      SELECT PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY CAST ([UMIDADE] AS FLOAT))OVER (PARTITION BY 1 ) AS [medianah],
      SELECT PERCENTILE_CONT(0.75) WITHIN GROUP(ORDER BY CAST ([UMIDADE] AS FLOAT))OVER (PARTITION BY 1 ) AS [terceiro_quartilh],
      SELECT PERCENTILE_CONT(0.25) WITHIN GROUP(ORDER BY CAST ([TEMPERATURA] AS FLOAT))OVER (PARTITION BY 1 ) AS [primeiro_quartilt],
      SELECT PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY CAST ([TEMPERATURA] AS FLOAT))OVER (PARTITION BY 1 ) AS [medianaT],
      SELECT PERCENTILE_CONT(0.75) WITHIN GROUP(ORDER BY CAST ([TEMPERATURA] AS FLOAT))OVER (PARTITION BY 1 ) AS [terceiro_quartilT] FROM leitura`).then(resultados => {
        var linha = resultados.recordsets[0][0];
        var temperatura = linha.media_temp.toFixed(2);
        var medianaT = linha.medianat.toFixed(2);
        var temperatura_max = linha.max_temp.toFixed(2);
        var temperatura_min = linha.min_temp.toFixed(2);
        var prim_quartilT = linha.primeiro_quartilt.toFixed(2);
        var terc_quartilT = linha.terc_quartilt.toFixed(2);        
        var umidade = linha.media_umid.toFixed(2);
        var medianaH = linha.medianah.toFixed(2);
        var umidade_max = linha.max_humi.toFixed(2);
        var umidade_min = linha.min_humi.toFixed(2);
        var prim_quartilH = linha.primeiro_quartilh.toFixed(2);
        var terc_quartilH = linha.primeiro_quartilh.toFixed(2);
        res.json({temperatura:temperatura , medianaT:medianaT , temperatura_max:temperatura_max ,
             temperatura_min:temperatura_min , prim_quartilT:prim_quartilT , terc_quartilT:terc_quartilT , umidade:umidade ,
             , medianaH:medianaH , umidade_max:umidade_max , umidade_min , umidade_min});
    }).catch(error => {
        console.log(error);
        res.status(400).json({"error": `erro na consulta junto ao banco de dados ${error}`});
    });

});



module.exports = router;
