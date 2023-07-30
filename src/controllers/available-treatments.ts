import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export function getAvlTreatments(callback: any) {
    const params = new ScanCommand({ TableName: process.env.DYNAMODB_TREATMENTS_TABLE });

    docClient.send(params, (error, result) => {
        // handle potential errors
        if (error) {
            callback(new Error('Failed to fetch treatments'))
            return
        }

        // create a response
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ avlTreatments: result.Items })
        }
        callback(null, response)
    });
}


export function putTreatment(item: any, callback: any) {

    const params = new PutCommand({
        TableName: process.env.DYNAMODB_TREATMENTS_TABLE,
        Item: {
            ...item
        }
    })

    docClient.send(params, (error, result) => {
        // handle potential errors
        if (error) {
            callback(new Error('Couldn\'t create the todo item.'))
            return
        }

        // create a response
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(item)
        }
        callback(null, response)
    });
}

