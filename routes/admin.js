const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');
require("../models/Categoria.js")
const Categoria = mongoose.model('categorias');
require("../models/Posts.js")
const Post = mongoose.model('posts')
const {eAdmin} = require("../helpers/eAdmin")

router.get('/' , eAdmin,(req,res) =>{
    res.redirect("index")
})

router.get('/categorias', eAdmin, (req, res) => {
        Categoria.find().lean().sort({data: 'desc'}).then((categorias) => {
        res.render("admin/categorias", {categorias: categorias})
       
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias" + err)
        res.redirect("/admin")
    })
})
router.get('/categorias/add', eAdmin, (req, res) => {
    res.render('admin/addcategoria')
})
router.post('/categorias/nova', eAdmin, (req, res) => {
   
    var erros = []

    if(!req.body.nome || req.body.nome == undefined){
        erros.push({texto: "Nome inválido"})
    }
    if(!req.body.slug || req.body.slug == undefined){
        erros.push({texto: "Slug inválido"})
    }
    if(req.body.nome.lenght < 2 ){
        erros.push({texto:"Nome da categoria muito pequeno"})
    }
    if(erros.lenght >= 0 ){
        erros.find().lean().then((erros) => {
            res.render("admin/categorias", {erros:erros})
        })
    }
    //console.log(erros)

    const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug,
    }
    new Categoria(novaCategoria).save().then(() => {
        console.log("Categoria criada com sucesso")
    }).catch((erro) => {
        console.log("A categoria não foi cadastrada erro: " +erro)
    })
})

router.get("/categorias/edit/:id", eAdmin,(req,res) => {
    Categoria.findOne({_id:req.params.id}).lean().then((categoria) => {
        res.render("admin/editcategorias", {categoria: categoria})
        console.log(categoria)
    }).catch((err) =>{
        req.flash("error_msg", "Esta categoria não existe")
    })
    
})

router.post("/categorias/edit", eAdmin,(req,res) => {
    Categoria.findOne({_id: req.body.id}).then((categoria) => {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() =>{
            req.flash("success_msg","Categoria editada com sucesso !")
            res.redirect("/admin/categorias")
        }).catch( (err) =>{
            req.flash("error_msg", " Houve um erro ao editar a categoria ")
            res.redirect("/admin/categorias")
        })
    }).catch((err) =>{
        req.flash("error_msg", " Houve um erro ao editar a categoria ")
        res.redirect("/admin/categorias")
    })

})
router.post("/categoria/delete", eAdmin, (req,res) => {
    Categoria.remove({_id: req.body.id}).then((categoria) => {
        req.flash("success_msg", "Categoria excluida com sucesso !")
        res.redirect("/admin/categorias")
    }).catch((erro) =>{
        req.flash("error_msg", " Não foi possivel excluir a categoria ")
        res.redirect("/admin/categorias")
    })
})

router.get("/posts", eAdmin, (req, res) =>{
    Post.find().lean().populate("category").sort({data: "desc"}).then((posts) =>{
        res.render("admin/post", {posts: posts})
       
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        res.redirect("/admin/post")
    })
})

router.get("/posts/add", eAdmin, (req,res) => {
    Categoria.find().lean(true).then((categorias) => {
        res.render("admin/addposts",{categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário")
        res.redirect("/admin")
    })
    
})

router.post("/posts/new", eAdmin, (req,res) => {

    var erros = []

    if(req.body.categoria == "0"){
        erros.push({text: "Categoria inválida, registre uma categoria"})
    }
    if(erros.length > 0){
        res.render("admin/addpostagem", {erros:erros })
    }else{
        const novaPostagem = {
            title: req.body.title,
            description: req.body.description,
            content: req.body.content,
            category: req.body.category,
            slug: req.body.slug
        }
        new Post(novaPostagem).save().then( () =>{
            req.flash("success_msg", "Postagem criada com sucesso")
            res.redirect("/admin/posts")
        }).catch((erro) => {
            req.flash("error_msg", "Não foi possivel criar a postagem")
            res.redirect("admin/posts")
        })
    }
})
router.get("/posts/edit/:id", eAdmin, (req, res) => {
    Post.findOne({_id: req.params.id}).lean().then((posts) => {
        Categoria.find().lean().then((categorias) => {
            res.render("admin/editposts", {categorias: categorias, posts:posts})
        }).catch((erro) =>{
            res.flash("error_msg", "Houve um erro")
            res.redirect("admin/posts")
        })
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao alterar a postagem")
        res.redirect("/admin/postagens")
    })
})

router.post("/posts/edit", eAdmin, (req, res) => {
    Post.findOne({_id: req.body.id}).then((posts) =>{

        posts.title = req.body.title
        posts.description = req.body.description
        posts.slug = req.body.slug
        posts.content = req.body.content
        posts.catery = req.body.category
        

        posts.save().then(()=>{
            req.flash("success_msg", "Postagem editada com sucesso")
            res.redirect("/admin/posts")
        }).then((err) =>{
            req.flash("error_msg","Erro interno")
            res.redirect("/admin/posts")
        })
    }).catch((erro) =>{
        req.flash("error_msg", "Houve um erro ao salvar a edição")
        res.redirect("/admin/posts")
    })
})
router.get("/posts/delete/:id", eAdmin, (req,res) =>{
    Post.remove({_id: req.params.id}).then(() =>{
        req.flash("success_msg", "postagem deletada com sucesso" )
        res.redirect("/admin/posts")
    }).catch((erro) =>{
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/admin/posts")
    })
})

module.exports = router