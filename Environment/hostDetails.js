var env = global.env;

var hostDetails = {
	"prd": {
		"port": "8080"
	},
	"stg": {
		"port": "8081"
	},
	"dev": {
		"port": "8082"
	},
	"loc": {
		"port": "8083"
	}
}

var WHICH_HOST = null;	

if (env === 'prd') {
	WHICH_HOST = hostDetails.prd;
} else if (env === 'stg') {
	WHICH_HOST = hostDetails.stg;
} else if (env === 'dev') {
	WHICH_HOST = hostDetails.dev;
}
else if (env === 'demo') {
	WHICH_HOST = hostDetails.demo;
} else {
	WHICH_HOST = hostDetails.loc;
}

exports.WHICH_HOST = WHICH_HOST;