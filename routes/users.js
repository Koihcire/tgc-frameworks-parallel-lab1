const express = require ('express');
const router = express.Router();
const crypto = require('crypto');

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

//import in the user model
const {User} = require ('../models');

const {createRegistrationForm, createLoginForm, bootstrapField} = require('../forms');

router.get('/register', (req,res)=>{
    //display the registration form
    const registerForm = createRegistrationForm();

    //RENDER ALWAYS CALLS FROM VIEWS THEREFORE DONT HAVE FRONT SLASH
    res.render('users/register', {
        form: registerForm.toHTML(bootstrapField)
    })
})

router.post('/register', (req,res)=>{
    const registerForm = createRegistrationForm();
    registerForm.handle(req, {
        'success': async (form)=>{
            const user = new User({
                'username': form.data.username,
                'password': getHashedPassword(form.data.password),
                'email': form.data.email
            });

            await user.save();
            req.flash('success_messages', "User signed up successfully");
            res.redirect('/users/login')
        },
        'error': (form)=>{
            res.render('users/register', {
                form: form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/login', (req,res)=>{
    const loginForm = createLoginForm();
    res.render('users/login', {
        form: loginForm.toHTML(bootstrapField)
    })
})

router.post('/login', async (req,res)=>{
    const loginForm = createLoginForm();

    loginForm.handle(req,{
        //process the login. find user by email and password
        'success': async(form)=>{
            const user = await User.where({
                'email': form.data.email,
                'password': getHashedPassword(form.data.password)
            }).fetch({
                require:false
            })

            if (!user){
                req.flash("error_messages", "Sorry, wrong email or password")
                res.redirect('/users/login')
            } else {
                req.session.user = {
                    id: user.get('id'),
                    username: user.get('username'),
                    email: user.get('email')
                }
                req.flash("success_messages", "Welcome Back" + user.get('username'));
                res.redirect('/users/profile')
            }
        },
        'error': async (form) => {
            req.flash("error_messages", "There are some problems logging you in. Please fill in the form again")
            res.render('users/login', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/profile', (req,res)=>{
    const user = req.session.user;
    if(!user){
        req.flash('error_messages', 'You do not have permission to view this page');
        res.redirect('/users/login')
    } else {
        res.render('users/profile', {
            'user': user
        })
    }
})

router.get('/logout', (req, res) => {
    req.session.user = null;
    req.flash('success_messages', "Goodbye");
    res.redirect('/users/login');
})

module.exports = router;