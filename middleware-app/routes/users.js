let express = require("express");
let router = express.Router();
let jwt = require("jsonwebtoken");
let { checkJWTToken, changePasswordVerification } = require("./middleware");
const uuidv4 = require("react-uuid");

//The below middleware has been taken from the HyperionDev exercise/manual. The first section of the middleware us for users and the second part is for the todo's

let userInformation = [
  {
    username: "admin@gmail.com",
    password: "P@ssw0rd1",
  },
];

//See if user is in db/userlist. If user exists token is generated.
router.post("/login", function (req, res) {
  const userLogin = req.body.username;
  const pwd = req.body.password;

  const userIndex = userInformation.findIndex(
    (index) => index.username == userLogin
  );

  if (userIndex > -1 && pwd == userInformation[userIndex].password) {
    let payload = {
      name: userLogin,
      password: pwd,
    };
    //I would have saved the JWT token in an env file, however for the purpose of this task I have kept it open.
    const token = jwt.sign(JSON.stringify(payload), "secretKey", {
      algorithm: "HS256",
    });
    res.send({
      token: token,
    });
  } else {
    res.status(403).send({
      err: "user not Authenticated.",
    });
  }
});

//adds user to db. If user does not end with @gmail.com 403 is send to user.
router.post("/register", (req, res) => {
  const userLogin = req.body.username;
  const pwd = req.body.password;
  let gmailCheck = userLogin.endsWith("@gmail.com");
  if (gmailCheck) {
    console.log(gmailCheck);

    let newUser = { username: userLogin, password: pwd, admin: false };

    userInformation.push(newUser);

    res.status(201).send("User added");
  } else {
  }
  res.status(403).send({ error: "Please use email that ends with @gmail.com" });
});

//The below is only used to test if a user is being added.
router.get("/pass", (req, res) => {
  res.json(userInformation);
});

//Kept the below in for exercise.
router.put(
  "/changePassword",
  checkJWTToken,
  changePasswordVerification,
  function (req, res) {
    userInformation.password = req.newUserpassword;
    res.send({
      message: "Password Successfully changed",
      newPassword: userInformation.password,
    });
  }
);

//The below is only used to test if a user is being added.
router.get("/pass", (req, res) => {
  res.json(userInformation);
});
//////////////////////////////////////////////////////////////////////////

let todos = [
  {
    username: "admin@test.co.za",
    id: 1,
    title: "Implement post route for logging in.",
    completed: true,
  },
  {
    username: "admin@test.co.za",
    id: 2,
    title: "Implement custom middleware to authenticate user..",
    completed: true,
  },
];

//View todos
router.get("/", checkJWTToken, function (req, res) {
  res.send(JSON.stringify(todos));
});

//View specific toDo
router.get("/:id", checkJWTToken, function (req, res) {
  try {
    const id = req.params.id;
    const todoIndex = todos.findIndex((index) => index.id == id);

    console.log(id);
    console.log(todoIndex);

    console.log(todos[todoIndex]);

    res.send(todos[todoIndex]);
  } catch (err) {
    res.status(403).send({
      err: "not found",
    });
  }
});

//Add todo
router.post("/add", checkJWTToken, (req, res) => {
  const username = req.body.username;
  const title = req.body.title;
  const completed = req.body.completed;
  try {
    console.log(req.body);

    let newItem = { username: username, title: title, completed: completed };
    console.log(newItem);

    todos.push({ ...newItem, id: uuidv4() });

    res.status(201).send("Item added");
  } catch (err) {
    console.log(err);
  }
});

//Edit todo
router.put("/update/:id", checkJWTToken, (req, res) => {
  try {
    const username = req.body.username;
    const title = req.body.title;
    const completed = req.body.completed;
    const id = req.params.id;

    const todoIndex = todos.findIndex((index) => index.id == id);
    //Identify where in the array the object exists
    //number
    console.log(todoIndex);

    //create newItem
    let newItem = {
      username: username,
      title: title,
      completed: completed,
      id: id,
    };
    todos[todoIndex] = newItem;
    res.send(todos);
  } catch (err) {
    res.status(403).send({
      err: "not found",
    });
  }
});

//del todo
//The below is only used to test if a user is being added.
router.delete("/delete/:id", checkJWTToken, (req, res) => {
  const id = req.params.id;

  const todoIndex = todos.findIndex((index) => index.id == id);
  console.log(todoIndex);

  todos = todos.filter((todo) => todo.id != id);

  res.send(todos);
});

module.exports = router;
