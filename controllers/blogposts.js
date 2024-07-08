const blogpostsRouter = require('express').Router();
const Blogpost = require('../models/blogpost');

/* Get all blogposts */
blogpostsRouter.get('/', (request, response) => {
  Blogpost.find({}).then((blogposts) => {
    response.json(blogposts);
  });
});

/* Get blogpost info by id */
blogpostsRouter.get('/:id', (request, response, next) => {
  Blogpost.findById(request.params.id)
    .then((blogpost) => {
      if (blogpost) {
        response.json(blogpost);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

/* Get amount of blogposts in database */
blogpostsRouter.get('/info', (request, response) => {
  Blogpost.find({}).then((blogposts) => {
    const amountOfBlogposts = blogposts.length;
    const date = new Date();
    const infoResponse = `<p>Phonebook has info for ${amountOfBlogposts} people</p><p>${date}</p>`;
    response.send(infoResponse);
  });
});

/* Add new blogpost */
blogpostsRouter.post('/', (request, response, next) => {
  const body = request.body;

  const blogpost = new Blogpost({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  });

  blogpost
    .save()
    .then((savedBlogpost) => {
      response.json(savedBlogpost);
    })
    .catch((error) => next(error));
});

/* Delete blogpost */
blogpostsRouter.delete('/:id', (request, response, next) => {
  Blogpost.findByIdAndDelete(request.params.id)
    .then((result) => {
      console.log('Deleted blogpost:', result);
      Blogpost.find({}).then((blogposts) => {
        response.json(blogposts);
      });
    })
    .catch((error) => next(error));
});

module.exports = blogpostsRouter;
