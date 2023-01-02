var express = require('express')
var mySQLDAO = require('./MySQLDAO')
var mongoDAO = require('./mongoDAO');

var app = express() // called app by convention
let ejs = require('ejs');
app.set('view engine', 'ejs')
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
const { check, validationResult } = require('express-validator');
const e = require('express');

//HOME PAGE
app.get('/', (req, res) => {
    res.render('home')
})

//LIST OF EMPLOYEES
app.get('/employees', (req, res) => {
    mySQLDAO.getEmployees()
        .then((data) => {
            // Display data using EJS
            res.render('employees', { "employees": data })
        })
        .catch((error) => {
            // Handle error
            console.log(error)
        })
})

//EDIT EMPLOYEE
app.get('/employees/edit/:id', (req, res) => {
    mySQLDAO.getEmployee(req.params.id)
        .then((data) => {
            console.log(data)
            // Display data using EJS
            res.render('editEmployees', { "employee": data[0], errors: undefined })
        })
        .catch((error) => {
            // Handle error
            console.log(error)
        })
})

//UPDATE EMPLOYEE
app.post('/employees/edit/:id',
    [
        check('ename').isLength({ min: 5 }).withMessage('Employee Name must be at least 5 characters'), // Validate name at least 5 characters.
        check('salary').isFloat({ min: 0 }).withMessage('Salary must be greater than 0'), // Validate salary is greater than 0.
        check('role').toUpperCase().isIn(['MANAGER', 'EMPLOYEE']).withMessage('Role should be Manager or Employee.') // Validate role is either Manager or Employee.
    ],
    (req, res) => {
        const errors = validationResult(req)

        // Check if there are any errors
        if (!errors.isEmpty()) {
            // Display errors using EJS
            res.render('editEmployees', {
                "employee": { eid: req.body.eid, ename: req.body.ename, role: req.body.role, salary: req.body.salary },
                errors: errors.errors
            })
        } else {
            // if no errors, call updateEmployee() from MySQLDAO.js
            mySQLDAO.updateEmployee(req.body.eid, req.body.ename, req.body.role, req.body.salary)
                .then((data) => {
                    res.redirect('/employees')
                })
                .catch((error) => {
                    // Handle error
                    console.log(error)
                })
        }

    })

//LIST OF DEPARTMENTS
app.get('/depts', (req, res) => {
    mySQLDAO.getDepartment()
        .then((data) => {
            // Display data using EJS 
            res.render('depts', { "departments": data })
        })
        .catch((error) => {
            // Handle error
            console.log(error)
        })
})

//DELETE DEPARTMENT
app.get('/depts/delete/:did', (req, res) => {
    mySQLDAO.deleteDepartment(req.params.did)
        .then((data) => {
            res.redirect('/depts')
        })
        .catch((error) => {
            // Handle error
            console.log(error)
            
            if (error.errno == 1451) {
                res.send('<h1>Error Message</h1><h2><br>' + req.params.did + ' has Employees and cannot be deleted.</h2> <a href="/">Home</a>')
            }
        })
})


//LIST OF EMPLOYEES MONGODB
app.get('/employeesMongoDB', (req, res) => {
    mongoDAO.findAll()
        .then((docs) => {
            // Display data using EJS
            res.render('employeesMongoDB', { "employees": docs })
        })
        .catch((error) => {
            // Handle error
            console.log(error)
        })
})

// ADD EMPLOYEE MONGODB PAGE
app.get('/employeesMongoDB/add', (req, res) => {
    // Display data using EJS
    res.render('addEmployeesMongoDB', { errors: undefined })
})

//ADD EMPLOYEE MONGODB 
app.post('/employeesMongoDB/add',
    [
        check('_id').isLength({ min: 4, max: 4 }).withMessage('EID must be 4 characters'), // check if the EID is 4 characters
        check('phone').isLength({ min: 5 }).withMessage('Phone must be > 5 characters'), // check if the phone number is > 5 characters
        check('email').isEmail().withMessage('Must be a valid email address') // check if the email is a valid email address
    ],
    (req, res) => {
        const errors = validationResult(req) // check if there are any errors

        // if there are errors, display the errors
        if (!errors.isEmpty()) {
            res.render('addEmployeesMongoDB', { errors: errors.errors })
        } else {
            // if there are no errors, check if the employee exists in the MySQL database
            mySQLDAO.getEmployee(req.body._id)
                .then((data) => {
                    // if the employee exists in the MySQL database, add them to the MongoDB database
                    if (data.length > 0) {
                        // add the employee to the MongoDB database
                        mongoDAO.addEmployee({ _id: req.body._id, phone: req.body.phone, email: req.body.email })
                            .then((result) => {
                                console.log(result)
                                res.redirect('/employeesMongoDB') // redirect to the list of employees in MongoDB
                            })
                            // if the employee already exists in the MongoDB database, display an error message
                            .catch((error) => {
                                if (error.code == 11000) {
                                    res.send('<h1>Error Message</h1> <br> <h2>Error: EID ' + req.body._id + ' already exists in MongoDB.</h2> <a href="/employeesMongoDB">Home</a>')
                                }
                                else {
                                    console.log(error)
                                }
                            })
                    }
                    else {
                        // if the employee doesn't exist in the MySQL database, display an error message
                        res.send('<h1>Error Message</h1> <br> <h2>Employee ' + req.body._id + ' doesn\'t exists in MySQL DB</h2> <a href="/employeesMongoDB">Home</a>')
                    }
                })
                .catch((error) => {
                    // Handle error
                    console.log(error)
                })

        }
    })


//Tries allocating port 3000 to the app
app.listen(3000, () => {
    console.log("Listening on port 3000")
})
