const express = require("express");
const router = express.Router();
const { createPosterForm, bootstrapField } = require("../forms")
//import the posters model
const { Poster, MediaProperty, Tag } = require('../models');
const { route } = require("./landing");

router.get("/", async (req, res) => {
    let posters = await Poster.collection().fetch({
        withRelated: ['mediaProperty', 'tags']
    });

    res.render("posters/index", {
        posters: posters.toJSON()
    })
})

router.get("/create", async (req, res) => {
    //read in all the media properties
    const allMediaProperties = await MediaProperty.fetchAll().map((mediaProperty) => {
        return [mediaProperty.get('id'), mediaProperty.get('name')]
    })

    //read in all the tags
    const allTags = await Tag.fetchAll().map(tag =>
        [tag.get('id'), tag.get('name')]
    );
    console.log(allTags)

    const posterForm = createPosterForm(allMediaProperties, allTags);
    res.render("posters/create", {
        "form": posterForm.toHTML(bootstrapField)
    })
})

router.post("/create", async (req, res) => {
    //read in all the media properties
    const allMediaProperties = await MediaProperty.fetchAll().map((mediaProperty) => {
        return [mediaProperty.get('id'), mediaProperty.get('name')]
    })

    const posterForm = createPosterForm(allMediaProperties);
    posterForm.handle(req, {
        "success": async (form) => {
            //separate the tags from the rest of the form data
            let { tags, ...posterData } = form.data;
            const poster = new Poster(posterData);
            await poster.save();

            //save the mm relationship
            if (tags) {
                await poster.tags().attach(tags.split(','));
            }

            // const poster = new Poster(form.data);
            // poster.set("title", form.data.title);
            // poster.set("cost", form.data.cost);
            // poster.set("description", form.data.description);
            // poster.set("date", form.data.date);
            // poster.set("stock", form.data.stock);
            // poster.set("height", form.data.height);
            // poster.set("width", form.data.width);


            res.redirect("/posters")
        },
        "error": (form) => {
            res.render("posters/create", {
                form: form.toHTML(bootstrapField)
            })
        },
        "empty": (form) => {

        }
    })
})

router.get('/:poster_id/update', async (req, res) => {

    //retrieve the poster
    const poster = await Poster.where({
        'id': req.params.poster_id
    }).fetch({
        require: true,
        withRelated: ['tags']
    });

    //read in all the media properties
    const allMediaProperties = await MediaProperty.fetchAll().map((mediaProperty) => {
        return [mediaProperty.get('id'), mediaProperty.get('name')]
    })

    ///read in all the tags
    const allTags = await Tag.fetchAll().map(tag =>
        [tag.get('id'), tag.get('name')]
    );

    const posterForm = createPosterForm(allMediaProperties, allTags);

    //fill in the existing values
    posterForm.fields.title.value = poster.get("title");
    posterForm.fields.cost.value = poster.get("cost");
    posterForm.fields.description.value = poster.get("description");
    posterForm.fields.date.value = poster.get("date");
    posterForm.fields.stock.value = poster.get("stock");
    posterForm.fields.height.value = poster.get("height");
    posterForm.fields.width.value = poster.get("width");
    posterForm.fields.mediaProperty_id.value = poster.get("mediaProperty_id");

    let selectedTags = await poster.related('tags').pluck('id');
    posterForm.fields.tags.value = selectedTags

    res.render('posters/update', {
        form: posterForm.toHTML(bootstrapField),
        poster: poster.toJSON()
    })
})

router.post('/:poster_id/update', async (req, res) => {

    //retrieve the poster
    const poster = await Poster.where({
        'id': req.params.poster_id
    }).fetch({
        require: true,
        withRelated: ['tags']
    });

    const posterForm = createPosterForm();
    posterForm.handle(req, {
        'success': async (form) => {

            let { tags, ...posterData } = form.data;

            poster.set(posterData);
            await poster.save();

            let tagsIds = tags.split(',');
            let existingTagIds = await poster.related('tags').pluck('id');

            //remove all tags that arent selected
            let toRemove = existingTagIds.filter(id => tagsIds.includes(id) === false);
            await poster.tags().detach(toRemove);

            //add in all the tags selected in the form
            await poster.tags().attach(tagsIds);

            res.redirect('/posters');
        },
        'error': async (form) => {
            res.render('posters/update', {
                'form': form.toHTML(bootstrapField),
                'poster': poster.toJSON()
            })
        },
        'empty': async function (form) {
            res.render('posters/update', {
                'form': form.toHTML(bootstrapField),
                'poster': poster.toJSON()
            })
        }
    })
})

router.get('/:poster_id/delete', async (req, res) => {
    //retrieve the poster
    const poster = await Poster.where({
        'id': req.params.poster_id
    }).fetch({
        require: true
    });

    res.render('posters/delete', {
        poster: poster.toJSON()
    })
})

router.post('/:poster_id/delete', async (req, res) => {
    //retrieve the poster
    const poster = await Poster.where({
        'id': req.params.poster_id
    }).fetch({
        require: true
    });

    await poster.destroy();
    res.redirect('/posters')
})

module.exports = router;