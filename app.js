const express = require('express');
const bodyParser = require('body-parser');

// for swagger
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

var cors = require('cors');

const app = express();

var corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }
  app.use(cors(corsOptions));
const management = require('./routes/managementroute');
// parse requests of content-type: application/json
// app.use(express.json())
app.use(bodyParser.json());
app.use('/theemployee', management, cors(corsOptions));
// parse requests of content-type: application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(express.json({limit:'50mb'}));

// swagger options
const swaggerOptions = {
    swaggerDefinition: {
      info: {
        title: 'Lexo API',
        version: '1.0.0',
      },
    },
    apis: ['app.js'], // files containing annotations as above
  };
  const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use('/', swaggerUI.serve, swaggerUI.setup(swaggerSpec))

//Create new employee
/**
 * @swagger
 * /theemployee/newemployee:
 *   post:
 *     summary: Creates a new employee
 *     description: Create an employee
 *     parameters:
 *       - in: body
 *         name: Employee
 *         description: The employee to add
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - firstname
 *             - lastname
 *             - salary
 *             - password
 *           properties: 
 *              email:
 *                 type: string
 *              firstname:
 *                 type: string
 *              lastname:
 *                 type: string
 *              salary:
 *                 type: integer
 *              password:
 *                 type: string
  
 *     responses:
 *      201:
 *        description: Created
 *      200:
 *        description: The added employee details
 *        content:
 *          application/json:
 *            schema:
 *                type: object
 *                properties:
 *                  email:
 *                    type: string
 *                  firstname:
 *                    type: string
 *                  lastname:
 *                    type: string
 *                  salary:
 *                    type: integer
 *                  password:
 *                    type: string
 */

//Activate user
/**
 * @swagger
 * /theemployee/activateuser:
 *   put:
 *     summary: Sets user activated to be true
 *     description: Activate user
 *     parameters:
 *       - in: body
 *         name: User
 *         description: The user to activate
 *         schema:
 *           type: object
 *           required:
 *             - email
 *           properties: 
 *              email:
 *                 type: string
 *     responses:
 *      200:
 *        description: The user is activated
 */

//Activation link
/**
 * @swagger
 * /theemployee/activatelink:
 *   post:
 *     summary: Sends activation link to the user
 *     description: Send activation link
 *     parameters:
 *       - in: body
 *         name: User
 *         description: The email to activate
 *         schema:
 *           type: object
 *           required:
 *             - email
 *           properties: 
 *              email:
 *                 type: string
 *     responses:
 *      200:
 *        description: The link is send
 */

//Login
/**
 * @swagger
 * /theemployee/login:
 *   post:
 *     summary: User login
 *     description: Login a user
 *     parameters:
 *       - in: body
 *         name: Login
 *         description: Login user
 *         schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *                email:
 *                  type: string
 *                password:
 *                  type: string
 *     responses:
 *      200:
 *        description: Login success
 */

//get all users
/**
 * @swagger
 * /theemployee/allusers:
 *   get:
 *     summary: Get all user to the system
 *     responses:
 *      200:
 *        description: Success
 */

//get all employees
/**
 * @swagger
 * /theemployee/allemployees:
 *   get:
 *     summary: Get all employees to the system
 *     responses:
 *      200:
 *        description: Success
 */

//Update password
/**
 * @swagger
 * /theemployee/updatePass:
 *   put:
 *     summary: Update user password
 *     description: updates password
 *     parameters:
 *       - in: body
 *         name: Update
 *         description: Update these details
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - password
 *           properties: 
 *              email:
 *                 type: string
 *              password:
 *                 type: string
 *     responses:
 *      200:
 *        description: The password is updated
 */

//send password reset link to a specific email
/**
 * @swagger
 * /theemployee/resetpasslink/{email}:
 *   post:
 *     summary: send password reset link
 *     description: sends an email to reset the password
 *     parameters:
 *       - in: path
 *         name: email
 *         description: Link to set new password
 *         type: string
 *         required: true
 *     responses:
 *      200:
 *        description: The password reset link is send
 */

//Deactivate user
/**
 * @swagger
 * /theemployee/deactivateuser:
 *   put:
 *     summary: Deactivate user
 *     description: deactivate user
 *     parameters:
 *       - in: body
 *         name: User
 *         description: Deactivate user
 *         schema:
 *           type: object
 *           required:
 *             - email
 *           properties: 
 *              email:
 *                 type: string
 *     responses:
 *      200:
 *        description: The user is deactivated
 */

//Create admin
/**
 * @swagger
 * /theemployee/newadmin:
 *   post:
 *     summary: Creates a new admin
 *     description: Create an admin
 *     parameters:
 *       - in: body
 *         name: Admin
 *         description: The admin to add
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - firstname
 *             - lastname
 *             - password
 *           properties: 
 *              email:
 *                 type: string
 *              firstname:
 *                 type: string
 *              lastname:
 *                 type: string
 *              password:
 *                 type: string
  
 *     responses:
 *      201:
 *        description: Created
 *      200:
 *        description: The added admin details
 *        content:
 *          application/json:
 *            schema:
 *                type: object
 *                properties:
 *                  email:
 *                    type: string
 *                  firstname:
 *                    type: string
 *                  lastname:
 *                    type: string
 *                  password:
 *                    type: string
 */

