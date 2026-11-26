// Latest posts from the academy's Naver blog. The CDN keeps a copy for 30 minutes,
// so a new post shows on /blog/ within about half an hour without a redeploy.
const { fetchPosts } = require('./_rss.js');

module.exports = async (req, res) => {
  try {
    const posts = await fetchPosts();
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.setHeader('cache-control', 'public, s-maxage=1800, stale-while-revalidate=86400');
    res.status(200).send(JSON.stringify({ updated: new Date().toISOString(), posts }));
  } catch (e) {
    res.setHeader('cache-control', 'no-store');
    res.status(502).json({ error: 'blog feed unavailable' });
  }
};
