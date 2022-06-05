// This is the entry point for our whole application

const { response } = require("express");
const path = require("path");
var express = require("express");
const bodyParser = require('body-parser')
const { default: mongoose } = require("mongoose");
const User = require('./model/user')
const Database = require('./model/userdata')
const Messages = require('./model/forum')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Levels = require('./model/levels');
const { kill } = require("process");
var mail = require("nodemailer");
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
  res.send(`You have looked for ${req.params["id"]}`);
});


app.get("/chess", (req, res) => {

  res.send("why the hell would you want to know about chess");
  
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

app.post('/api/postlevel', async (req, res) => {
   const lvlName = "";
   const allocatedID = 0;
   Levels.find().lean().exec(function (err, levels) {
    allocatedID = levels.length + 1;
  })
   
   if(req.body.name == "") {
     lvlName = "My Level";
   }
   try {
    const resu = await Levels.create({
        username: req.body.username,
        level: req.body.level,
        description: req.body.description,
        likes: 0,
        name: lvlName,
        id: allocatedID
    })
    return res.send(allocatedID);
  } catch(error) {
    if(error.code == 11000) {
      return res.send("-1");
    }
  }

})

app.post('/api/likelevel', async (req, res) => {
  const { username, levelid, type} = req.body
  if(type != 1 || -1) {
    return res.send("-1");
  }
  
  try {
    await Levels.updateOne(
      { levelid: levelid },
      {likes: 1}
      )
      return res.send("1")
  } catch(error) {
    return res.send("-1");
  }
})


app.post('/api/register', async (req, res) => {
  console.log(req.body)
  
  const { username, password: plainTextPassword, email } = req.body
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
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  var id = 0;
  Database.find().lean().exec(function (err, sers) {
    id = sers.length;
  })
  today = mm + '/' + dd + '/' + yyyy 
  const date = today;
  try {
      const response = await User.create({
        username,
        password
      })
     console.log('User created!:' , response)
     sendEmail(email);
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
      date,
      admin: false,
      banned: false,
      userid: id
    })
   console.log(id)
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
  const first = await Database.findOne({username: user1 })
  const second = await Database.findOne({username: user2 })
  /* user1 is who decided
  user2 is who will get BANNED */

  try {
      await Database.updateOne( 
        {username: second.username},
        {banned: true} 
      )
      return res.json({ status:'ok', data: second.username + ' was banned!'})
  } catch (error) {
     console.log(error)
    res.status(200).json({status: 'error', error: '-1'})
  }

  



})

app.post('/api/moderator', async (req, res) => {
  const { username } = req.body
  console.log(username)

  console.log("Mod alert")
  try {
    await Database.updateOne(
      {username: username}, 
      {admin: true}
    )
    res.json({status: 'ok'})
  } catch(error) {
    console.log(error)
    
    res.status(200).json({status: 'error', error: '-1'})
  }
  
  console.log("End")
  
})

function sendEmail(email){
  var transporter = mail.createTransport({
    service: 'gmail',
    auth: {
      user: 'worldwar2sim@gmail.com',
      pass: 'fvwdsjpxafwdgrxc'
    }
  });
  
  var mailOptions = {
    from: 'worldwar2sim@gmail.com',
    to: String(email),
    subject: 'Welcome to Turncraft!',
    html: '<h4>Welcome to the world of Turncraft! We are sending you this message because it looks like you signed up.</h4><br><p>Please contact us if this was not you.</p> '
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

app.get("/tou", (req, res) => {
  res.send('Turncraft is owned by gdjolt8.')
});

app.get("/messages", (req, res) => {
  Messages.find().lean().exec(function (err, forum) {
    return res.json(forum);
  })
});

app.post("/api/messages", async (req, res) => {
  var today = new Date();
  var time = String(today.getUTCHours()).padStart(2,'0') + ":" + String(today.getUTCMinutes()).padStart(2,'0');+ ":" + String(today.getSeconds()).padStart(2,'0');
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();

  today = mm + '/' + dd + '/' + yyyy + ' ' + time

  

  const { username, message } = req.body

  try {
    const Message = await Messages.create({
      username,
      message,
      date: today,
      likes: 0
    })
  } catch(error) {
      res.status(500).send()
      throw error
    }
    
});

app.post('/api/sendFriendRequest', async(req, res) => {
  const userToFriend = req.body.targetUser;
  const userWhoWants = req.body.user;

  const UserDat =  Database.findOne({ username: userToFriend})
  UserDat.friendrequests.push(String(userToFriend))
  UserDat.save()
})

app.post('/api/acceptFriendRequest', async(req, res) => {
  const userToFriend = req.body.targetUser;
  const userWhoGotAccepted = req.body.user;

  const UserDat1 = Database.findOne({ username: userToFriend })
  const UserDat2 = Database.findOne({ username: userWhoGotAccepted})
  
  UserDat1.friendrequests.splice(UserDat1.friendrequests.indexOf(String(userToFriend)), 1)

  UserDat1.friends.push(String(userToFriend))
  UserDat2.friends.push(String(userToFriend))
})

app.post('/api/removeFriendRequest', async(req, res) => {
  const userToFriend = req.body.targetUser;
  const userWhoGotAccepted = req.body.user;

  const UserDat1 = Database.findOne({ username: userToFriend })
  const UserDat2 = Database.findOne({ username: userWhoGotAccepted})
  
  UserDat1.friendrequests.splice(UserDat1.friendrequests.indexOf(String(userToFriend)), 1)

})

app.post('/api/getFriendRequests', async(req, res) => {
  const userToSee = req.body.user
  const UserDat = Database.findOne({ username: userToSee})
  if(!user) return res.sendStatus(400)
  return res.json(UserDat.friends)
})

app.listen(process.env.PORT || 8000, () => {
  console.log("Server started!")
});

