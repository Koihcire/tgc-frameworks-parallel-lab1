const express = require("express");
const router = express.Router();
const { createPosterForm, bootstrapField, createSearchForm } = require("../forms")
//import the posters model
const { Poster, MediaProperty, Tag } = require('../models');
const { route } = require("./landing");
const { checkIfAuthenticated } = require('../middlewares')

router.get("/", async (req, res) => {
    //read in all the media properties
    const allMediaProperties = await MediaProperty.fetchAll().map((mediaProperty) => {
        return [mediaProperty.get('id'), mediaProperty.get('name')]
    })
    allMediaProperties.unshift([0, "----"]);

    //read in all the tags
    const allTags = await Tag.fetchAll().map(tag =>
        [tag.get('id'), tag.get('name')]
    );

    //create search form
    let searchForm = createSearchForm(allMediaProperties, allTags);
    let query = Poster.collection();
    searchForm.handle(req, {
        'success': async function (form) {
            if (form.data.title){
                query.where('title', 'like', '%' + form.data.title + '%')
            };
            if(form.data.min_cost){
                query.where('cost', '>=', form.data.min_cost)
            };
            if(form.data.max_cost){
                query.where('cost', '<=', form.data.max_cost)
            };
            if (form.data.mediaProperty_id && form.data.mediaProperty_id != '0'){
                query.where('mediaProperty_id', '=', form.data.mediaProperty_id )
            };
            if(form.data.tags){
                //first argument: sql clause
                //second argument: which table
                //third: one of the keys
                //fourth: the key to joiin with
                query.query('join', 'posters_tags', 'posters.id', 'poster_id' )
                .where ('tag_id' , 'in', form.data.tags.split(','))
            }


            let posters = await query.fetch({
                withRelated: ['mediaProperty', 'tags']
            });

            res.render("posters/index", {
                posters: posters.toJSON(),
                form: searchForm.toHTML(bootstrapField)
            })
        },
        'error': async function (form) {
            let posters = await query.fetch({
                withRelated: ['mediaProperty', 'tags']
            });

            res.render("posters/index", {
                posters: posters.toJSON(),
                form: searchForm.toHTML(bootstrapField)
            })
        },
        'empty': async function (form) {
            let posters = await query.fetch({
                withRelated: ['mediaProperty', 'tags']
            });

            res.render("posters/index", {
                posters: posters.toJSON(),
                form: searchForm.toHTML(bootstrapField)
            })
        }
    })
})

router.get("/create", checkIfAuthenticated, async (req, res) => {
    //read in all the media properties
    const allMediaProperties = await MediaProperty.fetchAll().map((mediaProperty) => {
        return [mediaProperty.get('id'), mediaProperty.get('name')]
    })

    //read in all the tags
    const allTags = await Tag.fetchAll().map(tag =>
        [tag.get('id'), tag.get('name')]
    );
    // console.log(allTags)

    const posterForm = createPosterForm(allMediaProperties, allTags);
    res.render("posters/create", {
        "form": posterForm.toHTML(bootstrapField),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

router.post("/create", checkIfAuthenticated, async (req, res) => {
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

            req.flash('success_messages', `New Poster ${poster.get('name')} has been created`)
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

router.get('/:poster_id/update', checkIfAuthenticated, async (req, res) => {

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
    //read in the image url
    posterForm.fields.image_url.value = poster.get('image_url');

    let selectedTags = await poster.related('tags').pluck('id');
    posterForm.fields.tags.value = selectedTags

    res.render('posters/update', {
        form: posterForm.toHTML(bootstrapField),
        poster: poster.toJSON(),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

router.post('/:poster_id/update', checkIfAuthenticated, async (req, res) => {

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

router.get('/:poster_id/delete', checkIfAuthenticated, async (req, res) => {
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

router.post('/:poster_id/delete', checkIfAuthenticated, async (req, res) => {
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