import React, {useState} from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
    const {login} = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState(null);

    async function onSubmit(e) {
        e.preventDefault();
        setError(null);
        try {
            await login(form);
            navigate('/chat')
        } catch (err) {
            setError('Login failed. Please check your credentials.');
        }
    }
return (
    <form onSubmit={onSubmit}>
        <h1>Login</h1>
        <input placeholder='Username' value={form.username}
        onChange={(e)=>setForm({...form, username:e.target.value})} />
        <input type='password' placeholder='Password' value={form.password}
        onChange={(e)=>setForm({...form, password:e.target.value})} />
        <button type='submit'>Login</button>
        {error && <p>{error}</p>}
        <p>No Accounts? <Link to="/register">Register</Link></p>
    </form>
)
}