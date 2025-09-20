import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import CommentsModal from './CommentsModal.jsx';

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const [likeCount, setLikeCount] = React.useState(post.likes?.length || 0);
  const [bookmarkCount, setBookmarkCount] = React.useState(post.bookmarks?.length || 0);
  const [showCommentsModal, setShowCommentsModal] = React.useState(false);
  const emojis = ['👍', '❤️', '🔥'];

  const toggleLike = async () => {
    try {
      const { data } = await api.post(`/posts/${post._id}/like`);
      setLikeCount(data.likes || 0);
    } catch {}
  };
  const toggleBookmark = async () => {
    try {
      const { data } = await api.post(`/posts/${post._id}/bookmark`);
      setBookmarkCount(data.bookmarks || 0);
    } catch {}
  };
  const reactToPost = async (emoji) => {
    try {
      await api.post(`/posts/${post._id}/react`, { emoji });
    } catch {}
  };
  const onRepost = async () => {
    try {
      await api.post(`/posts/${post._id}/repost`);
    } catch {}
  };
  const openComments = () => setShowCommentsModal(true);
  const closeComments = () => setShowCommentsModal(false);

  return (
    <div className="post-card">
      <Link to={`/posts/${post._id}`}>
        <h3>{post.title}</h3>
      </Link>
      <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
        <img src={post.author?.avatarUrl || 'https://placehold.co/24x24'} alt="avatar" style={{ width: 24, height: 24, borderRadius: '50%' }} />
        <Link to={`/u/${post.author?._id || post.author}`}>{post.author?.name || 'Unknown'}</Link>
        <span>• {new Date(post.createdAt).toLocaleDateString()}</span>
      </div>
      <p className="excerpt">{post.content?.slice(0, 180)}...</p>
      <div className="tags">
        {(post.tags || []).map((t) => (
          <span key={t} className="tag">#{t}</span>
        ))}
      </div>
      <div className="actions" style={{ display: 'flex', gap: '.4rem', marginTop: '.6rem', flexWrap: 'wrap' }}>
        <button className="btn" onClick={toggleLike}>👍 {likeCount}</button>
        <button className="btn" onClick={toggleBookmark}>🔖 {bookmarkCount}</button>
        {emojis.map((e) => (
          <button key={e} className="btn" title={`React ${e}`} onClick={() => reactToPost(e)}>{e}</button>
        ))}
        <button className="btn" onClick={onRepost}>🔁 Repost</button>
        <button className="btn" onClick={openComments}>💬 Comments</button>
      </div>
      <CommentsModal postId={post._id} open={showCommentsModal} onClose={closeComments} />
    </div>
  );
}
