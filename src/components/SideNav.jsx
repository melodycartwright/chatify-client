import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx';

export default function SideNav() {
    const {logout} = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate('/login', { replace: true });
    }
    return (
        <aside className="sidenav">
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