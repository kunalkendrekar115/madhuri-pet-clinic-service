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
            'Authorization': 'Bearer Invalid',
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
                "to": `918433670541`,
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

    console.log('executed scheduler')
    const tomorrow = moment().add(1, 'days').format('DD MMM YYYY');
    // const today = moment().format('YYYY-MM-DD');
    console.log('tomorrow', tomorrow);
    const params = new ScanCommand({
        TableName: process.env.DYNAMODB_RECORDS_TABLE,
        ExpressionAttributeValues: {
            ':date': tomorrow,
        },
        ExpressionAttributeNames: { '#followupDate': 'followupDate' },
        FilterExpression: '(#followupDate=:date)'
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

        const response = {
            statusCode: 200,
            body: JSON.stringify({ records })
        };
        callback(null, response);

        const messagePromises = records.map(sendWhatsppMessageToClient)

        Promise.allSettled(messagePromises).then(async (values) => {
            records = records.map((item, index) => ({ ...item, messageStatus: values[index].status }))
            console.log(records);
            const message = records.reduce((acc: any, curr: any) => ([...acc, `${curr.ownerName} - ${curr.petName} - ${curr.followupFor} - ${curr.mobileNumber}`]), []).join('\n')

            const messgeToSelf = await sendMessageToSelf(records[0].followupDate, message);
            console.log(messgeToSelf);

            const response = {
                statusCode: 200,
                body: JSON.stringify({ records })
            };
            callback(null, response);
        });
    });
}

