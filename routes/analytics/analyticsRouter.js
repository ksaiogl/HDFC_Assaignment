var express = require('express');
var app = express();
var analytics = require('./analytics');

app.get('/api/v1.0/getSearchedPlaces', global.checkClientSession, function (req, res) {
    analytics.getSearchedPlaces(req)
        .then(response => {
            res.statusCode = response.http_code;
            res.json(response);
        })
        .catch(err => {
            var response = global.makeErrorResponse(err);
            res.statusCode = response.http_code;
            res.json(response);
        });
});


app.get('/api/v1.0/getViewedPlaces', global.checkClientSession, function (req, res) {
    analytics.getViewedPlaces(req)
        .then(response => {
            res.statusCode = response.http_code;
            res.json(response);
        })
        .catch(err => {
            var response = global.makeErrorResponse(err);
            res.statusCode = response.http_code;
            res.json(response);
        });
});

module.exports = app;