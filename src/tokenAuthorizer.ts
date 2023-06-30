import jwt from 'jsonwebtoken';

interface IStatement {
    Action?: string,
    Effect?: string,
    Resource?: string
}
interface IPolicyDocument {
    policyDocument?: string,
    Version?: string,
    Statement?: Array<IStatement>
}

interface IAuthResponse {
    principalId?: string,
    policyDocument?: IPolicyDocument
}

const generateResponse = (statusCode, body) => {
    return {
        statusCode,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(body),
    }
}

export function authenticate(event: any, context, callback: any) {

    const { password } = JSON.parse(event.body)
    let response = {};

    if (password == process.env.PASSWORD) {
        const token = jwt.sign({ password }, process.env.JWT_KEY, { expiresIn: "7d" });
        response = generateResponse(200, { token })
    } else
        response = generateResponse(401, { message: "Invalid Login" })

    callback(null, response);
}

export function tokenAuthorize(event, context, callback) {
    const token = event.authorizationToken
    console.log('tokenAuthorizer', token)
    jwt.verify(token, process.env.JWT_KEY, function (err, decoded) {
        if (err) {
            console.log('tokenAuthorize', err)
            callback(null, generatePolicy('user', 'Deny', "*"));
            return;
        }

        callback(null, generatePolicy('user', 'Allow', "*"))
    });

}

const generatePolicy = function (principalId, effect, resource) {
    const authResponse: IAuthResponse = {};

    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument: IPolicyDocument = {};
        policyDocument.Version = '2012-10-17';
        policyDocument.Statement = [];
        const statementOne: IStatement = {};
        statementOne.Action = 'execute-api:Invoke';
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }

    console.log('tokenAuthorizer', JSON.stringify(authResponse));
    return authResponse;
}