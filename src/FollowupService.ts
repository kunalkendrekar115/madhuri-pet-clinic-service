import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import axios from 'axios';
const moment = require('moment');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);



function getWhatsAppConfig(data: any) {
    const whatsappConfig: any = {
        method: 'post',
        url: 'https://graph.facebook.com/v17.0/122103632132007885/messages',
        headers: {
            'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
        },
        data
    };
    return whatsappConfig
}

export function sendMessageToSelf(date: any, message: any) {
    return new Promise(async (resolve, reject) => {
        try {
            var data = JSON.stringify({
                "messaging_product": "whatsapp",
                "to": `919096591276`,
                "type": "template",
                "template": {
                    "name": "followup_reminder_self",
                    "language": {
                        "code": "en"
                    },
                    "components": [
                        {
                            "type": "BODY",
                            "parameters": [
                                {
                                    "type": "text",
                                    "text": moment(date).format('DD MMM YYYY')
                                },
                                {
                                    "type": "text",
                                    "text": message
                                }
                            ]
                        }
                    ]
                }
            });

            const messageResponse = await axios(getWhatsAppConfig(data))

            resolve(messageResponse);

        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
}

export function sendWhatsppMessageToClient(record: any) {
    return new Promise(async (resolve, reject) => {
        try {
            var data = JSON.stringify({
                "messaging_product": "whatsapp",
                "to": `91${record.mobileNumber}`,
                "type": "template",
                "template": {
                    "name": "followup_reminder",
                    "language": {
                        "code": "en"
                    },
                    "components": [
                        {
                            "type": "BODY",
                            "parameters": [
                                {
                                    "type": "text",
                                    "text": record.ownerName
                                },
                                {
                                    "type": "text",
                                    "text": record.followupFor
                                },
                                {
                                    "type": "text",
                                    "text": record.petName
                                },
                                {
                                    "type": "text",
                                    "text": moment(record.followupDate).format('DD MMM YYYY')
                                }
                            ]
                        }
                    ]
                }
            });


            const messageResponse = await axios(getWhatsAppConfig(data))

            resolve(messageResponse);

        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
}


export function handler(event: any, context, callback: any) {

    console.log('executed scheduler.........')

    const tomorrow = moment().add(1, 'days').toISOString();
    const today = moment().toISOString();
    console.log('tomorrow', tomorrow);
    const params = new ScanCommand({
        TableName: process.env.DYNAMODB_RECORDS_TABLE,
        ExpressionAttributeValues: {
            ':from': today,
            ':to': tomorrow
        },
        ExpressionAttributeNames: { '#followupDate': 'followupDate' },
        FilterExpression: '(#followupDate BETWEEN :from AND :to)'
    })

    // fetch todo from the database
    docClient.send(params, async (error, result) => {
        // handle potential errors
        if (error) {
            console.error(error);
            callback(null)
            return;
        }

        let records = result.Items.filter(({ mobileNumber }) => mobileNumber)

        // const response = {
        //     statusCode: 200,
        //     body: JSON.stringify({ records })
        // };
        // callback(null, response);

        let messagePromises = records.map(sendWhatsppMessageToClient)

        const messageToSelf = records.reduce((acc: any, curr: any, index) => ([...acc, `${index + 1}) ${curr.ownerName} - ${curr.petName} - ${curr.followupFor} - ${curr.mobileNumber}`]), []).join(', ')
        messagePromises = messagePromises.concat(sendMessageToSelf(records[0].followupDate, messageToSelf))

        Promise.allSettled(messagePromises).then(async (values) => {
            records = records.map((item, index) => ({ ...item, messageStatus: values[index].status }))
            records = records.concat({ messageToSelf, messageStatus: values[records.length].status })
            console.log(records);

            const response = {
                statusCode: 200,
                body: JSON.stringify({ records })
            };
            callback(null, response);
        });
    });
}

