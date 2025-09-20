import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createOrUpdatePost, fetchPost } from '../features/posts/postsSlice.js';

export default function Editor() {
  const { id } = useParams();
  const { register, handleSubmit, reset } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current } = useSelector((s) => s.posts);

  useEffect(() => {
    if (id) dispatch(fetchPost(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (current && id) {
      reset({ title: current.title, content: current.content, tags: (current.tags || []).join(', ') });
    }
  }, [current, id, reset]);

  const onSubmit = async (values) => {
    const payload = {
      title: values.title,
      content: values.content,
      tags: values.tags ? values.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    };
    const res = await dispatch(createOrUpdatePost({ id, payload }));
    if (res.meta.requestStatus === 'fulfilled') navigate(`/posts/${res.payload._id}`);
  };

  return (
    <div className="editor">
      <h2>{id ? 'Edit Post' : 'Create Post'}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Title</label>
        <input {...register('title', { required: true })} />
        <label>Content</label>
        <textarea rows={12} {...register('content', { required: true })} />
        <label>Tags (comma separated)</label>
        <input {...register('tags')} />
        <button type="submit" className="btn-primary">Save</button>
      </form>
    </div>
  );
}
