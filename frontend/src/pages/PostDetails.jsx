import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchPost, deletePost, addComment as addCommentThunk, updateComment as updateCommentThunk, deleteComment as deleteCommentThunk, reactToPost as reactToPostThunk, repost as repostThunk } from '../features/posts/postsSlice.js';
import { api } from '../services/api.js';

export default function PostDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current } = useSelector((s) => s.posts);
  const { user } = useSelector((s) => s.auth);
  const [commentText, setCommentText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    dispatch(fetchPost(id));
  }, [dispatch, id]);

  const canEdit = user && current && current.author && user.id === current.author._id;

  const onDelete = async () => {
    const res = await dispatch(deletePost(id));
    if (res.meta.requestStatus === 'fulfilled') navigate('/');
  };

  if (!current) return <p>Loading...</p>;

  // Reaction helpers
  const emojis = ['👍', '❤️', '🔥', '👏', '😂'];

  const reactionCounts = React.useMemo(() => {
    const r = current.reactions;
    if (!r) return {};
    if (Array.isArray(r)) {
      return r.reduce((acc, x) => { acc[x.emoji] = (acc[x.emoji] || 0) + 1; return acc; }, {});
    }
    return r; // already counts
  }, [current]);

  const reactToPost = async (emoji) => {
    await dispatch(reactToPostThunk({ postId: current._id, emoji }));
  };

  const onAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const res = await dispatch(addCommentThunk({ postId: current._id, text: commentText.trim() }));
    if (res.meta.requestStatus === 'fulfilled') setCommentText('');
  };

  const startEdit = (c) => { setEditingId(c._id); setEditingText(c.text); };
  const cancelEdit = () => { setEditingId(null); setEditingText(''); };
  const saveEdit = async () => {
    if (!editingText.trim()) return;
    const res = await dispatch(updateCommentThunk({ postId: current._id, commentId: editingId, text: editingText.trim() }));
    if (res.meta.requestStatus === 'fulfilled') cancelEdit();
  };
  const removeComment = async (cid) => {
    await dispatch(deleteCommentThunk({ postId: current._id, commentId: cid }));
  };

  const onRepost = async () => {
    await dispatch(repostThunk(current._id));
  };

  // Like & Bookmark
  const [likeCount, setLikeCount] = useState(current.likes?.length || 0);
  const [bookmarkCount, setBookmarkCount] = useState(current.bookmarks?.length || 0);
  useEffect(() => {
    setLikeCount(current.likes?.length || 0);
    setBookmarkCount(current.bookmarks?.length || 0);
  }, [current]);

  const toggleLike = async () => {
    try {
      const { data } = await api.post(`/posts/${current._id}/like`);
      setLikeCount(data.likes || 0);
    } catch { }
  };
  const toggleBookmark = async () => {
    try {
      const { data } = await api.post(`/posts/${current._id}/bookmark`);
      setBookmarkCount(data.bookmarks || 0);
    } catch { }
  };

  return (
    <div className="post-details">
      <h1>{current.title}</h1>
      <p className="meta">by {current.author?.name} on {new Date(current.createdAt).toLocaleString()}</p>
      <div className="content" dangerouslySetInnerHTML={{ __html: current.content.replace(/\n/g, '<br/>') }} />
      <div className="tags">
        {current.tags?.map((t) => (
          <span key={t} className="tag">#{t}</span>
        ))}
      </div>
      <div className="social" style={{ marginTop: '.6rem', display: 'flex', gap: '.5rem' }}>
        <button className="btn" onClick={toggleLike}>👍 Like {likeCount > 0 ? `(${likeCount})` : ''}</button>
        <button className="btn" onClick={toggleBookmark}>🔖 Bookmark {bookmarkCount > 0 ? `(${bookmarkCount})` : ''}</button>
      </div>
      <div className="reactions" style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
        {emojis.map((e) => (
          <button key={e} className="btn" onClick={() => reactToPost(e)} title={`React ${e}`}>
            <span style={{ fontSize: '1.1rem' }}>{e}</span>
            <span className="muted">{reactionCounts[e] || 0}</span>
          </button>
        ))}
        <button onClick={onRepost} className="btn btn-link" title="Repost">🔁 Repost</button>
      </div>
      {canEdit && (
        <div className="actions">
          <Link to={`/editor/${current._id}`} className="btn-primary">Edit</Link>
          <button onClick={onDelete} className="btn-danger">Delete</button>
        </div>
      )}

      <div className="comments" style={{ marginTop: '1.2rem' }}>
        <h3>Comments</h3>
        {user ? (
          <form onSubmit={onAddComment} style={{ display: 'flex', gap: '.5rem', margin: '.6rem 0 1rem' }}>
            <input placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
            <button type="submit" className="btn-primary">Send</button>
          </form>
        ) : (
          <p className="muted" style={{ margin: '.6rem 0 1rem' }}>Please <Link to="/login">login</Link> to comment and react.</p>
        )}
        <ul>
          {(current.comments || []).map((c) => {
            const isMine = user && (c.user?._id === user.id || c.user === user.id);
            return (
              <li key={c._id} style={{ padding: '.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                  <img src={c.user?.avatarUrl || 'https://placehold.co/28x28'} alt="avatar" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                  <strong>{c.user?.name || 'User'}</strong>
                  <span className="muted" style={{ fontSize: '.85rem' }}>{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                {editingId === c._id ? (
                  <div style={{ marginTop: '.5rem', display: 'flex', gap: '.5rem' }}>
                    <input value={editingText} onChange={(e) => setEditingText(e.target.value)} />
                    <button type="button" className="btn-primary" onClick={saveEdit}>Save</button>
                    <button type="button" className="btn" onClick={cancelEdit}>Cancel</button>
                  </div>
                ) : (
                  <p style={{ margin: '.4rem 0' }}>{c.text}</p>
                )}
                {isMine && editingId !== c._id && (
                  <div style={{ display: 'flex', gap: '.5rem' }}>
                    <button className="btn btn-link" onClick={() => startEdit(c)}>Edit</button>
                    <button className="btn btn-link" onClick={() => removeComment(c._id)}>Delete</button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
