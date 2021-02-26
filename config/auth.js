const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

// Model de usuario 

require("../models/User")
const User = mongoose.model("users")

module.exports = function(passport){

    passport.use(new localStrategy({usernameField: 'email'}, (email, password, done) => {
        User.findOne({email: email}).then((user) => {
           console.log(user)
            if(!user){
                return done(null, false, {message: "Usuario ou senha invalidos"})
            }
            bcrypt.compare(password, user.password, (error, equalPassword) =>{
                if(equalPassword){
                    return done(null, user)
                } else{
                    return done(null, false, {message: "Senha incorreta"})
                }
            })
        })
    }))

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })
    passport.deserializeUser((id, done) =>{
        User.findById(id, (err, user) =>{
            done(err, user)
        })
    })


}

