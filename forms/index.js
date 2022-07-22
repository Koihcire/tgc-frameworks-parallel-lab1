// import in caolan forms
const forms = require("forms");
// create some shortcuts
const fields = forms.fields;
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

const createPosterForm = ()=>{
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
            validators: [validators.max(curDate)]
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
        })
    })
}
module.exports = {createPosterForm, bootstrapField}