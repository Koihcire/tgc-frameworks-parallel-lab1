const express = require("express");
const router = express.Router();
const {createPosterForm, bootstrapField} = require("../forms")
//import the posters model
const {Poster} = require('../models')

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
            poster.set("width", forms.data.width);

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

module.exports = router;