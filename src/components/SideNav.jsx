import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx';

export default function SideNav() {
    const {user,logout} = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate('/login', { replace: true });
    }
    return (
        <aside className="sidenav">
            <div style={{marginBottom: 12, fontSize: 14, opacity: 0.8}}>
                {user ? <> Signed in as <strong>{user.username}</strong></> : 'Not signed in'}
            </div>
            <nav>   
                <ul>
                    <li><NavLink to="/chat">Chat</NavLink></li>
                    <li><NavLink to="/profile">Profile</NavLink></li>
                    <li><button onClick={handleLogout}>Logout</button></li>
                </ul>
            </nav>
            </aside>
    )
}