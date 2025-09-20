import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchPost } from '../features/posts/postsSlice.js';
import { addComment as addCommentThunk, updateComment as updateCommentThunk, deleteComment as deleteCommentThunk } from '../features/posts/postsSlice.js';

export default function CommentsModal({ postId, open, onClose }) {
  const dispatch = useDispatch();
  const { current } = useSelector((s) => s.posts);
  const { user } = useSelector((s) => s.auth);
  const [commentText, setCommentText] = React.useState('');
  const [editingId, setEditingId] = React.useState(null);
  const [editingText, setEditingText] = React.useState('');

  React.useEffect(() => {
    if (open && postId) dispatch(fetchPost(postId));
  }, [open, postId, dispatch]);

  if (!open) return null;

  const onAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const res = await dispatch(addCommentThunk({ postId, text: commentText.trim() }));
    if (res.meta.requestStatus === 'fulfilled') setCommentText('');
  };

  const startEdit = (c) => { setEditingId(c._id); setEditingText(c.text); };
  const cancelEdit = () => { setEditingId(null); setEditingText(''); };
  const saveEdit = async () => {
    if (!editingText.trim()) return;
    const res = await dispatch(updateCommentThunk({ postId, commentId: editingId, text: editingText.trim() }));
    if (res.meta.requestStatus === 'fulfilled') cancelEdit();
  };
  const removeComment = async (cid) => {
    await dispatch(deleteCommentThunk({ postId, commentId: cid }));
  };

  return (
    <div style={backdrop} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          <h3 style={{ margin: 0 }}>Comments</h3>
          <button className="btn" onClick={onClose}>✕</button>
        </div>
        {!current || current._id !== postId ? (
          <p>Loading...</p>
        ) : (
          <>
            <div style={{ marginBottom: '.8rem' }}>
              <Link to={`/posts/${current._id}`} style={{ fontWeight: 600 }}>{current.title}</Link>
              <p className="muted" style={{ margin: '.2rem 0 0' }}>by {current.author?.name}</p>
            </div>
            {user ? (
              <form onSubmit={onAddComment} style={{ display: 'flex', gap: '.5rem', margin: '0 0 1rem' }}>
                <input placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                <button type="submit" className="btn-primary">Send</button>
              </form>
            ) : (
              <p className="muted" style={{ margin: '.6rem 0 1rem' }}>Please <Link to="/login">login</Link> to comment.</p>
            )}
            <ul style={{ maxHeight: '50vh', overflowY: 'auto' }}>
              {(current.comments || []).map((c) => {
                const isMine = user && (c.user?._id === user.id || c.user === user.id);
                return (
                  <li key={c._id} style={{ padding: '.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
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
          </>
        )}
      </div>
    </div>
  );
}

const backdrop = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};
const modal = {
  width: 'min(680px, 92vw)', background: 'var(--card, #111)', borderRadius: 12, padding: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
};
const header = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.6rem' };
