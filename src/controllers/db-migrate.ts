import { DynamoDB } from 'aws-sdk'

const dynamoDb = new DynamoDB.DocumentClient()


export function migrateDb(body, callback: any) {

    const paramsFrom = {
        TableName: "madhuri-pet-clinic-service-prod"
    };

    // fetch todo from the database
    dynamoDb.scan(paramsFrom, (error, result) => {
        // handle potential errors
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                body: JSON.stringify({ message: error.toString() })
            });
            return;
        }

        result.Items?.forEach((item) => {
            const params = {
                TableName: process.env.DYNAMODB_RECORDS_TABLE,
                Item: item
            }

            dynamoDb.put(params, (error, result) => {
                // handle potential errors
                if (error) {
                    callback(new Error('Couldn\'t create the todo item.'))
                    return
                }
            })
        })

        // create a response
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ records: result.Items?.length }),
        };
        callback(null, response);
    });
}


