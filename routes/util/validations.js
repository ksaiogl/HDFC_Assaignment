exports.registrationSchema = {
    "type": "object",
    "required": true,
    "properties": {
        "userName": {
            "type": "string",
            "required": true,
            "minLength": 4,
            "pattern": /^[a-zA-Z0-9-,.:#&()!@$%^*_{}\\\/\s]*$/
        },
        "password": {
            "type": "string",
            "required": true,
            "minLength": 6
        },
        "firstName": {
            "type": "string",
            "required": true,
            "minLength": 1,
            "pattern": /^[a-zA-Z0-9-,.:#&()!@$%^*_{}\\\/\s]*$/
        },
        "lastName": {
            "type": "string",
            "required": true,
            "minLength": 1,
            "pattern": /^[a-zA-Z0-9-,.:#&()!@$%^*_{}\\\/\s]*$/
        },
        "gender": {
            "type": "string",
            "required": true,
            "enum": [
                "Male",
                "Female"
            ]
        },
        "emailId": {
            "type": "string",
            "required": true
        },
        "mobileNumber": {
            "type": "string", // to support international numbers +1 etc,.
            "required": true,
            "minLength": 10         
        }
    }
}