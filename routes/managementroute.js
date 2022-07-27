const mysql = require('mysql');
const express = require('express');

const router = express.Router()
const dbConfig = require("../helpers/config");
const jwt = require('jsonwebtoken');

const bcrypt = require('bcryptjs');
//for email
const nodeMailer = require('nodemailer');

// Create a connection to the database
const connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB
});

// open the MySQL connection
connection.connect(function(error){
  if (!!error) {
    res.status(500).send({ message: error.message });
  }
  console.log("Successfully connected to the database.");
});

// define transport for email
const transporter = nodeMailer.createTransport({
  host: 'smtp.gmail.com',
  // secure: true,  //true for 465 port
  auth: {
    user: dbConfig.USERNAME,
    pass: dbConfig.PASS
  }
});

// create new employee
router.post('/newemployee', function(req, res){
  // require email
    var email = req.body.email;
    if(!req.body.email){
      return res.send("Email is required")
    }
  // require password
    var password1 = req.body.password;
    if(!password1){
      return res.send("Password is required")
    }
    const salt = bcrypt.genSaltSync(10);
    // data for employees table
    var reg={
        email: req.body.email,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        salary: req.body.salary
    };  
    // data for all users table
    var alldata={
      email: req.body.email,
      password: bcrypt.hashSync(password1, salt),
      role: "employee",
      activated: false
  }; 
  //  check if user already exist
    connection.query('SELECT * FROM allusers WHERE email = ? ',  [email]
    ,function(err,rows){
    // if error in getting th list
    if(err) {
      return res.send("Error in getting "+email);
    }
    // if no user exist
    if (!rows.length)
    {
    // prompt the user to enter longer password
      if(password1.length < 8) {   
        return res.send("The password length should greater than 8");
      }
      // insert employee
        connection.query('INSERT INTO employees SET ?',reg,function(err, results){
             // insert into all users tables
             connection.query('INSERT INTO allusers SET ?',alldata,function(err, results){
           //  send link to activate your account
            try{
              var url =  `http://localhost:3000/activatelink/${email}`
              const mailOptions = {
                to: email, // list of receivers
                subject: "ACTIVATE YOUR ACCOUNT WITH LEXO",
                html: `<a href= ${url} >Click here</a> to reset your password`
              };
            
              transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                  res.json({
                    msg: 'fail'
                  })
                } else {
                  res.json({
                    msg: 'success'
                  })
                }
            });
          }catch (err) {
            res.status(500).send({ message: err.message });
          } 
              res.send(email+" registered successfully. Check the link send to your email to activate your account");
          });
        });
    }
    else
    {
        return res.send(email+" is already registered");
    }
    });
  });

  // activate account 
  router.put('/activateuser', async (req, res) => {
    try {
      const {userId} = req.body
        connection.query('UPDATE `allusers` SET `activated`=? where `email`=?', [true, userId], function (error, results, fields) {
          const token = jwt.sign({email: userId}, dbConfig.secret, {expiresIn: 60 * 60 * 24});  //expires in 24 hours
          if (error) {
            res.status(500).send({ message: err.message });
          }
        // res.end(JSON.stringify(results));
            res.status(200).send({
              token: token, 
              message: `Account activated successfully`
            });
        })
      }catch (err) {
        res.status(500).send({ message: err.message });
      } 
   
 });
 //send activation link
 router.post('/activatelink', function(req, res){
  // require email
    var email = req.body.email;
  //  check if user already exist
    connection.query('SELECT * FROM allusers WHERE email = ? ',  [email]
    ,function(err,rows){
    // if error in getting th list
    if(err) {      
      return res.send("Error in getting "+email);
    }
    // if user exist
    if (rows.length)
    {
           //  send link to activate your account
            try{
              var url =  `http://localhost:3000/activatelink/${email}`
              const mailOptions = {
                to: email, // list of receivers
                subject: "ACTIVATE YOUR ACCOUNT WITH LEXO",
                html: `<a href= ${url} >Click here</a> to activate your account`
              };
            
              transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                  res.json({
                    msg: 'fail'
                  })
                } else {
                  res.json({
                    msg: 'success'
                  })
                }
            });
          }catch (err) {
            res.status(500).send({ message: err.message });
          } 
              res.send(email+" has received the activation link. Check on your email to activate your account");
        }else{
          return res.status(400).send({ error: "User not found" });
        }
      });
    });

