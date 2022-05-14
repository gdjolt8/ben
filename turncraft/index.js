// This is the entry point for our whole application

const { response } = require("express");
const path = require("path");
var express = require("express");
const bodyParser = require('body-parser')
const { default: mongoose } = require("mongoose");
const User = require('./model/user')
const Database = require('./model/userdata')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'sd9j0asd208390147b32sd9a9d0ju!@#$%^&'
mongoose.connect('mongodb://localhost:27017/login-app-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const banned = []
const users = []
const messages = []
var app = express();

app.use('/', express.static(path.join(__dirname, 'static')))
app.use(express.json())


app.get("/user/:id", (req, res) => {
    

});

/* app.get("/catalog/:id/:name", (req, res) => {

    var itemData = {
        "item": req.params["id"],
        "itemname": req.params["name"],
        "price": Math.floor(Math.random() * 100),
        "forsale": true
    };

    res.json(itemData);

}); */

app.get("/chess", (req, res) => {

  var data = {
    "whosbad": "solomon should get better at chess"
  };
  res.send("Chess is a game stemmed on feudalism, yes history 101");
  
});

app.get("/users", (req, res) => {
  Database.find().lean().exec(function (err, users) {
    return res.json(users);
  })
});



app.post('/api/register', async (req, res) => {
  console.log(req.body)
  
  const { username, password: plainTextPassword } = req.body
  const length = User.length + 1;
  const coins = 0;
  
  if(!username || typeof username !== 'string') {
    return res.json({ status: 'error', error: 'Invalid username'})
  }

  if(username.includes("<") || username.includes("|") || username.includes("+") || username.includes("=") || username.includes("[") || username.includes("]") || username.includes("{") || username.includes("?") || username.includes(".") || username.includes(",") ||username.includes("!") || username.includes("@")) {
    return res.json({ status: 'error', error:'Username has invalid character'})
  }

  if(plainTextPassword.length < 5) {
    return res.json({
      status: 'error',
      error: 'Password too small. Should be at least 6 characters'
    })
  }
  const password = await bcrypt.hash(plainTextPassword, 10)
  const date = Date();
  try {
      const response = await User.create({
        username,
        password
      })
     console.log('User created!:' , response)
  } catch(error) {
      if(error.code === 11000){
        return res.json({ status: 'error', error: 'Username already in user'})
      }
      throw error
  }

  try {
    const response = await Database.create({
      username,
      coins,
      date
    })
   console.log('Database created!:' , response)
} catch(error) {
    if(error.code === 11000){
      return res.json({ status: 'error', error: 'Username already in user'})
    }
    throw error
}

  console.log(await bcrypt.hash(password, 10))
  res.json({ status: 'ok'})
})

app.post('/api/login', async(req, res) => {
    const { username, password } = req.body
    const user = await User.findOne({ username }).lean()

    if(!user) {
      return res.json({ status: 'error', error: 'Invalid username'})
    }

    if(await bcrypt.compare(password, user.password)) {

      const token = jwt.sign(
        {
          id: user._id,
          username: user.username
        },
        JWT_SECRET
        
      )
      return res.json({ status: 'ok', data: token})
    }

    res.json({ status: 'ok', data: 'COMING SOON' })
})

app.post('/banuser', (req, res) => {
  const user = users.find(user => user.name = req.body.banvictim)
  if (user == null) {
    return res.status(400).send("User does not exist")
  }
  try {
    banned.push(banvictim);
  } catch {
    res.status(500).send("Oops, the server had an OOPSIE!");
  }
})


app.get("/tou", (req, res) => {
  res.send('Turncraft is owned by gdjolt8.')
});

app.get("/messages", (req, res) => {
   res.json(messages);
});

app.post("/messages", async (req, res) => {
  try {
      const message = { name: req.body.name, message: req.body.message, time: Date()}
      messages.push(message)
      res.status(201).send()
  } catch {
      res.status(500).send()
  }
});



app.listen(process.env.PORT || 8000, () => {
  console.log("Server started!")
});