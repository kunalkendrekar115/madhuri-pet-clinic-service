

import { DynamoDB } from 'aws-sdk'

const dynamoDb = new DynamoDB.DocumentClient()

interface IQueryParams {
    id?: string,
    from?: string,
    to?: string,
}

export function getExpenditure(queryParams: IQueryParams, callback: any) {

    const params = {
        TableName: process.env.DYNAMODB_EXPENDITURES_TABLE,

        ...(queryParams?.id && {
            ExpressionAttributeValues: {
                ":a": queryParams.id
            },
            FilterExpression: "id = :a"
        }),

        ...(queryParams?.from && {
            ExpressionAttributeValues: {
                ':from': queryParams.from,
                ':to': queryParams.to
            },
            ExpressionAttributeNames: { '#timestamp': 'date' },
            FilterExpression: '(#timestamp BETWEEN :from AND :to)'
        }),
    };

    // fetch todo from the database
    dynamoDb.scan(params, (error, result) => {
        // handle potential errors
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                body: JSON.stringify({ message: error.toString() })
            });
            return;
        }

        const totalExpenditure = result.Items.reduce((acc, { amount }) => acc + amount, 0)
        const totalRecords = result.ScannedCount;
        // create a response
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ expenditures: result.Items, totalExpenditure, totalRecords }),
        };
        callback(null, response);
    });
}