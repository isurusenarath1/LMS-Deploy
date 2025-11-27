import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ClassesPage has been removed. Redirect to home if route is visited.
export default function ClassesPage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);
  return null;
}