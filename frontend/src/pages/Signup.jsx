import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { register as registerUser } from '../features/auth/authSlice.js';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const { register, handleSubmit } = useForm();
  const dispatch = useDispatch();
  const { status, error } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    const res = await dispatch(registerUser(values));
    if (res.meta.requestStatus === 'fulfilled') navigate('/');
  };

  return (
    <div className="auth-form">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Name</label>
        <input {...register('name', { required: true })} />
        <label>Email</label>
        <input type="email" {...register('email', { required: true })} />
        <label>Password</label>
        <input type="password" {...register('password', { required: true, minLength: 6 })} />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={status === 'loading'}>Create account</button>
      </form>
      <p style={{ fontSize: "20px", color: "red", marginTop: "10px" }}>
        Already have an account?{" "}
        <Link
          to="/login"
          style={{
            textDecoration: "none",
            color: "orange",
            fontWeight: "bold",
            transition: "0.3s"
          }}
          onMouseOver={(e) => (e.target.style.color = "green")}
          onMouseOut={(e) => (e.target.style.color = "green")}
        >
          Login
        </Link>
      </p>
    </div>
  );
}
