import * as uuid from 'uuid'

import { DynamoDB } from 'aws-sdk'

const dynamoDb = new DynamoDB.DocumentClient()

interface IExpenditure {
    date: "string",
    type: "string",
    summary: "string",
    amount: "number",
}

export function saveExpenditure(body: IExpenditure, callback: any) {

    const params = {
        TableName: process.env.DYNAMODB_EXPENDITURES_TABLE,
        Item: {
            id: uuid.v1(),
            ...body
        }
    }

    // write the todo to the database
    dynamoDb.put(params, (error, result) => {
        // handle potential errors
        if (error) {
            console.log(error);
            callback(new Error('Couldn\'t create the todo item.'))
            return
        }

        // create a response
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(params.Item)
        }
        callback(null, response)
    })
}