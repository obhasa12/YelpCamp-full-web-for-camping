const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log("Database connected")
});

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}

const seedDB = async() => {
    await Campground.deleteMany({});
    for(let i = 0; i <50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '642e72a497c9bbb3dc99131a', 
            // location: `${cities[random1000].city}, ${cities[random1000].state}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat officiis praesentium a ab earum doloremque aspernatur blanditiis eos repudiandae, iure, alias provident atque, quia commodi numquam placeat quae. Magni, perspiciatis.',
            price,
            geometry : {
                type: "Point",
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            image: [{
                url: 'https://res.cloudinary.com/dr4yxefne/image/upload/v1683010531/YelpCamp/pbyiyilvhib38s87h5i1.jpg',
                filename: 'YelpCamp/pbyiyilvhib38s87h5i1',
              },
              {
                url: 'https://res.cloudinary.com/dr4yxefne/image/upload/v1683010531/YelpCamp/jj5h739klkduxmzicqsq.jpg',
                filename: 'YelpCamp/jj5h739klkduxmzicqsq',
              }]
        })
        await camp.save();
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close();
    })