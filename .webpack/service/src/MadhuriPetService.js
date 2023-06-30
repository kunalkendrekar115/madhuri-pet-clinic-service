/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "../../../src/controllers/db-migrate.ts":
/*!**********************************************!*\
  !*** ../../../src/controllers/db-migrate.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   migrateDb: () => (/* binding */ migrateDb)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);

const dynamoDb = new aws_sdk__WEBPACK_IMPORTED_MODULE_0__.DynamoDB.DocumentClient();
function migrateDb(body, callback) {
    const paramsFrom = {
        TableName: "madhuri-pet-clinic-service-prod"
    };
    // fetch todo from the database
    dynamoDb.scan(paramsFrom, (error, result) => {
        var _a, _b;
        // handle potential errors
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                body: JSON.stringify({ message: error.toString() })
            });
            return;
        }
        (_a = result.Items) === null || _a === void 0 ? void 0 : _a.forEach((item) => {
            const params = {
                TableName: process.env.DYNAMODB_RECORDS_TABLE,
                Item: item
            };
            dynamoDb.put(params, (error, result) => {
                // handle potential errors
                if (error) {
                    callback(new Error('Couldn\'t create the todo item.'));
                    return;
                }
            });
        });
        // create a response
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ records: (_b = result.Items) === null || _b === void 0 ? void 0 : _b.length }),
        };
        callback(null, response);
    });
}


/***/ }),

/***/ "../../../src/controllers/get-expenditure.ts":
/*!***************************************************!*\
  !*** ../../../src/controllers/get-expenditure.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getExpenditure: () => (/* binding */ getExpenditure)
/* harmony export */ });
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);

const dynamoDb = new aws_sdk__WEBPACK_IMPORTED_MODULE_0__.DynamoDB.DocumentClient();
function getExpenditure(queryParams, callback) {
    const params = Object.assign(Object.assign({ TableName: process.env.DYNAMODB_EXPENDITURES_TABLE }, ((queryParams === null || queryParams === void 0 ? void 0 : queryParams.id) && {
        ExpressionAttributeValues: {
            ":a": queryParams.id
        },
        FilterExpression: "id = :a"
    })), ((queryParams === null || queryParams === void 0 ? void 0 : queryParams.from) && {
        ExpressionAttributeValues: {
            ':from': queryParams.from,
            ':to': queryParams.to
        },
        ExpressionAttributeNames: { '#timestamp': 'date' },
        FilterExpression: '(#timestamp BETWEEN :from AND :to)'
    }));
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
        const totalExpenditure = result.Items.reduce((acc, { amount }) => acc + amount, 0);
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


/***/ }),

/***/ "../../../src/controllers/records.ts":
/*!*******************************************!*\
  !*** ../../../src/controllers/records.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   deleteRecord: () => (/* binding */ deleteRecord),
/* harmony export */   getRecords: () => (/* binding */ getRecords),
/* harmony export */   saveRecords: () => (/* binding */ saveRecords),
/* harmony export */   updateRecord: () => (/* binding */ updateRecord)
/* harmony export */ });
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! uuid */ "../../uuid/dist/esm-node/v1.js");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);