//login by user
  router.post('/login', async (req, res) => {
    var email = req.body.email;
    var sql = "SELECT * FROM allusers WHERE email= ? AND activated= ?"
    var filter = [email, true];
    connection.query(sql, filter, function(error,rows, fields){
            if(error) {
              return res.send("Error in signing the user");
            }
            else { 
              if(rows.length > 0) { 
              bcrypt.compare(req.body.password, rows[0].password, function(error, result) {
                if(result) {
                  const token = jwt.sign({email: email}, dbConfig.secret, {expiresIn: 60 * 60 * 24});  //expires in 24 hour
                  return res.send({
                    user: rows[0],
                    token: token, 
                    message: "Login Successful" });
                }
                else {
                  return res.status(400).send({ error: "Invalid details" });
                }
              });
          } else {
              return res.status(400).send({ error: "Email does not exist or account not activated" });
          } 
          }
      });
  });

//get all users fromthe database
router.get('/allusers', function(req, res) {
  try {
    let sql = `SELECT * FROM allusers`;
    connection.query(sql, function(err, data, fields) {
      if (err) {
        res.status(500).send({ message: err.message });
      }
      res.json({
        status: 200,
        data,
        message: "User lists retrieved successfully"
      })
    })
  }catch (err) {
    res.status(500).send({ message: err.message });
  } 
});

//get all employees fromthe database
router.get('/allemployees', function(req, res) {
  try {
    let sql = `SELECT * FROM employees`;
    connection.query(sql, function(err, data, fields) {
      if (err) {
        res.status(500).send({ message: err.message });
      }
      res.json({
        status: 200,
        data,
        message: "Employees lists retrieved successfully"
      })
    })
  } catch (err) {
    res.status(500).send({ message: err.message });
  } 
});
//reset password
router.put('/updatePass', async (req, res) => {
    try {
      const salt = bcrypt.genSaltSync(10);
      const password = req.body.password;
      const {userId} = req.body

      if(password.length < 8) {     
        res.status(400).send({
          message: "The password length should have minimum length of 8!"
        });
        return;   
      }
        connection.query('UPDATE `allusers` SET `password`=? where `email`=?', [bcrypt.hashSync(password, salt), userId], function (error, results, fields) {
        if (error) {
          res.status(500).send({ message: error.message });
        }
        // res.end(JSON.stringify(results));
        res.send(`Password updated successfully`)
        })
      }catch (err) {
        res.status(500).send({ message: err.message });
      } 
   
 });

 // send reset link via mail
 router.post('/resetpasslink/:email', (req, res) => {
  const {email} = req.params
  if(!email){
    return res.status(401).send({
      message: "Email is required!"
    });
  }
  try{
    connection.query('SELECT * FROM allusers WHERE email = ? ',  [email],function(err,rows){      
      if (rows.length)
      {
        var url =  `http://localhost:3000/resetlink/${email}`
        const mailOptions = {
          to: email, // list of receivers
          subject: "RESET YOUR PASSWORD",
          html: `<a href= ${url} >Click here</a> to reset your password`
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            res.json({
              msg: 'fail'
            })
          } else {
            res.json({
              msg: 'success'
            })
          }
      });

      }
  });
  }
  catch (err) {
    res.status(500).send({ message: err.message });
  } 
});

  //deactivate an admins
  router.put('/deactivateuser', async (req, res) => {
    try {
      const {userId} = req.body
        connection.query('UPDATE `allusers` SET `activated`=? where `email`=?', [false, userId], function (error, results, fields) {
          if (error) {
            res.status(500).send({ message: err.message });
          }
        // res.end(JSON.stringify(results));
            res.status(200).send({
              message: `Account deactivated`
            });
        })
      }catch (err) {
        res.status(500).send({ message: err.message });
      } 
   
 });
    

