## Lexo Backend
1. Download the Node.js pre-built installer for your platform from <br />
https://nodejs.org/en/download/ if not installed <br />

2. Open the backend folder from the command prompt <br />
```
cd backend-folder
```
3. Install the dependencies <br />
You need to install the dependencies <br />
```
npm install
```

4. Create .env file <br />
The .env file is created at the root folder backend. <br/>
The file should include the following details: <br />
```
PORT="port number"
SECRET="Secret key"
USER1="your email"
PASS1="password generated with app passwords"
```
The details should not be enclosed with the quotation marks <br />

5. Install XAMPP server <br />
https://www.apachefriends.org/download.html <br />

6. Import database to your <br />
http://localhost/phpmyadmin/ on your computer with the apache server and MySQL database started the file called 'thelexo' found in the files of this repository<br />

7. Run the backend </br >
```
npm start
```
