const express = require("express");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const path = require("path");
const redis = require("redis");

//create redis client
const client = redis.createClient();
client.on("connect", () => {
  console.log("connect to redis");
});

//init app
const app = express();

//bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//view engine
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//methosoverride
app.use(methodOverride("_method"));

// search a user
app.get("/", (req, res, next) => {
  //   res.render("searchusers");
  res.render("searchusers");
});

app.post("/user/search", (req, res, next) => {
  let id = req.body.id;
  client.hgetall(id, (err, obj) => {
    if (!obj) {
      res.render("searchusers", {
        error: "user doesnot exists",
      });
    } else {
      obj.id = id;
      res.render("details", {
        user: obj,
      });
    }
  });
});

// add user page
app.get("/user/add", (req, res, next) => {
  //   res.render("searchusers");
  res.render("adduser");
});

//process add user
app.post("/user/add", (req, res, next) => {
  let id = req.body.id;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let phone = req.body.phone;
  let email = req.body.email;

  client.hmset(
    id,
    [
      "first_name",
      first_name,
      "last_name",
      last_name,
      "email",
      email,
      "phone",
      phone,
    ],
    (err, reply) => {
      if (err) {
        console.log(err);
      } else {
        console.log(reply);
        res.redirect("/");
      }
    }
  );
});

app.delete("/user/delete/:id", (req, res) => {
  const id = req.params.id;
  client.del(id);
  res.redirect("/");
});

PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
  if (err) console.loog(err);
  console.log(`server started at ${PORT}`);
});
