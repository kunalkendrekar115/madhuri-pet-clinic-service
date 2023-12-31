// eslint-disable no-fallthrough 

import { saveRecords, getRecords, updateRecord, deleteRecord } from "./controllers/records"
import { migrateDb } from "./controllers/db-migrate"
import { saveExpenditure } from './controllers/save-expenditure';
import { getExpenditure } from './controllers/get-expenditure';
import { getAvlTreatments, putTreatment } from './controllers/available-treatments';
import { generatePrescription } from "./controllers/generate-pdf-service";


export function routes(event: any, context, callback: any) {

  const path: string = event.path

  console.log(path);
  /* eslint-disable no-fallthrough */
  switch (event.httpMethod) {

    case "GET": {

      switch (path) {
        case "/records":
          return getRecords(event.queryStringParameters, callback)
        case "/expenditure":
          return getExpenditure(event.queryStringParameters, callback)
        case "/treatments":
          return getAvlTreatments(callback)
      }
    }

    case "POST": {
      const body = JSON.parse(event.body)

      switch (path) {
        case "/records":
          return saveRecords(body, callback)
        case "/records/db-migrate":
          return migrateDb(body, callback);
        case "/expenditure":
          return saveExpenditure(body, callback);
        case "/treatments":
          return putTreatment(body, callback);
        case "/generate-prescription":
          return generatePrescription(body, callback);
      }
    }

    case "PATCH": {
      const body = JSON.parse(event.body)

      switch (path) {
        case "/records":
          return updateRecord(event.queryStringParameters, body, callback)
      }
    }

    case "DELETE": {
      return deleteRecord(event.queryStringParameters, callback)
    }
  }
}