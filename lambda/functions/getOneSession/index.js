const AWS = require('aws-sdk'),
    dynamoDb = new AWS.DynamoDB.DocumentClient(),
    PRIMARY_KEY = "id",
    TABLE_NAME = process.env.TABLE_NAME,
    IS_CORS = process.env.IS_CORS;

exports.handler = (event) => {
    if (event.httpMethod === 'OPTIONS') {
		return Promise.resolve(processResponse(IS_CORS));
    }
    const requestedItemId = parseInt(event.pathParameters.id);
    if (!requestedItemId) {
        return Promise.resolve(processResponse(IS_CORS, `Error: You are missing the id parameter`, 400));
    }
    
    const key = {};
    key[PRIMARY_KEY] = requestedItemId;
    
    const params = {
        TableName: TABLE_NAME,
        Key: key
    }
    return dynamoDb.get(params)
    .promise()
    .then(response => processResponse(IS_CORS, response.Item))
    .catch(err => {
        console.log(err);
        return processResponse(IS_CORS, 'dynamo-error', 500);
    });
};

function processResponse(isCors, body, statusCode) {
    const status = statusCode || (body ? 200 : 204);
    const headers = { 'Content-Type': 'application/json' };
    if (isCors) {
        Object.assign(headers, {
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'OPTIONS,PUT,POST',
            'Access-Control-Allow-Origin': process.env.CORS_ORIGIN,
            'Access-Control-Max-Age': '86400'
        });
    }
    return {
        statusCode: status,
        body: JSON.stringify(body) || '',
        headers: headers
    };
}