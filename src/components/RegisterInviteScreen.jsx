import React, { useState } from 'react';
import { api } from '../services/api';

export default function RegisterInviteScreen({ token, onComplete }) {
  const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [message, setMessage] = useState('');
  const submit = async (event) => { event.preventDefault(); try { await api.register({ token, username, password }); setMessage('Registration complete.'); setTimeout(onComplete, 700); } catch (err) { setMessage(err.message); } };
  return <main className="min-h-screen flex items-center justify-center bg-[#050507] p-6"><form onSubmit={submit} className="space-card w-full max-w-sm space-y-4 p-6"><h1 className="text-2xl font-semibold text-white">Create account</h1><input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="space-input w-full rounded-lg p-3" /><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="space-input w-full rounded-lg p-3" />{message && <p className="text-sm text-zinc-300">{message}</p>}<button className="w-full rounded-lg bg-white p-3 font-semibold text-black">Register</button></form></main>;
}
