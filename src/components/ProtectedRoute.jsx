import React from 'react';
import {Navigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext.jsx';

export default function ProtectedRoute({children}) {
  const {user, ready} = useAuth();

  if (!ready) return null; // or a loading spinner
return user? children : <Navigate to='/login' replace />;       
  }

