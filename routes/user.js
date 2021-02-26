const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/User')
const User = mongoose.model('users')
const bcrypt = require("bcryptjs")
const { userInfo } = require('os')
const passport = require("passport")

router.get('/registro' ,(req,res) =>{
    res.render("user/register")
})

router.post('/registro', (req, res) =>{
   var erros = []
   
   if(!req.body.name || typeof req.body.name === undefined || req.body.name === null){
        erros.push({text: "Nome invalido."})
   }
   if(!req.body.email || typeof req.body.email === undefined|| req.body.email === null){
        erros.push({text: "Email invalido."})
   }       
   if(req.body.senha.length < 4){
        erros.push({text: "Senha muito curta"})
   }
   if(req.body.senha != req.body.senha2){
    erros.push({text: "As senhas são diferentes, tente novamente! "})
    }
    if(erros.length > 0){
        res.render("user/register", {erros:erros })
    }else{
         User.findOne({ email: req.body.email}).then((user) =>{
              if(user){
                   req.flash("error_msg", "Este email ja esta em uso por outra conta!!")
                   res.redirect("/user/registro")
              }else{
                    const newUser = new User({
                         name: req.body.name,
                         email: req.body.email,
                         password: req.body.senha,
                    })
                    
                    bcrypt.genSalt(10 ,(erro, salt) => {
                         bcrypt.hash( newUser.password, salt, (erro, hash) =>{
                              if(erro){
                                   req.flash("error_msg", "Houve um erro durante o salvamento do usuario")
                                   res.redirect("/")
                              }
                              
                              newUser.password= hash;

                              newUser.save().then(() => {
                                   req.flash("success_msg", "Usuario criado com sucesso !" )
                                   res.redirect("/")
                              }).catch((err) => {
                                   req.flash("error_msg", "Erro ao criar o usuario !")
                                   res.redirect("/")
                              })
                         })
                    })
               }
          })
     }

})
router.get("/login", (req,res) =>{
     res.render("user/login")
})

router.post("/login", (req, res, next) =>{
     passport.authenticate("local", {
          successRedirect: "/",
          failureRedirect: "/user/login",
          failureFlash: true
     })(req, res, next)
})

module.exports=router