//get all staff
/**
 * @swagger
 * /theemployee/allstaff:
 *   get:
 *     summary: Get all staff to the system
 *     responses:
 *      200:
 *        description: Success
 */

//Message all employees
/**
 * @swagger
 * /theemployee/messemployees:
 *   post:
 *     summary: Messages all employees
 *     description: Message employees
 *     parameters:
 *       - in: body
 *         name: Employees
 *         description: Send message to all employees
 *         schema:
 *           type: object
 *           required:
 *             - subject
 *             - html
 *           properties: 
 *              subject:
 *                 type: string
 *              html:
 *                 type: string
 *     responses:
 *      200:
 *        description: Message send
 */

//Send random email
/**
 * @swagger
 * /theemployee/messemail:
 *   post:
 *     summary: send email
 *     description: send email
 *     parameters:
 *       - in: body
 *         name: Mail
 *         description: Send email
 *         schema:
 *           type: object
 *           required:
 *             - to
 *             - subject
 *             - html
 *           properties: 
 *              to:
 *                 type: string
 *              subject:
 *                 type: string
 *              html:
 *                 type: string
 *     responses:
 *      200:
 *        description: Message send
 */

//delete employee
/**
 * @swagger
 * /theemployee/deleteemployee/{email}:
 *   delete:
 *     summary: Delete an employee
 *     description: Delete an employee
 *     parameters:
 *       - in: path
 *         name: email
 *         description: Employee to delete
 *         type: string
 *         required: true
 *     responses:
 *      200:
 *        description: Employee deleted
 */

//delete admin
/**
 * @swagger
 * /theemployee/deleteadmin/{email}:
 *   delete:
 *     summary: Delete an admin
 *     description: Delete an admin
 *     parameters:
 *       - in: path
 *         name: email
 *         description: Admin to delete
 *         type: string
 *         required: true
 *     responses:
 *      200:
 *        description: Admin deleted
 */

//Update profile picture
/**
 * @swagger
 * /theemployee/updateprofile/{email}:
 *   put:
 *     summary: Update profile picture
 *     description: Update profile picture
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: email
 *         description: Email to update
 *         required: true
 *         type: string
 *       - in: formData
 *         name: filename
 *         description: File to upload
 *         required: true
 *         type: file
 *     responses:
 *      200:
 *        description: Profile picture updated
 */

//Update staff data
/**
 * @swagger
 * /theemployee/updatenames/{email}:
 *   put:
 *     summary: Update staff data
 *     description: Update names
 *     parameters:
 *       - in: path
 *         name: email
 *         description: email to update details
 *         type: string
 *       - in: body
 *         name: Update
 *         description: Update these details
 *         schema:
 *           type: object
 *           required:
 *             - firstname
 *             - lastname
 *           properties: 
 *              firstname:
 *                 type: string
 *              lastname:
 *                 type: string
 *     responses:
 *      200:
 *        description: Profile picture updated
 */

//get profile picture
/**
 * @swagger
 * /theemployee/picprof/{email}:
 *   get:
 *     summary: Get user's profile picture
 *     parameters:
 *       - in: path
 *         name: email
 *         description: User to get profile picture
 *         type: string
 *         required: true
 *     responses:
 *      200:
 *        description: Success
 */

//Subscribe
/**
 * @swagger
 * /theemployee/subscribe:
 *   post:
 *     summary: Register to subscribe
 *     description: Register to subscribe
 *     parameters:
 *       - in: body
 *         name: Subscribe
 *         description: Registre to subscribe
 *         schema:
 *           type: object
 *           required:
 *             - email
 *           properties: 
 *              email:
 *                 type: string
 *     responses:
 *      200:
 *        description: Subscription successful
 */

//Verify subscription
/**
 * @swagger
 * /theemployee/verifysubscription:
 *   put:
 *     summary: Verify subscription
 *     description: Verify subscription
 *     parameters:
 *       - in: body
 *         name: Verify
 *         description: Verify this email
 *         schema:
 *           type: object
 *           required:
 *             - userId
 *           properties: 
 *              userId:
 *                 type: string
 *     responses:
 *      200:
 *        description: Verification successful
 */

//Message all customers
/**
 * @swagger
 * /theemployee/messcustomers:
 *   post:
 *     summary: Messages all customers
 *     description: Message customers
 *     parameters:
 *       - in: body
 *         name: Customers
 *         description: Send message to all customers
 *         schema:
 *           type: object
 *           required:
 *             - subject
 *             - html
 *           properties: 
 *              subject:
 *                 type: string
 *              html:
 *                 type: string
 *     responses:
 *      200:
 *        description: Message send
 */

