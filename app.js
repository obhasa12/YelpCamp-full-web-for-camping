const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const { campgroundSchema, reviewSchema } = require('./schema');
const Review = require('./models/review')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError')

const campgrounds = require('./routes/campgrounds');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log("Database connected")
});

const app = express();

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use('/campgrounds', campgrounds )

const validateCammpground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 404)
    }else{
        next();
    }
}

const validateReview = (req ,res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(err => err.message).join(',')
        throw new ExpressError (msg, 404)
    }else{
        next()
    }
}

app.get('/', (req, res) => {
    res.render('home')
});

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async(req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.all('*', (req, res, next) => {
    next(new ExpressError("Page not found", 404))
})

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if(!err.message) err.message = "Oh no, Something went Wrong!!1"
    res.status(status).render('error', { err });
})

app.listen(3000, () => {
    console.log("Serving on port 3000")
});