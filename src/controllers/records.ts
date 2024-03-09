import * as uuid from 'uuid'

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, PutCommand, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export interface IRecord {
    ownerName: string,
    mobileNumber: number,
    petName: "string",
    address: "string",
    species: "string",
    breed: "string",
    fees: "number",
    history: "string",
    petNameType: "string",
    paidAmount: "number",
    remainingAmount: "number",
    treatment: "string",
    treatmentDescription: "string",
    followupDate: "string",
    date: "string",
    reference: "string"
}

interface IQueryParams {
    id?: string,
    from?: string,
    to?: string,
    reference?: string,
    date?: string,
    searchQuery?: string,
    cardRecords?: string
}

export function saveRecords(body: IRecord, callback: any) {
    const params = new PutCommand({
        TableName: process.env.DYNAMODB_RECORDS_TABLE,
        Item: {
            id: uuid.v1(),
            ...body
        }
    });

    // write the todo to the database
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
            body: JSON.stringify(params.Item)
        }
        callback(null, response)
    })
}

export function getRecords(queryParams: IQueryParams, callback: any) {

    console.log(queryParams)

    const params = new ScanCommand({
        TableName: process.env.DYNAMODB_RECORDS_TABLE,
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

        ...(queryParams?.reference && {
            ExpressionAttributeValues: {
                ":a": queryParams.reference
            },
            ExpressionAttributeNames: { '#referBy': 'reference' },
            FilterExpression: "#referBy = :a"
        }),
        ...(queryParams?.searchQuery && {
            ExpressionAttributeValues: {
                ":a": !isNaN(queryParams.searchQuery.trim()) ? +queryParams.searchQuery.trim() : -1,
                ":b": queryParams.searchQuery.trim()
            },
            ExpressionAttributeNames: { '#mobileNumber': 'mobileNumber', '#ownerName': 'ownerName', '#petName': 'petName' },
            FilterExpression: "#mobileNumber=:a OR contains(#ownerName,:b) OR contains(#petName,:b)"
        }),
        ...((queryParams?.cardRecords) && {
            ExpressionAttributeValues: {
                ":a": +queryParams.cardRecords.split(',')[0].trim(),
                ":b": queryParams.cardRecords.split(',')[1].trim(),
                ":c": queryParams.cardRecords.split(',')[2].trim(),
                ":d": 'Deworming',
                ":e": 'Vaccination',
                ':from': '2023-08-05T00:00:00.000Z',
                ':to': new Date().toISOString()
            },
            ExpressionAttributeNames: { '#mobileNumber': 'mobileNumber', '#ownerName': 'ownerName', '#petName': 'petName', '#timestamp': 'date' },
            FilterExpression: "#mobileNumber=:a AND #ownerName=:b AND #petName=:c AND ( contains(treatment, :d) OR contains(treatment, :e)) AND (#timestamp BETWEEN :from AND :to)"
        }),
    });

    console.log(params);
    // fetch todo from the database
    docClient.send(params, (error, result) => {
        // handle potential errors
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                body: JSON.stringify({ message: error.toString() })
            });
            return;
        }

        const totalEarnings = result.Items.reduce((acc, { paidAmount }) => acc + paidAmount, 0)
        const totalRecords = result.ScannedCount;
        // create a response
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ records: result.Items, totalEarnings, totalRecords }),
        };
        callback(null, response);
    });
}

export function updateRecord(queryParams: IQueryParams, body: IRecord, callback: any) {

    let updateExpression = Object.keys(body).reduce((acc, item) => `${acc ? `${acc}, ${item}=:${item}` : `${item}=:${item}`}`, '')
    updateExpression = `set ${updateExpression}`;

    console.log(updateExpression);

    let updateExpressionValues = Object.keys(body).reduce((acc, item) => ({ ...acc, [`:${item}`]: body[item] }), {})
    console.log(updateExpressionValues);

    const params = new UpdateCommand({
        TableName: process.env.DYNAMODB_RECORDS_TABLE,
        Key: {
            id: queryParams.id,
            date: queryParams.date
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: updateExpressionValues,
        ReturnValues: "ALL_NEW",
    })

    docClient.send(params, (error, result) => {
        if (error) {
            console.log(error)
            callback(new Error('Couldn\'t update  the item.'))
            return
        }

        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
        }
        callback(null, response)
    })
}

export function deleteRecord(queryParams: IQueryParams, callback: any) {

    const params = new DeleteCommand({
        TableName: process.env.DYNAMODB_RECORDS_TABLE,
        Key: {
            id: queryParams.id,
            date: queryParams.date
        },
    });

    docClient.send(params, (error, result) => {
        if (error) {
            callback(new Error('Couldn\'t delete the item.'))
            return
        }

        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
        }
        callback(null, response)
    })
}