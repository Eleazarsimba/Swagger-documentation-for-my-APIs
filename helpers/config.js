const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    HOST: "localhost",
    USER: "root",
    PASSWORD: "",
    DB: "thelexo",
    'secret': process.env.SECRET,

    USERNAME: process.env.USER1,
    PASS: process.env.PASS1
  };