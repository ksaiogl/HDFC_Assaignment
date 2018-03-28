var TAG = 'mongoDatabase.js';
var mongoClient = require('mongodb').MongoClient;
var async = require('async');

var env = global.env;
console.log(TAG + " " + "Deployment Environment is: " + global.env);

var dbConfig = {
    "prd":
        {
            "type": "singleInstance",
            "user": "",
            "pwd": "",
            "mongod": ["18.219.109.26:27017"],
            "database": "HDFC_DB"
        },

    "stg":
        {
            "type": "singleInstance",
            "user": "",
            "pwd": "",
            "mongod": ["18.219.109.26:27017"],
            "database": "HDFC_DB"
        },

    "dev":
        {
            "type": "singleInstance",
            "user": "",
            "pwd": "",
            "mongod": ["18.219.109.26:27017"],
            "database": "HDFC_DB"
        },
    "loc":
        {
            "type": "singleInstance",
            "user": "",
            "pwd": "",
            "mongod": ["127.0.0.1:27017"],
            "database": "HDFC_DB"
        }        
};

var connParams = null;
if (env === 'prd') {
    connParams = dbConfig.prd;
} else if (env === 'stg') {
    connParams = dbConfig.stg;
} else if (env === 'dev') {
    connParams = dbConfig.dev;
} else if (env === 'demo') {
    connParams = dbConfig.demo;
} else {
    connParams = dbConfig.loc;
}
var mongod = connParams.mongod;

var databaseURL = null;
var mongoDbConn = null;

var hosts = null;
for (var i = 0; i < mongod.length; i++) {
    if (i === 0) {
        hosts = mongod[0];
    } else {
        hosts = hosts + ',' + mongod[i];
    }
}

var dbConnUrl = null;
var dbConnUrlSecondary = null;
if (!(connParams.user === "" && connParams.pwd === "")) {
    dbConnUrl = 'mongodb://' + connParams.user + ':' + connParams.pwd + '@' + hosts + '/' + connParams.database + (connParams.type == "replicaSet" ? '?replicaSet=qriusdb' : '');
    console.log(dbConnUrl);
} else {
    dbConnUrl = 'mongodb://' + hosts + '/' + connParams.database + (connParams.type == "replicaSet" ? '?replicaSet=qriusdb' : '');
}


exports.createMongoConn = function (callback) {
    async.parallel([
        function (asyncCallback) {
            mongoClient.connect(dbConnUrl, { poolSize: 10, connectTimeoutMS: 60000, socketTimeoutMS: 500000 }, function (err, database) {
                if (err) {
                    asyncCallback(err);
                } else {
                    console.log('Connection established to: ', dbConnUrl);
                    var mongoDbConn = database.db(connParams.database);
                    exports.mongoDbConn = mongoDbConn;
                    global.mongoDbConn = mongoDbConn;
                    asyncCallback(false);
                }
            });
        }
    ],
        function (err, results) {
            if (err) {
                console.log('Error connecting to DB. Err : \n' + err);
                callback(err);
            } else {
                console.log('DB connection successfull.');
                callback(false);
            }
        });
}