const express = require("express");
const router = express.Router();
const {createPosterForm, bootstrapField} = require("../forms")
//import the posters model
const {Poster} = require('../models');
const { route } = require("./landing");

router.get("/", async (req,res)=>{
    let posters = await Poster.collection().fetch();

    res.render("posters/index" , {
        posters: posters.toJSON()
    })
})

router.get("/create", async(req,res)=>{
    const posterForm = createPosterForm();
    res.render("posters/create",{
        "form": posterForm.toHTML(bootstrapField)
    })
})

router.post("/create" , async(req,res)=>{
    const posterForm = createPosterForm();
    posterForm.handle(req,{
        "success": async (form)=>{
            const poster = new Poster();
            poster.set("title", form.data.title);
            poster.set("cost", form.data.cost);
            poster.set("description", form.data.description);
            poster.set("date", form.data.date);
            poster.set("stock", form.data.stock);
            poster.set("height", form.data.height);
            poster.set("width", form.data.width);

            await poster.save();
            res.redirect("/posters")
        },
        "error": (form)=>{
            res.render("posters/create", {
                form: form.toHTML(bootstrapField)
            })
        },
        "empty": (form)=>{
            
        }
    })
})

router.get ('/:poster_id/update', async (req,res)=>{
    //retrieve the poster
    const poster = await Poster.where({
        'id': req.params.poster_id
    }).fetch({
        require: true
    });

    const productForm = createPosterForm();

    //fill in the existing values
    productForm.fields.title.value = poster.get("title");
    productForm.fields.cost.value = poster.get("cost");
    productForm.fields.description.value = poster.get("description");
    productForm.fields.date.value = poster.get("date");
    productForm.fields.stock.value = poster.get("stock");
    productForm.fields.height.value = poster.get("height");
    productForm.fields.width.value = poster.get("width");

    res.render('posters/update', {
        form: productForm.toHTML(bootstrapField),
        product: poster.toJSON()
    })

})

module.exports = router;