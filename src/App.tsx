import React from "react";
import { Router } from './common/Router'
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      {/* Render the router here */}
      <Router />
    </AuthProvider>
  );
}

export default App;