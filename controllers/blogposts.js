const jwt = require('jsonwebtoken');
const blogpostsRouter = require('express').Router();
const Blogpost = require('../models/blogpost');
const User = require('../models/user');

const getTokenFrom = (request) => {
  const authorization = request.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '');
  }
  return null;
};

/* Get all blogposts */
blogpostsRouter.get('/', async (request, response) => {
  const blogposts = await Blogpost.find({});
  response.json(blogposts);
});

/* Get blogpost info by id */
blogpostsRouter.get('/:id', async (request, response) => {
  const blogpost = await Blogpost.findById(request.params.id);
  if (blogpost) {
    response.json(blogpost);
  } else {
    response.status(404).end();
  }
});

/* Update blogpost info */
blogpostsRouter.put('/:id', async (request, response) => {
  const body = request.body;
  const updatedBlogpost = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  };

  const blogpost = await Blogpost.findByIdAndUpdate(
    request.params.id,
    updatedBlogpost,
    { new: true }
  );
  if (blogpost) {
    response.json(blogpost);
  } else {
    response.status(404).end();
  }
});

/* Add new blogpost */
blogpostsRouter.post('/', async (request, response) => {
  const body = request.body;
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' });
  }
  const user = await User.findById(decodedToken.id);

  const blogpost = new Blogpost({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id,
  });
  const savedBlogpost = await blogpost.save();
  user.blogposts = user.blogposts.concat(savedBlogpost._id);
  await user.save();
  response.status(201).json(savedBlogpost);
});

/* Delete blogpost */
blogpostsRouter.delete('/:id', async (request, response) => {
  await Blogpost.findByIdAndDelete(request.params.id);
  response.status(204).end();
});

module.exports = blogpostsRouter;
