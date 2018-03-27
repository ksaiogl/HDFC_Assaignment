var Redis = require('ioredis');
var env = global.env;

function getRedisConfig(env) {
  if (env === 'prd') {
    return {
      sentinalConfig: {
      },
      options: {
      },
    }
  } else if (env === 'stg') {
    return {
      sentinalConfig: {
      },
      options: {
      },
    }
  } else if (env === 'dev') {
    return {
      sentinalConfig: {
      },
      options: {
      },
    }
  } else if (env === 'loc') {

    return {
      sentinalConfig: {
      },
      options: {
      },
    }
  }
}

exports.getRedisConfig = getRedisConfig;


exports.getSessionEncryptionKey = function (env) {
  if (env === 'prd') {
    return "Qrius_auth_red1s_5e5510n_SecretKe7_prd";
  } else {
    return "Qrius_auth_red1s_5e5510n_SecretKe7";
  }
}


exports.createRedisConn = function (callback) {
  var redisConfig = getRedisConfig(global.env);
  var redis = new Redis(redisConfig.sentinalConfig, redisConfig.options);

  redis.on('error', function (err) {
    console.log('Redis error: ' + err);
    callback(err);
  });

  redis.on('connect', function (err) {
    console.log('Connected to Redis');
    exports.redisConn = redis;
    global.redisConn = redis;
    callback();
  });

}