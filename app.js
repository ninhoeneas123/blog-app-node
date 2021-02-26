const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express()
const admin = require('./routes/admin.js')
const path = require('path')
const session = require('express-session')
const flash = require("connect-flash")
const sequelize = require('sequelize')
require("./models/Posts")
const Post =  mongoose.model("posts")
require("./models/Categoria")
const Categoria = mongoose.model("categorias")
const users = require('./routes/user.js')
const passport = require('passport')
require("./config/auth")(passport)

// Configurações
    //Template engine
        app.engine('handlebars', handlebars({defaultLayout:'main'}))
        app.set('view engine', 'handlebars')
    //Sesion
        app.use(session({
            secret:"curso node",  
            resave: true,
            saveUninitialized:true
        }))
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    //Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null;
            next()

        })
    // Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    // Handlebars
        app.engine('handlebars', handlebars({defaultLayout:'main'}))    
        app.set('view engine','handlebars');
    // Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://localhost/blogapp").then(() => {
            console.log("conect for Mongo")}).catch( (erro)=>{
                console.log("Ouve um erro "+erro )
            })
    // Public 
        app.use(express.static(path.join(__dirname, "public")))    
// Rotas 
    app.get('/',(req,res) =>{
        Post.find().lean().populate("categoria").sort({data: "desc"}).then((posts) => {
            res.render("index",{posts: posts})
            console.log(posts)
        }).catch((err) =>{
            res.redirect("/404")
        })
    })
    app.get("/404", (req,res) =>{
        res.send("/404")
    })
    app.get('/posts/:slug', (req,res) =>{
        Post.findOne({slug: req.params.slug}).lean().then((postagem) =>{
            if(postagem){
                res.render("posts/index", {postagem: postagem})
            }else{
                req.flash("error_msg","Essa postagem não existe")
                res.resdirect("/")
            }
        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
        
    })

    app.get("/categorias", (req, res) =>{
        Categoria.find().lean().then((categorias) => {
            res.render("categorias/index",{categorias: categorias})
        }).catch((erro) =>{
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    })

    app.get("/categorias/:slug", (req, res) =>{
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) =>{
            console.log(categoria)
            if(categoria){
                Post.find({categoria: Categoria._id}).lean().then((posts) => {
                    res.render("categorias/postagens", {postagem: posts, categorias: categoria})
                }).catch((err) =>{
                    req.flash("error_msg", "Houve um erro ao listar")
                    res.redirect("/")
                })
            }else{
                req.flash("error_msg", "Esta categoria não existe")
                res.redirec("/")
            }    
        }).catch((err) =>{
            req.flash("error_msg", "houve um erro interno")
            res.redirect("/")
        })
    })

    app.use('/user', users)
    app.use('/admin', admin)

// Outros
const PORT = process.env.PORT || 8081
app.listen(PORT, () => {
    console.log(" Servidor rodando! ")
})