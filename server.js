const express = require("express");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { pool } = require("./pool/dbConnection");
const port = process.env.PORT || 3001;
const cors = require("cors");
const session = require("express-session");
const app = express();

//cors

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

//session
app.use(
  session({
    secret: process.env.SECRET || "sadfsdf@#$sdf23",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
  })
);

//middlewaere
app.use(express.json());

//1. GET which returns all users
app
  .route("/allusers")
  .get((req, res) => {
    pool.query("SELECT  * FROM users", (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  })

  //2. POST/ create a new user

  .post((req, res) => {
    const { first_name, email, password } = req.body;
    //לעשות ולידיציה
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) throw err;
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err;

        pool.query(
          "INSERT INTO users(first_name,email,password)VALUES(?,?,?)",
          [first_name, email, hash],
          (err, results, fields) => {
            if (err) {
              if (err.code === "ER_DUP_ENTRY") {
                return res
                  .status(500)
                  .json({ success: false, message: "Email already exist" });
              }
              return res.status(500).json({ success: false });
            }
            res.json({ success: true, user: results.insertId });
          }
        );
      });
    });
  });

//3. הזדהות  בעזרת מייל וסיסמא    post/login
app.route('/login').post((req, res) => {
  const { first_name, email, password } = req.body;

  pool.query(
    "SELECT id,first_name, password FROM users WHERE email=?",
    email,
    (err, results, fields) => {
      if (err) throw err;

      if (results.length) {
        //  console.log(results);
        const { id, password: hash } = results.pop();
        //console.log(hash,password);

        bcrypt.compare(password, hash, (err, isEqual) => {
          if (err) throw err;
          if (isEqual) {
            //אם המשתמש תקין
            req.session.id = id;
            res.json({ success: true, user: id });
          } else {
            res.sendStatus(401);
          }
        });
      } else {
        res.sendStatus(401);
      }
    }
  );
});



//  middlewere to catch errors
app.use((err, req, res, next) => {
  if (err) return res.sendStatus(500);
  next();
});

app.listen(port, () => console.log(`Server started on port ${port}`));
