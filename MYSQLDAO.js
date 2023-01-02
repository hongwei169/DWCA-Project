var pmysql = require('promise-mysql')
var pool;

// Create a connection pool
pmysql.createPool({
    connectionLimit: 1,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'proj2022'
})
    .then(p => {
        pool = p
    })
    .catch(e => {
        console.log("pool error:" + e)
    })

// Get all employees
var getEmployees = function () {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM employee')
            .then((data) => {
                resolve(data)
            })
            .catch(error => {
                reject(error)
            })
    })
}

// Get employee by eid
var getEmployee = function (eid) {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'SELECT * FROM employee WHERE eid=?',
            values: [eid]
        }
        pool.query(myQuery)
            .then((data) => {
                resolve(data)
            })
            .catch(error => {
                reject(error)
            })
    })
}

// Update employee by eid
var updateEmployee = function (eid, ename, role, salary) {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'UPDATE employee SET ename = ? , role = ? , salary = ? WHERE eid = ?',
            values: [ename, role, salary, eid]
        }
        pool.query(myQuery)
            .then((data) => {
                resolve(data)
            })
            .catch(error => {
                reject(error)
            })
    })
}

// Get all departments
var getDepartment = function () {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM dept ORDER BY Lid')
            .then((data) => {
                resolve(data)
            })
            .catch(error => {
                reject(error)
            })
    })
}

// Delete department by did
var deleteDepartment = function (did) {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'DELETE FROM dept WHERE did=?',
            values: [did]
        }
        pool.query(myQuery)
            .then((data) => {
                resolve(data)
            })
            .catch(error => {
                reject(error)
            })
    })
}

// Export functions
module.exports = { getEmployees, getEmployee, updateEmployee, getDepartment, deleteDepartment }