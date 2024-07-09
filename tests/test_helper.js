const BlogPost = require('../models/blogpost');

const initialBlogPosts = [
  {
    title: 'Testiblogipostaus',
    author: 'Seppo Blogipostinen',
    url: 'www.google.fi',
    likes: 1,
    id: '668bdab1930b9a9c0d2816d5',
  },
  {
    title: 'Testiblogipostaus2',
    author: 'Seppo TestiBlogipostinen',
    url: 'www.iltalehti.fi',
    likes: 1,
    id: '668bdab1930b9a9c0d281612',
  },
];

const nonExistingId = async () => {
  const blogpost = new BlogPost({
    title: 'This will be removed',
    author: 'The whole blogpost',
    url: '...and url as well',
  });
  await blogpost.save();
  await blogpost.deleteOne();

  return blogpost._id.toString();
};

const blogpostsInDb = async () => {
  const blogposts = await BlogPost.find({});
  return blogposts.map((blogpost) => blogpost.toJSON());
};

module.exports = {
  initialBlogPosts,
  nonExistingId,
  blogpostsInDb,
};