//Add each sale
/**
 * @swagger
 * /theemployee/newsale:
 *   post:
 *     summary: Register each sale
 *     description: Register new sale
 *     parameters:
 *       - in: body
 *         name: Sales
 *         description: Register new sale
 *         schema:
 *           type: object
 *           required:
 *             - seller
 *             - carNo
 *             - no_of_ltrs
 *             - product
 *           properties: 
 *              seller:
 *                 type: string
 *              carNo:
 *                 type: string
 *              no_of_ltrs:
 *                 type: integer
 *              product:
 *                 type: string
 *     responses:
 *      200:
 *        description: Sale recorded
 */

//get frequent customers
/**
 * @swagger
 * /theemployee/fcustomers:
 *   get:
 *     summary: Get frequent customers
 *     responses:
 *      200:
 *        description: Success
 */

//Add new offer
/**
 * @swagger
 * /theemployee/newoffer:
 *   post:
 *     summary: Add new offer
 *     description: Register new offer
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: offerdesc
 *         description: Offer description
 *         required: true
 *         type: string
 *       - in: formData
 *         name: filename
 *         description: File to upload
 *         required: true
 *         type: file
 *     responses:
 *      200:
 *        description: Offer added successfully
 */

//get all offers
/**
 * @swagger
 * /theemployee/theoffer:
 *   get:
 *     summary: Get all offers
 *     responses:
 *      200:
 *        description: Success
 */

//delete offer
/**
 * @swagger
 * /theemployee/deleteoffer/{imgdesc}:
 *   delete:
 *     summary: Delete an offer
 *     description: Delete an offer
 *     parameters:
 *       - in: path
 *         name: imgdesc
 *         description: Offer to delete
 *         type: string
 *         required: true
 *     responses:
 *      200:
 *        description: Offer deleted
 */

//Update employee data
/**
 * @swagger
 * /theemployee/updateemployee/{email}:
 *   put:
 *     summary: Update employee data
 *     description: Update names
 *     parameters:
 *       - in: path
 *         name: email
 *         description: email to update details
 *         type: string
 *       - in: body
 *         name: Update
 *         description: Update these details
 *         schema:
 *           type: object
 *           required:
 *             - firstname
 *             - lastname
 *             - salary
 *           properties: 
 *              firstname:
 *                 type: string
 *              lastname:
 *                 type: string
 *              salary:
 *                 type: integer
 *     responses:
 *      200:
 *        description: Profile picture updated
 */

//Add new product
/**
 * @swagger
 * /theemployee/newproduct:
 *   post:
 *     summary: Add new product
 *     description: Register new product
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: body
 *         name: product
 *         description: The product to add
 *         schema:
 *           type: object
 *           required:
 *             - productdesc
 *             - price
 *             - pname
 *           properties: 
 *              productdesc:
 *                 type: string
 *              price:
 *                 type: integer
 *              pname:
 *                 type: string
 *       - in: formData
 *         name: filename
 *         description: File to upload
 *         required: true
 *         type: file
 *     responses:
 *      200:
 *        description: Product added successfully
 */

//get all products
/**
 * @swagger
 * /theemployee/theproduct:
 *   get:
 *     summary: Get all products
 *     responses:
 *      200:
 *        description: Success
 */

//delete a product
/**
 * @swagger
 * /theemployee/deleteproduct/{imgdesc}:
 *   delete:
 *     summary: Delete a product
 *     description: Delete a product
 *     parameters:
 *       - in: path
 *         name: imgdesc
 *         description: Product to delete
 *         type: string
 *         required: true
 *     responses:
 *      200:
 *        description: Product deleted
 */

//Update products
/**
 * @swagger
 * /theemployee/updateproduct/{pname}:
 *   put:
 *     summary: Update products data
 *     description: Update products data
 *     parameters:
 *       - in: path
 *         name: pname
 *         description: Product name to update details
 *         type: string
 *       - in: body
 *         name: Update
 *         description: Update these details
 *         schema:
 *           type: object
 *           required:
 *             - productdesc
 *             - price
 *           properties: 
 *              productdesc:
 *                 type: string
 *              price:
 *                 type: integer
 *     responses:
 *      200:
 *        description: Profile picture updated
 */

//get sales per employee
/**
 * @swagger
 * /theemployee/theitem/{email}:
 *   get:
 *     summary: Get sales per employee
 *     description: Get all sales by an employee
 *     parameters:
 *       - in: path
 *         name: email
 *         description: Employee to get the sales
 *         type: string
 *     responses:
 *      200:
 *        description: Success
 */

//get all sales
/**
 * @swagger
 * /theemployee/allitems:
 *   get:
 *     summary: Get all sales
 *     description: Get all sales
 *     responses:
 *      200:
 *        description: Success
 */

//get average sales
/**
 * @swagger
 * /theemployee/avgmonth:
 *   get:
 *     summary: Get average sales
 *     description: Get average sales
 *     responses:
 *      200:
 *        description: Success
 */

// set port, listen for requests
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
