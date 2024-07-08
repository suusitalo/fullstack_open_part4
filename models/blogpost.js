const mongoose = require('mongoose');

const blogpostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minLength: 5,
    unique: true,
  },
  author: {
    type: String,
    required: true,
    minLength: 5,
  },
  url: {
    type: String,
    required: true,
    minLength: 5,
    unique: true,
  },
  likes: Number,
});

blogpostSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('BlogPost', blogpostSchema);
