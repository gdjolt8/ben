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
const e = 'mongodb+srv://trvlert:RrhE5a553UMc0LIC@turncraft.4bigr.mongodb.net/test'
mongoose.connect(e, {
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

app.post('/api/change-password', async (req, res) => {
	const { token, newpassword: plainTextPassword } = req.body

	if (!plainTextPassword || typeof plainTextPassword !== 'string') {
		return res.json({ status: 'error', error: 'Invalid password' })
	}

	if (plainTextPassword.length < 5) {
		return res.json({
			status: 'error',
			error: 'Password too small. Should be atleast 6 characters'
		})
	}

	try {
		const user = jwt.verify(token, JWT_SECRET)

		const _id = user.id

		const password = await bcrypt.hash(plainTextPassword, 10)

		await User.updateOne(
			{ _id },
			{
				$set: { password }
			}
		)
		res.json({ status: 'ok' })
	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: ';))' })
	}
})





app.post('/api/register', async (req, res) => {
  console.log(req.body)
  
  const { username, password: plainTextPassword } = req.body
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
    const length = Database.length + 1;
    const response = await Database.create({
      username,
      coins,
      date,
      admin: false,
      banned: false,
      id: length
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

app.post('/api/banuser', async (req, res) => {
  
  const { user1, user2 } = req.body
  const first = await Database.findOne({username: user1 }).lean().exec()
  const second = await Database.findOne({username: user2 }).lean().exec()
  /* user1 is who decided
  user2 is who will get BANNED */

  if(!first || !second) {
    return res.json({ status: 'error', error: "One of those accounts don't exist"})
  }

  if(first.admin == false) {
    return res.json({ status: 'error', error:  first.admin + " " + second.admin + " " + ' Inflictor is NOT an admin!'})
  }

  if(second.banned == true) {
    return res.json({ status: 'error', error: 'The user is already banned.'})
  }

  try {
      const _id = user2.id
      const banned = true

      await Database.updateOne( 
        {id: _id },
         {banned: banned } 
        )
      return res.json({ status:'ok', data: second.username + ' was banned!'})
  } catch (error) {
     if(error.code === 11000) {
       return res.json({ status: 'error', error: 'Something went wrong.'})
     }
     throw error
  }

  



})

app.post('/api/moderator', async (req, res) => {
  const { newmod } = req.body
  const admin = true
  try {
       
      const user = jwt.verify()

      await Database.updateOne(
        {user},
        {
          $set: { admin }
        }
      )


  } catch (error) {

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
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy

      const message = { name: req.body.name, message: req.body.message, time: today}
      messages.push(message)
      res.status(201).send()
  } catch {
      res.status(500).send()
  }
});



app.listen(process.env.PORT || 8000, () => {
  console.log("Server started!")
});
