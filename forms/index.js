// import in caolan forms
const forms = require("forms");
// create some shortcuts
const fields = forms.fields;
const widgets = forms.widgets;
const validators = forms.validators;

const bootstrapField = function (name, object) {
    if (!Array.isArray(object.widget.classes)) { object.widget.classes = []; }

    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }

    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';

    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group">' + label + widget + error + '</div>';
};

const createPosterForm = (mediaProperties, tags)=>{
    let curDate = new Date();
    return forms.create({
        "title": fields.string({
            required: true,
            errorAfterField: true,
        }),
        "cost": fields.string({
            required: true,
            errorAfterField: true,
            validators: [validators.integer(), validators.min(0)]
        }),
        "description" : fields.string({
            required: true,
            errorAfterField: true,
        }),
        "date": fields.date({
            required: true,
            errorAfterField: true,
            widget: widgets.date(),
            // validators: [validators.max(curDate)]
        }),
        "stock": fields.number({
            required: true,
            errorAfterField: true
        }),
        "height": fields.string({
            required: false,
            errorAfterField: false,
            validators: [validators.integer(), validators.min(0)],
        }),
        "width": fields.string({
            required: false,
            errorAfterField: false,
            validators: [validators.integer(), validators.min(0)],
        }),
        "media_property_id": fields.string({
            label: "Media Property",
            required: true,
            errorAfterField: true,
            widget: widgets.select(),
            choices: mediaProperties
        }),
        'tags': fields.string({
            required: true,
            errorAfterField: true,
            widget: widgets.multipleSelect(),
            choices: tags
        }),
        'image_url': fields.string({
            widget: widgets.hidden()
        }),
        'thumbnail_url': fields.string({
            widget: widgets.hidden()
        })
    })
}

const createRegistrationForm = () => {
    return forms.create({
        'username': fields.string({
            required: true,
            errorAfterField: true
        }),
        'email': fields.string({
            required: true,
            errorAfterField: true
        }),
        'password': fields.string({
            required: true,
            errorAfterField: true
        }),
        'confirm_password': fields.string({
            required: true,
            errorAfterField: true,
            validators: [validators.matchField('password')]
        })
    })
}

const createLoginForm=()=>{
    return forms.create({
        'email': fields.string({
            required: true,
            errorAfterField: true
        }),
        'password': fields.password({
            required: true,
            errorAfterField: true
        })
    })
}

const createSearchForm = (mediaProperties, tags)=>{
    return forms.create({
        'title': fields.string({
            required: false,
            errorAfterField: true
        }),
        'min_cost': fields.string({
            required: false,
            errorAfterField: true,
            validators: [validators.integer()]
        }),
        'max_cost': fields.string({
            required: false,
            errorAfterField: true,
            validators: [validators.integer()]
        }),
        'mediaProperty_id': fields.string({
            label: "Media Property",
            required: false,
            errorAfterField: true,
            widget: widgets.select(),
            choices: mediaProperties
        }),
        'tags': fields.string({
            required: false,
            errorAfterField: true,
            widget: widgets.multipleSelect(),
            choices: tags
        })
    })
}


module.exports = {createPosterForm, bootstrapField, createRegistrationForm, createLoginForm, createSearchForm}