const dynamoDb = new aws_sdk__WEBPACK_IMPORTED_MODULE_0__.DynamoDB.DocumentClient();
function saveRecords(body, callback) {
    const params = {
        TableName: process.env.DYNAMODB_RECORDS_TABLE,
        Item: Object.assign({ id: uuid__WEBPACK_IMPORTED_MODULE_1__["default"]() }, body)
    };
    // write the todo to the database
    dynamoDb.put(params, (error, result) => {
        // handle potential errors
        if (error) {
            callback(new Error('Couldn\'t create the todo item.'));
            return;
        }
        // create a response
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(params.Item)
        };
        callback(null, response);
    });
}
function getRecords(queryParams, callback) {
    console.log(process.env.DBENDPOINT);
    const params = Object.assign(Object.assign(Object.assign({ TableName: process.env.DYNAMODB_RECORDS_TABLE }, ((queryParams === null || queryParams === void 0 ? void 0 : queryParams.id) && {
        ExpressionAttributeValues: {
            ":a": queryParams.id
        },
        FilterExpression: "id = :a"
    })), ((queryParams === null || queryParams === void 0 ? void 0 : queryParams.from) && {
        ExpressionAttributeValues: {
            ':from': queryParams.from,
            ':to': queryParams.to
        },
        ExpressionAttributeNames: { '#timestamp': 'date' },
        FilterExpression: '(#timestamp BETWEEN :from AND :to)'
    })), ((queryParams === null || queryParams === void 0 ? void 0 : queryParams.reference) && {
        ExpressionAttributeValues: {
            ":a": queryParams.reference
        },
        ExpressionAttributeNames: { '#referBy': 'reference' },
        FilterExpression: "#referBy = :a"
    }));
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
        const totalEarnings = result.Items.reduce((acc, { paidAmount }) => acc + paidAmount, 0);
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
function updateRecord(queryParams, body, callback) {
    const params = {
        TableName: process.env.DYNAMODB_RECORDS_TABLE,
        Key: {
            id: queryParams.id
        },
        UpdateExpression: `set paidAmount=:paidAmount, remainingAmount=:remainingAmount `,
        ExpressionAttributeValues: {
            ":paidAmount": body.paidAmount,
            ":remainingAmount": body.remainingAmount
        },
        ReturnValues: "ALL_NEW",
    };
    dynamoDb.update(params, (error, result) => {
        if (error) {
            callback(new Error('Couldn\'t update  the item.'));
            return;
        }
        console.log('result', result);
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
        };
        callback(null, response);
    });
}
function deleteRecord(queryParams, callback) {
    const params = {
        TableName: process.env.DYNAMODB_RECORDS_TABLE,
        Key: {
            id: queryParams.id
        },
    };
    dynamoDb.delete(params, (error, result) => {
        if (error) {
            callback(new Error('Couldn\'t delete the item.'));
            return;
        }
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
        };
        callback(null, response);
    });
}


/***/ }),

/***/ "../../../src/controllers/save-expenditure.ts":
/*!****************************************************!*\
  !*** ../../../src/controllers/save-expenditure.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   saveExpenditure: () => (/* binding */ saveExpenditure)
/* harmony export */ });
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! uuid */ "../../uuid/dist/esm-node/v1.js");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! aws-sdk */ "aws-sdk");
/* harmony import */ var aws_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(aws_sdk__WEBPACK_IMPORTED_MODULE_0__);


const dynamoDb = new aws_sdk__WEBPACK_IMPORTED_MODULE_0__.DynamoDB.DocumentClient();
function saveExpenditure(body, callback) {
    const params = {
        TableName: process.env.DYNAMODB_EXPENDITURES_TABLE,
        Item: Object.assign({ id: uuid__WEBPACK_IMPORTED_MODULE_1__["default"]() }, body)
    };
    // write the todo to the database
    dynamoDb.put(params, (error, result) => {
        // handle potential errors
        if (error) {
            console.log(error);
            callback(new Error('Couldn\'t create the todo item.'));
            return;
        }
        // create a response
        const response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(params.Item)
        };
        callback(null, response);
    });
}


/***/ }),

/***/ "../../uuid/dist/esm-node/regex.js":
/*!*****************************************!*\
  !*** ../../uuid/dist/esm-node/regex.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i);

/***/ }),

/***/ "../../uuid/dist/esm-node/rng.js":
/*!***************************************!*\
  !*** ../../uuid/dist/esm-node/rng.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ rng)
/* harmony export */ });
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! crypto */ "crypto");
/* harmony import */ var crypto__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(crypto__WEBPACK_IMPORTED_MODULE_0__);

const rnds8Pool = new Uint8Array(256); // # of random values to pre-allocate

let poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    crypto__WEBPACK_IMPORTED_MODULE_0___default().randomFillSync(rnds8Pool);
    poolPtr = 0;
  }

  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

/***/ }),

/***/ "../../uuid/dist/esm-node/stringify.js":
/*!*********************************************!*\
  !*** ../../uuid/dist/esm-node/stringify.js ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   unsafeStringify: () => (/* binding */ unsafeStringify)
/* harmony export */ });
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validate.js */ "../../uuid/dist/esm-node/validate.js");

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).slice(1));
}

function unsafeStringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

function stringify(arr, offset = 0) {
  const uuid = unsafeStringify(arr, offset); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__["default"])(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (stringify);

/***/ }),

