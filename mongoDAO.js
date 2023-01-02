const MongoClient = require('mongodb').MongoClient

var db
var coll

// Connect to the database before starting the application server.
MongoClient.connect('mongodb://localhost:27017')
    .then((client) => {
        db = client.db('employeesDB')
        coll = db.collection('employees')
    })
    .catch((error) => {
        console.log(error.message)
    })

// Find all documents in the collection
var findAll = function () {
    return new Promise((resolve, reject) => {
        var cursor = coll.find().sort({ _id: 1 })
        cursor.toArray()
            .then((documents) => {
                resolve(documents)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

// Insert a single document
var addEmployee = function (employee) {
    return new Promise((resolve, reject) => {
        coll.insertOne(employee)
            .then((documents) => {
                resolve(documents)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

// Export all functions
module.exports = { findAll , addEmployee}