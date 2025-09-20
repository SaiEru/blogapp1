import React from 'react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { deletePost as deletePostThunk } from '../features/posts/postsSlice.js';

export default function Profile() {
  const { user, token } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      name: user?.name,
      bio: user?.bio,
      avatarUrl: user?.avatarUrl,
      location: user?.location || '',
      website: user?.website || '',
      birthday: user?.birthday ? new Date(user.birthday).toISOString().slice(0, 10) : '',
      occupation: user?.occupation || '',
    }
  });
  const [avatarPreview, setAvatarPreview] = React.useState(user?.avatarUrl || '');
  const [avatarFile, setAvatarFile] = React.useState(null);

  useEffect(() => {
    reset({
      name: user?.name,
      bio: user?.bio,
      avatarUrl: user?.avatarUrl,
      location: user?.location || '',
      website: user?.website || '',
      birthday: user?.birthday ? new Date(user.birthday).toISOString().slice(0, 10) : '',
      occupation: user?.occupation || '',
    });
    setAvatarPreview(user?.avatarUrl || '');
  }, [user, reset]);

  const onSubmit = async (values) => {
    await api.put('/users/me', values, { headers: { Authorization: `Bearer ${token}` } });
    const { data } = await api.get('/users/me');
    localStorage.setItem('user', JSON.stringify(data));
    window.location.reload();
  };

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    const fd = new FormData();
    fd.append('avatar', avatarFile);
    const { data } = await api.post('/users/me/avatar', fd, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
    });

    reset({ ...watch(), avatarUrl: data.avatarUrl });
    const me = await api.get('/users/me');
    localStorage.setItem('user', JSON.stringify(me.data));
  };

  const [posts, setPosts] = React.useState([]);
  useEffect(() => {
    api.get('/users/me/posts').then(({ data }) => setPosts(data));
  }, []);

  const onDeletePost = async (id) => {
    const res = await dispatch(deletePostThunk(id));
    if (res.meta.requestStatus === 'fulfilled') {
      setPosts((prev) => prev.filter((p) => p._id !== id));
    }
  };

  return (
    <div className="profile">
      <h2>My Profile</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <img src={avatarPreview || 'https://placehold.co/96x96'} alt="avatar" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover' }} />
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          <input type="file" accept="image/*" onChange={onAvatarChange} />
          <button type="button" className="btn" onClick={uploadAvatar} disabled={!avatarFile}>Upload</button>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
        <label>Name</label>
        <input {...register('name', { required: true })} />
        <label>Bio</label>
        <textarea rows={6} {...register('bio')} />
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.8rem' }}>
          <div>
            <label>Location</label>
            <input {...register('location')} />
          </div>
          <div>
            <label>Website</label>
            <input placeholder="https://example.com" {...register('website')} />
          </div>
          <div>
            <label>Birthday</label>
            <input type="date" {...register('birthday')} />
          </div>
          <div>
            <label>Occupation</label>
            <input {...register('occupation')} />
          </div>
        </div>
        <label>Avatar URL</label>
        <input {...register('avatarUrl')} />
        <button type="submit" className="btn-primary">Update</button>
      </form>

      <h3>My Posts</h3>
      <ul>
        {posts.map((p) => (
          <li key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <Link to={`/posts/${p._id}`} style={{ fontWeight: 600 }}>{p.title}</Link>
              <span className="muted" style={{ marginLeft: '.5rem', fontSize: '.9rem' }}>{new Date(p.createdAt).toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <Link to={`/editor/${p._id}`} className="btn">Edit</Link>
              <button className="btn btn-danger" onClick={() => onDeletePost(p._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
