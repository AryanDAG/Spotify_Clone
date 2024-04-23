// npm init : package.json -- This is a node project.
// npm i express : expressJs package install hogya. -- project came to know that we are using express
// We finally use express


const express = require("express");
const mongoose = require("mongoose");
const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const passport = require("passport");
const User = require("./models/User");
const authRoutes = require("./routes/auth");
const songRoutes = require("./routes/song");
const playlistRoutes = require("./routes/playlist");
const app = express(); 
require("dotenv").config();
const port = 8080;

app.use(express.json());


// console.log(process.env);

// connect mongodb to our node app
// mongoose.connect() takes 2 arguments : 1.Which db to connect to (db url), 2. Connection Options
mongoose.connect("mongodb+srv://AryanGupta:" +  
       process.env.MONGO_PASSWORD + 
       "@cluster0.a8ocnkx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", 
         {
            useNewUrlParser: true,
            useUnifiedTopology: true,
         }
       )
       .then((x) => {
        console.log("Connected to Mongo!");
       })
       .catch((err) => {
        console.log("Error while connecting to Mongo");
       });
 

// Setup Passport-jwt
let opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "thisKeyIsSupposedToBeSecret";
passport.use(new JwtStrategy(opts, async function(jwt_payload, done) {
    console.log(jwt_payload)
    try {
        const user = await User.findOne({id: jwt_payload.sub});
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
            // or you could create a new account
        }
    } catch (err) {
        return done(err, false);
    }
}));

// API : GET type : / : return text "Hello World"
app.get("/", (req,res) => {
    // req contains all data for the request
    // res contains all data for the response
   res.send("Hello World");
});

app.use("/auth", authRoutes);
app.use("/song", songRoutes);
app.use("/playlist", playlistRoutes);

// Now we want to tell express that our server will run on localhost:8000
app.listen(port, () => {
    console.log("App is running on port" + port);
})