// create new admin
router.post('/newadmin', function(req, res){
  // require email
    var email = req.body.email;
    if(!req.body.email){
      return res.send("Email is required")
    }
  // require password
    var password1 = req.body.password;
    if(!password1){
      return res.send("Password is required")
    }
    const salt = bcrypt.genSaltSync(10);
    // data for employees table
    var reg={
        email: req.body.email,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        position: req.body.position
    };  
    // data for all users table
    var alldata={
      email: req.body.email,
      password: bcrypt.hashSync(password1, salt),
      role: "staff",
      activated: false
  }; 
  //  check if user already exist
    connection.query('SELECT * FROM allusers WHERE email = ? ',  [email]
    ,function(err,rows){
    // if error in getting th list
    if(err) {      
      return res.send("Error in getting "+email);
    }
    // if no user exist
    if (!rows.length)
    {
    // prompt the user to enter longer password
      if(password1.length < 8) {   
        return res.send("The password length should greater than 8");
      }
      // insert employee
        connection.query('INSERT INTO staff SET ?',reg,function(err, results){
             // insert into all users tables
             connection.query('INSERT INTO allusers SET ?',alldata,function(err, results){
           //  send link to activate your account
            try{
              var url =  `http://localhost:3000/activatelink/${email}`
              const mailOptions = {
                to: email, // list of receivers
                subject: "ACTIVATE YOUR ACCOUNT WITH LEXO",
                html: `<a href= ${url} >Click here</a> to reset your password`
              };
            
              transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                  res.send("User registered. System error occured in sending activation link");
                } else {
                  res.send(email+" registered successfully. Check the link send to your email to activate your account");
                }
            });
          }catch (err) {
            res.status(500).send({ message: err.message });
          } 
          });
        });
    }
    else
    {
        return res.send(email+" is already registered");
    }
    });
  });

  //get all staff fromthe database
router.get('/allstaff', function(req, res) {
  try {
    let sql = `SELECT * FROM staff`;
    connection.query(sql, function(err, data, fields) {
      if (err) {
        res.status(500).send({ message: err.message });
      }
      res.json({
        status: 200,
        data,
        message: "Staff lists retrieved successfully"
      })
    })
  } catch (err) {
    res.status(500).send({ message: err.message });
  } 
});

//send mail to all Employees
router.post('/messemployees', (req, res) => {
  var emails = 'SELECT email FROM employees';
  var to_list = []
  connection.query(emails, function(err, theemail, fields){
//console.log(email);
for(k in theemail){
    to_list.push(theemail[k].email)
  }
}); 
var mailOptions = {
  to: to_list,
  subject: req.body.subject,
  html: req.body.html
  };
  transporter.sendMail(mailOptions, function(error, info){
      if (error) {
      console.log(error);
      res.send('fail')
      } else {
      console.log('Email sent: ' + info.response);
      res.send('success')
      }
  });
})

 //send mail    
 router.post('/messemail', (req, res, next) => {  
  var mail = {
    to: req.body.email,
    subject: req.body.subject,
    html: req.body.message
  }

  transporter.sendMail(mail, (err, data) => {
    if (err) {
      res.json({
        msg: 'fail'
      })
    } else {
      res.json({
        msg: 'success'
      })
    }
  })
})

//delete employee
router.delete('/deleteemployee/:email', (req, res, next)=>{
    const email = req.params.email
    if(!email){
      return res.send("No employee found")
    }
  //  check if user already exist
    connection.query('SELECT * FROM allusers WHERE email = ? ',  [email]
    ,function(err,rows){
    // if error in getting th list
    if(err) {      
      return res.send("Error in getting "+email);
    }
    // if no user exist
    if (!rows.length)
    {
      return res.send("Email not found");
    }
    else
    {
      try {
        let sql = `DELETE FROM allusers WHERE email=?`;
        let sql1 = `DELETE FROM employees WHERE email=?`;
        connection.query(sql, email, function(err, data, fields) {
          connection.query(sql1, email, function(err, data, fields){
            if (err) {
              res.status(500).send({ message: err.message });
            }
            res.json({
              status: 200,
              data,
              message: "User deleted successfully"
            })
          })
        })
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    }
    });
})

//delete admin
router.delete('/deleteadmin/:email', (req, res, next)=>{
    const email = req.params.email
    if(!email){
      return res.send("No admin found")
    }
  //  check if user already exist
    connection.query('SELECT * FROM allusers WHERE email = ? ',  [email]
    ,function(err,rows){
    // if error in getting th list
    if(err) {      
      return res.send("Error in getting "+email);
    }
    // if no user exist
    if (!rows.length)
    {
      return res.send("Email not found");
    }
    else
    {
      try {
        let sql = `DELETE FROM allusers WHERE email=?`;
        let sql1 = `DELETE FROM staff WHERE email=?`;
        connection.query(sql, email, function(err, data, fields) {
          connection.query(sql1, email, function(err, data, fields){
            if (err) {
              res.status(500).send({ message: err.message });
            }
            res.json({
              status: 200,
              data,
              message: "Admin deleted successfully"
            })
          })
        })
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    }
    });
})


const path = require('path')
const multer = require('multer')
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../Images')
  },
  filename: (req, file, cb) => {
    console.log(file)
    cb(null, Date.now() +path.extname(file.originalname))
  }
})

