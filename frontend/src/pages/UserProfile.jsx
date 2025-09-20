import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';

export default function UserProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [{ data: user }, { data: items }] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/users/${id}/posts`),
        ]);
        if (!mounted) return;
        setProfile(user);
        setPosts(items);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="profile"><p>Loading...</p></div>;
  if (!profile) return <div className="profile"><p>Profile not found</p></div>;

  return (
    <div className="profile">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <img src={profile.avatarUrl || 'https://placehold.co/64x64'} alt="avatar" style={{ width: 64, height: 64, borderRadius: '50%' }} />
        <div>
          <h2 style={{ margin: 0 }}>{profile.name}</h2>
          <p className="muted" style={{ margin: 0 }}>{profile.email}</p>
        </div>
      </div>
      {profile.bio && (
        <p style={{ marginTop: '.8rem' }}>{profile.bio}</p>
      )}

      <h3 style={{ marginTop: '1rem' }}>Posts</h3>
      <ul>
        {posts.map((p) => (
          <li key={p._id} style={{ padding: '.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Link to={`/posts/${p._id}`} style={{ fontWeight: 600 }}>{p.title}</Link>
              <span className="muted" style={{ marginLeft: '.5rem', fontSize: '.9rem' }}>{new Date(p.createdAt).toLocaleDateString()}</span>
            </div>
            <Link to={`/posts/${p._id}`} className="btn">View</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
