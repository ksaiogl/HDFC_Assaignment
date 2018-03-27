var express = require('express');
var app = express();
var user = require('./user');


app.post('/api/v1.0/register', function (req, res) {

    user.register(req)
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

app.post('/api/v1.0/login', function (req, res) {

    user.login(req)
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

app.get('/api/v1.0/isloggedIn', function (req, res) {

    user.isloggedIn(req)
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

app.get('/api/v1.0/logout', function (req, res) {

    user.logout(req)
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

app.post('/api/v1.0/resetPassword', function (req, res) {
    user.resetPassword(req)
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

app.get('/api/v1.0/placeSearch', global.checkClientSession, function (req, res) {
    user.placeSearch(req)
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

app.get('/api/v1.0/getPlaceDetails', global.checkClientSession, function (req, res) {
    user.getPlaceDetails(req)
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