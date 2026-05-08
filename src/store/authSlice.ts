/**
 * Auth slice -- display version.
 * Hardcoded demo user, no real authentication.
 */

import { createSlice } from '@reduxjs/toolkit';

interface DemoUser {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  school?: string;
  schoolEmailVerified?: boolean;
}

interface AuthState {
  user: DemoUser;
  isAuthenticated: boolean;
}

const DEMO_USER: DemoUser = {
  id: 1,
  username: 'DemoUser',
  email: 'demo@nyu.edu',
  school: 'NYU',
  schoolEmailVerified: true,
};

const initialState: AuthState = {
  user: DEMO_USER,
  isAuthenticated: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
});

export default authSlice.reducer;
