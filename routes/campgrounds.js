const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schema');
const isLoggedIn = require('../middleware')

const validateCammpground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 404)
    }else{
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
 }));
 
 router.get('/new', isLoggedIn, (req, res) => {
    // if(!req.isAuthenticated()){
    //     req.flash('error', "you must be signed in!!");
    //     return res.redirect('/login');
    // };
    res.render('campgrounds/new')
 });
 
 router.post('/', validateCammpground, catchAsync(async (req, res) => {
     // if(!req.body.campground) throw new ExpressError("Invalid Campground Data" , 404);
     const campground = new Campground(req.body.campground);
     await campground.save();
     req.flash('success', "Successfully add new campground!")
     res.redirect(`/campgrounds/${campground._id}`);
 }))
 
 router.get('/:id', catchAsync(async (req, res) => {
     const { id } = req.params;
     const campground = await Campground.findById(id).populate('reviews');
     if(!campground){
        req.flash('error', "Cannot find that Campground!")
        res.redirect('/campgrounds')
     }
     console.log(campground)
     res.render('campgrounds/show', { campground });
 }));
 
 router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
     const { id } = req.params;
     const campground = await Campground.findById(id)
     if(!campground){
        req.flash('error', "Cannot find that Campground!")
        res.redirect('/campgrounds')
     }
     req.flash('success', " Successfully updated campground!")
     res.render('campgrounds/edit', { campground })
 }));
 
 router.put('/:id', validateCammpground, catchAsync(async (req, res) => {
     const { id } = req.params;
     const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
     res.redirect(`/campgrounds/${campground._id}`);
 }));
 
 router.delete('/:id', catchAsync(async (req, res) => {
     const { id } = req.params;
     const campground = await Campground.findByIdAndDelete(id);
     req.flash('success', "Successfully deleted campground")
     res.redirect('/campgrounds')
 }));
 
 module.exports = router;