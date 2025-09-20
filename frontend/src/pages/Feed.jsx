import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts } from '../features/posts/postsSlice.js';
import PostCard from '../components/PostCard.jsx';

export default function Feed() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((s) => s.posts);
  const [q, setQ] = useState('');

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const onSearch = (e) => {
    e.preventDefault();
    dispatch(fetchPosts({ q }));
  };

  return (
    <div>
      <h2>Blog Feed</h2>
      <form onSubmit={onSearch} className="search">
        <input placeholder="Search by title or tag" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="submit">Search</button>
      </form>
      {status === 'loading' ? (
        <p>Loading...</p>
      ) : (
        <div className="grid">
          {items.map((p) => (
            <PostCard key={p._id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
