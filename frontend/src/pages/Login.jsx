import React from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../features/auth/authSlice.js';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function Login() {
  const { register: rf, handleSubmit } = useForm();
  const dispatch = useDispatch();
  const { status, error } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (values) => {
    const res = await dispatch(login(values));
    if (res.meta.requestStatus === 'fulfilled') {
      const from = location.state?.from?.pathname || '/';
      navigate(from);
    }
  };

  return (
    <div className="auth-form">
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Email</label>
        <input type="email" {...rf('email', { required: true })} />
        <label>Password</label>
        <input type="password" {...rf('password', { required: true })} />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={status === 'loading'}>Login</button>
      </form>
      <p style={{ fontSize: "20px", color: "red", marginTop: "10px" }}>
        Don't have an account?{" "}
        <Link
          to="/signup"
          style={{
            textDecoration: "none",
            color: "orange",
            fontWeight: "bold",
            transition: "0.3s"
          }}
        >
          Signup
        </Link>
      </p>
    </div>
  );
}