const upload = multer({storage: storage})
// update profile picture
router.put('/updateprofile/:email', upload.single("image"), async (req, res) => {
  try {
    const filename = req.file.filename
    const email = req.params.email
    console.log(filename)
    // const {userId} = req.body
      connection.query('UPDATE `allusers` SET `profilepic`=? where `email`=?', [filename, email], function (error, results, fields) {
        if (error) {
          res.status(500).send({ message: err.message });
        }
      // res.end(JSON.stringify(results));
          res.status(200).send({
            message: `Profile pic set`
          });
      })
    }catch (err) {
      res.status(500).send({ message: err.message });
    } 
});

// update user data
router.put('/updatenames/:email', async (req, res) => {
  try {
      const email = req.params.email;
      const firstname = req.body.firstname;
      const lastname = req.body.lastname;
    // const {userId} = req.body
      connection.query('UPDATE `staff` SET `firstName`=? where `email`=?', [firstname, email], function (error, results, fields) {
        connection.query('UPDATE `staff` SET `lastName`=? where `email`=?', [lastname, email], function (error, results, fields) {
        if (error) {
          res.status(500).send({ message: err.message });
        }
      // res.end(JSON.stringify(results));
          res.status(200).send({
            message: `user data set`
          });
      });
    });
    }catch (err) {
      res.status(500).send({ message: err.message });
    } 
});

// get user profile pic
router.get('/picprof/:email', function(req, res) {
  try {
    const email = req.params.email
    connection.query('SELECT profilepic FROM allusers where `email`=?', [email], function(err, data, fields) {
      if (err) {
        res.status(500).send({ message: err.message });
      }
      res.json({
        status: 200,
        data,
        message: "User retrieved successfully"
      })
    })
  }catch (err) {
    res.status(500).send({ message: err.message });
  } 
});


// subscribe to lexo as a customer
router.post('/subscribe', function(req, res){
  var reg={
      email: req.body.email,
      confirmed: false
  };
  var email1 = req.body.email;
  //check for unconfirmed subscription
  var sql = "SELECT * FROM subscribed_users WHERE email= ? AND confirmed= ?;"
  var filter = [email1, true];

  connection.query(sql, filter, function(err,rows){
  if(err) {
      connection.end();
      
      return res.send("Error in subscribing the user");
  }

  if (!rows.length)
  {
        connection.query('SELECT * FROM subscribed_users WHERE email = ? ',  [email1]
          ,function(err,rows){      
            if (rows.length)
            {
              const url = `http://localhost:3000/subscribe/${email1}`
              var mailOptions = {
                to: email1,
                subject: "Confirm subscription for Lexo",
                html: `<a href= '${url}' >Click here</a> to subscribe to Lexo promotional messages`
                };
                //share email to verifymail route
                res.app.set('myemail', req.body.email);

                transporter.sendMail(mailOptions, function(error, info){
                  if (error) {
                  console.log(error);
                  res.send('fail')
                  } else {
                  console.log('Email sent: ' + info.response);
                  res.send('success')
                  }
              });
                res.send("Check a link send to "+email1+" and confirm your subscription");
            }
            else
            {

              connection.query('INSERT INTO subscribed_users SET ?',reg,function(err, results){
                //send confimation message 
                const url = `http://localhost:3000/subscribe/${email1}`
                var mailOptions = {
                  to: email1,
                  subject: "Confirm subscription for Lexo",
                  html: `<a href= '${url}' >Click here</a> to subscribe to Lexo promotional messages`
                  };
                  //share email to verifymail route
                  // res.app.set('myemail', req.body.email);

                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                    console.log(error);
                    res.send('fail')
                    } else {
                    console.log('Email sent: ' + info.response);
                    res.send('success')
                    }
                });
                return res.send("Check a link send to "+email1+" and confirm your subscription");
              });

            }
          });

  }
  else
      {
          return res.send(email1+" is already subscribed to Lexo promotions");
      }
});

});
//update confirmed to true
router.put('/verifysubscription', function (req, res) {
  try {
    const {userId} = req.body
    console.log(userId)
      connection.query('UPDATE `subscribed_users` SET `confirmed`=? where `email`=?', [true, userId], function (error, results, fields) {
      if (error) {
        res.status(500).send({ message: error.message });
      }
      res.end(JSON.stringify(results));
      })
    }catch (err) {
      res.status(500).send({ message: err.message });
    }
  // myemail = res.app.get('myemail');
});

