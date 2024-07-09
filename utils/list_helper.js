const _ = require('lodash');

const totalLikes = (blogs) => {
  return blogs.reduce((totalLikes, blog) => totalLikes + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  const favorite = blogs.reduce((blogWithMaxVotes, blog) =>
    blogWithMaxVotes.likes > blog.likes ? blogWithMaxVotes : blog
  );
  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes,
  };
};

const mostBlogs = (blogs) => {
  const mostActiveWriter = _.head(
    _(blogs).countBy('author').entries().maxBy(_.last)
  );
  const amountOfBlogs = _.countBy(blogs, 'author')[mostActiveWriter];
  return {
    author: mostActiveWriter,
    blogs: amountOfBlogs,
  };
};

const mostLikes = (blogs) => {
  const authorLikes = _.mapValues(_.groupBy(blogs, 'author'), (blogs) =>
    _.sumBy(blogs, 'likes')
  );

  const authorWithMostLikes = _.maxBy(_.toPairs(authorLikes), _.last);

  return {
    author: authorWithMostLikes[0],
    likes: authorWithMostLikes[1],
  };
};

module.exports = { totalLikes, favoriteBlog, mostBlogs, mostLikes };
