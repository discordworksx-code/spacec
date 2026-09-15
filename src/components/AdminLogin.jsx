import React, { useState } from 'react';
import { api } from '../services/api';

export default function AdminLogin({ onLoginSuccess, onBackToApp }) {
  const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('');
  const submit = async (event) => { event.preventDefault(); try { const result = await api.adminLogin(username, password); localStorage.setItem('space_admin_token', result.token); onLoginSuccess(); } catch (err) { setError(err.message); } };
  return <main className="min-h-screen flex items-center justify-center bg-[#050507] p-6"><form onSubmit={submit} className="space-card w-full max-w-sm space-y-4 p-6"><h1 className="text-2xl font-semibold text-white">Admin access</h1><input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="space-input w-full rounded-lg p-3" /><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="space-input w-full rounded-lg p-3" />{error && <p className="text-sm text-red-400">{error}</p>}<button className="w-full rounded-lg bg-white p-3 font-semibold text-black">Sign in</button><button type="button" onClick={onBackToApp} className="w-full p-2 text-sm text-zinc-400">Back</button></form></main>;
}