//send mail to all customers
router.post('/messcustomers', (req, res) => {
  var emails = 'SELECT email FROM subscribed_users WHERE confirmed = true';
  var to_list = []
  connection.query(emails, function(err, theemail, fields){
//console.log(email);
for(k in theemail){
    to_list.push(theemail[k].email)
  }
}); 
var mailOptions = {
  to: to_list,
  subject: req.body.subject,
  html: req.body.html
  };
  transporter.sendMail(mailOptions, function(error, info){
      if (error) {
      console.log(error);
      res.send('fail')
      } else {
      console.log('Email sent: ' + info.response);
      res.send('success')
      }
  });
})

// register sales
router.post('/newsale', function(req, res){
    // data for employees table
      const nDate = new Date().toLocaleString('en-US', {
      timeZone: 'Africa/Nairobi'
      });

        const seller = req.body.seller;
        const carNo = req.body.carNo;
        const no_of_ltrs = req.body.no_of_ltrs;
        const product = req.body.product;   
   
      // insert sale
        connection.query('INSERT INTO sales SET seller=?, carNo=?, no_of_ltrs=?, product=?, date_refilled=?',[seller, carNo, no_of_ltrs, product, nDate],function(err, results){
          try{  
            if (err) {
                res.status(500).send({ message: err.message });
              } else {
                res.send('Sale inserted');
                console.log(nDate)
              } 
          }catch (err) {
            res.status(500).send({ message: err.message });
          } 
            
        });
    });

    //get frequent customers
router.get('/fcustomers', function(req, res) {
  try {
    let sql = `SELECT carNo, 
    COUNT(*) carTotal
    FROM sales
    WHERE carNo IS NOT NULL
    GROUP BY carNo
    ORDER BY COUNT(*) DESC
    LIMIT 3`;
    connection.query(sql, function(err, data, fields) {
      if (err) {
        res.status(500).send({ message: err.message });
      } 
      res.json({
        status: 200,
        data
      })
    })
  } catch (err) {
    res.status(500).send({ message: err.message });
  } 
});


  // insert offer to database
router.post('/newoffer', upload.single("image"), async (req, res) => {
  try {
    const filename = req.file.filename;
    const offerdesc = req.body.offerdesc;
    
    // const {userId} = req.body
      connection.query('INSERT INTO offers SET imgdesc=?, offerdesc=?',[filename, offerdesc], function (error, results, fields) {
        if (error) {
          res.status(500).send({ message: error.message });
        }
      // res.end(JSON.stringify(results));
          res.status(200).send({
            message: `Offer added`
          });
      })
    }catch (error) {
      res.status(500).send({ message: error.message });
    } 
});

    //get all offers
    router.get('/theoffer', function(req, res) {
      try {
        let sql = "SELECT * FROM offers";
        connection.query(sql, function(err, data, fields) {
          if (err) {
            res.status(500).send({ message: err.message });
          }
          res.json({
            status: 200,
            data
          })
        })
      } catch (err) {
        res.status(500).send({ message: err.message });
      } 
    });

    //delete offer