/***/ "../../uuid/dist/esm-node/v1.js":
/*!**************************************!*\
  !*** ../../uuid/dist/esm-node/v1.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rng.js */ "../../uuid/dist/esm-node/rng.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stringify.js */ "../../uuid/dist/esm-node/stringify.js");

 // **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

let _nodeId;

let _clockseq; // Previous uuid creation time


let _lastMSecs = 0;
let _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details

function v1(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node || _nodeId;
  let clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189

  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_0__["default"])();

    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
    }

    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.


  let msecs = options.msecs !== undefined ? options.msecs : Date.now(); // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock

  let nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval


  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  } // Per 4.2.1.2 Throw error if too many uuids are requested


  if (nsecs >= 10000) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

  msecs += 12219292800000; // `time_low`

  const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff; // `time_mid`

  const tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff; // `time_high_and_version`

  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version

  b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

  b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`

  b[i++] = clockseq & 0xff; // `node`

  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf || (0,_stringify_js__WEBPACK_IMPORTED_MODULE_1__.unsafeStringify)(b);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v1);

/***/ }),

/***/ "../../uuid/dist/esm-node/validate.js":
/*!********************************************!*\
  !*** ../../uuid/dist/esm-node/validate.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./regex.js */ "../../uuid/dist/esm-node/regex.js");


function validate(uuid) {
  return typeof uuid === 'string' && _regex_js__WEBPACK_IMPORTED_MODULE_0__["default"].test(uuid);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (validate);

/***/ }),

/***/ "aws-sdk":
/*!**************************!*\
  !*** external "aws-sdk" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("aws-sdk");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*****************************************!*\
  !*** ../../../src/MadhuriPetService.ts ***!
  \*****************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   routes: () => (/* binding */ routes)
/* harmony export */ });
/* harmony import */ var _controllers_records__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./controllers/records */ "../../../src/controllers/records.ts");
/* harmony import */ var _controllers_db_migrate__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./controllers/db-migrate */ "../../../src/controllers/db-migrate.ts");
/* harmony import */ var _controllers_save_expenditure__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./controllers/save-expenditure */ "../../../src/controllers/save-expenditure.ts");
/* harmony import */ var _controllers_get_expenditure__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./controllers/get-expenditure */ "../../../src/controllers/get-expenditure.ts");
// eslint-disable no-fallthrough 




function routes(event, context, callback) {
    const path = event.path;
    console.log(path);
    /* eslint-disable no-fallthrough */
    switch (event.httpMethod) {
        case "GET": {
            switch (path) {
                case "/records":
                    return (0,_controllers_records__WEBPACK_IMPORTED_MODULE_0__.getRecords)(event.queryStringParameters, callback);
                case "/expenditure":
                    return (0,_controllers_get_expenditure__WEBPACK_IMPORTED_MODULE_3__.getExpenditure)(event.queryStringParameters, callback);
            }
        }
        case "POST": {
            const body = JSON.parse(event.body);
            switch (path) {
                case "/records":
                    return (0,_controllers_records__WEBPACK_IMPORTED_MODULE_0__.saveRecords)(body, callback);
                case "/records/db-migrate":
                    return (0,_controllers_db_migrate__WEBPACK_IMPORTED_MODULE_1__.migrateDb)(body, callback);
                case "/expenditure":
                    return (0,_controllers_save_expenditure__WEBPACK_IMPORTED_MODULE_2__.saveExpenditure)(body, callback);
                // case "/generate-pdf":
                //   return generatePDF(body, callback);
            }
        }
        case "PATCH": {
            const body = JSON.parse(event.body);
            switch (path) {
                case "/record":
                    return (0,_controllers_records__WEBPACK_IMPORTED_MODULE_0__.updateRecord)(event.queryStringParameters, body, callback);
            }
        }
        case "DELETE": {
            return (0,_controllers_records__WEBPACK_IMPORTED_MODULE_0__.deleteRecord)(event.queryStringParameters, callback);
        }
    }
}

})();

var __webpack_export_target__ = exports;
for(var i in __webpack_exports__) __webpack_export_target__[i] = __webpack_exports__[i];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;
//# sourceMappingURL=MadhuriPetService.js.map