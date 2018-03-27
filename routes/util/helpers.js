
global.badFormat = (errors) => {
    const result = {
        "http_code": "400",
        "message": "Bad or ill-formed request..",
        "errors": errors
    };
    return result;
};

global.inputDontMatch = () => {
    const result = {
        "http_code": "404",
        "message": "The inputs does not match with our records..Please retry.."
    };
    return result;
};

global.internalServerError = (err) => {
    const result = {
        "http_code": "500",
        "message": "Internal Server Error..Please retry..",
        "error": err
    };
    return result;
};

global.outputResult = (result) => {
    const resJson = {
        "http_code": "200",
        "message": result
    };
    return resJson;
};

global.makeResult = (statusCode, message,errors) => {
    const result = {
        "http_code": statusCode,
        "message": message,
        "errors": errors
    };
    return result;
};

global.makeSuccessResponse = () => {

}

global.makeErrorResponse = (err) => {
    if (err && err.http_code) {
        return err;
    } else {
        var resp = {
            http_code: 500,
            message: "Internal Server Error..Please retry..",
            error: err
        }
        return resp;
    }
}

global.checkClientSession = (req, res, next) => {
    if (req.session.user) {
        next()
    } else {
        var resp = global.makeResult('401', 'No Session Found');
        res.statusCode = resp.http_code;
        res.json(resp);
    }
}