router.delete('/deleteoffer/:imgdesc', (req, res, next)=>{
  const imgdesc = req.params.imgdesc
  if(!imgdesc){
    return res.send("No offer found")
  }
//  check if user already exist
  connection.query('SELECT * FROM offers WHERE imgdesc = ? ',  [imgdesc]
  ,function(err,rows){
  // if error in getting th list
  if(err) {      
    return res.send("Error in getting the offer");
  }
  // if no user exist
  if (!rows.length)
  {
    return res.send("Offer not found");
  }
  else
  {
    try {
      let sql = `DELETE FROM offers WHERE imgdesc=?`;
      connection.query(sql, imgdesc, function(err, data, fields) {
          if (err) {
            res.status(500).send({ message: err.message });
          }
          res.json({
            status: 200,
            data,
            message: "Offer deleted successfully"
          })
      })
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  }
  });
})

// update employees data
router.put('/updateemployee/:email', function(req, res){
  const email = req.params.email
  try {
    
      const firstname = req.body.firstname;
      const lastname = req.body.lastname;
      const salary = req.body.salary;
  
    // const {userId} = req.body
      connection.query('UPDATE `employees` SET `firstName`=?,`lastName`=?,`salary`=? where `email`=?', [firstname, lastname, salary, email], function (error, results, fields) {
        if (error) {
          res.status(500).send({ message: err.message });
        }
      // res.end(JSON.stringify(results));
          res.status(200).send({
            message: `Employees data updated`,
            results
          });
      })
    }catch (err) {
      res.status(500).send({ message: err.message });
    } 
});

// products apis
 // insert product to database
 router.post('/newproduct', upload.single("image"), async (req, res) => {
  try {
    const filename = req.file.filename;
    const productdesc = req.body.productdesc;
    const price = req.body.price;
    const pname = req.body.pname;
    
      //  check if product already exist
      connection.query('SELECT * FROM products WHERE pname = ? ',  [pname]
      ,function(err,rows){
      // if error in getting th list
      if(err) {      
        return res.send("Error in getting the products");
      }
      // if no user exist
      if (!rows.length)
      {
    // const {userId} = req.body
      connection.query('INSERT INTO products SET imgdesc=?, pname=?, productdesc=?, price=?',[filename, pname, productdesc, price], function (error, results, fields) {
        if (error) {
          res.status(500).send({ message: error.message });
        }
      // res.end(JSON.stringify(results));
          res.status(200).send({
            message: `Product added`
          });
      })
      }
  else{
        return res.status(400).send({ error: "Product already exist" });
      }
    })
}catch (error) {
      res.status(500).send({ message: error.message });
    } 
});

    //get all products
    router.get('/theproduct', function(req, res) {
      try {
        let sql = "SELECT * FROM products";
        connection.query(sql, function(err, data, fields) {
          if (err) {
            res.status(500).send({ message: err.message });
          }
          res.json({
            status: 200,
            data
          })
        })
      } catch (err) {
        res.status(500).send({ message: err.message });
      } 
    });

    //delete offer
router.delete('/deleteproduct/:imgdesc', (req, res, next)=>{
  const imgdesc = req.params.imgdesc
  if(!imgdesc){
    return res.send("No product found")
  }
//  check if user already exist
  connection.query('SELECT * FROM products WHERE imgdesc = ? ',  [imgdesc]
  ,function(err,rows){
  // if error in getting th list
  if(err) {      
    return res.send("Error in getting the product");
  }
  // if no user exist
  if (!rows.length)
  {
    return res.send("Product not found");
  }
  else
  {
    try {
      let sql = `DELETE FROM products WHERE imgdesc=?`;
      connection.query(sql, imgdesc, function(err, data, fields) {
          if (err) {
            res.status(500).send({ message: err.message });
          }
          res.json({
            status: 200,
            data,
            message: "Product deleted successfully"
          })
      })
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  }
  });
})

// update products
router.put('/updateproduct/:pname', function(req, res){
  const pname = req.params.pname
  try {
    
      const productdesc = req.body.productdesc;
      const price = req.body.price;
  
    // const {userId} = req.body
      connection.query('UPDATE `products` SET `productdesc`=?,`price`=? where `pname`=?', [productdesc, price, pname], function (error, results, fields) {
        if (error) {
          res.status(500).send({ message: err.message });
        }
      // res.end(JSON.stringify(results));
          res.status(200).send({
            message: `Products data updated`,
            results
          });
      })
    }catch (err) {
      res.status(500).send({ message: err.message });
    } 
});

    //get sales per employee
    router.get('/theitem/:email', function(req, res) {
      var email = req.params.email;
      try {
        connection.query("SELECT * FROM `sales` WHERE seller=?", [email], function(err, data, fields) {
          if (err) {
            res.status(500).send({ message: err.message });
          }
          res.json({
            status: 200,
            data
          })
        })
      } catch (err) {
        res.status(500).send({ message: err.message });
      } 
    });

    //get all sales
    router.get('/allitems', function(req, res) {
      try {
        connection.query("SELECT * FROM `sales`", function(err, data, fields) {
          if (err) {
            res.status(500).send({ message: err.message });
          }
          res.json({
            status: 200,
            data
          })
        })
      } catch (err) {
        res.status(500).send({ message: err.message });
      } 
    });

        //get average for all months
        router.get('/avgmonth', function(req, res) {
          try {
            let sql = "SELECT `date_refilled`, AVG(`no_of_ltrs`) FROM sales GROUP BY YEAR(`date_refilled`), MONTH(`date_refilled`) HAVING COUNT(`date_refilled`) = DAY(LAST_DAY(`date_refilled`));"
            
            connection.query(sql, function(err, data, fields) {
              if (err) {
                res.status(500).send({ message: err.message });
              }
              res.json({
                status: 200,
                data
              })
            })
          } catch (err) {
            res.status(500).send({ message: err.message });
          } 
        });
    


module.exports = router;