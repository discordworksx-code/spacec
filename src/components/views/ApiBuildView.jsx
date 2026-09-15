import React from 'react';
import { PlaceholderView } from '../Basic';
export default function ApiBuildView({ user }) { return <PlaceholderView title="API Build" description={`Build workspace for ${user?.username || 'your account'}.`} />; }
