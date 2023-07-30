import axios from "axios"
import { IRecord } from './records';

export function generatePrescription(record: IRecord, callback: any) {

    var data = JSON.stringify({
        "ownerName": record.ownerName,
        "address": record.address,
        "petName": record.petName,
        "species": record.species,
        "breed": record.breed,
        "weight": "-",
        "age": "-",
        "sex": "-",
        "color": "-",
        "date": record.date,
        "followup": record.followupDate,
        "historyObserved": record.history,
        "rxData": record.treatment.split(','),
        "advice": record.treatmentDescription
    });

    var config = {
        method: 'post',
        url: 'https://1ks7lah1u2.execute-api.us-east-1.amazonaws.com/default/Madhuri-Pet-Clinic-PDF-Generator-dev-generate-pdf',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
            const res = {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(response.data)
            }
            callback(null, res)
        })
        .catch(function (error) {
            console.log(error);
            const res = {
                statusCode: 502,
                headers: {
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(error.message)
            }
            callback(null, res)
        });

}