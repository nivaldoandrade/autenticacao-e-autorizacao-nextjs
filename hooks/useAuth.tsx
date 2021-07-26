import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import Router from 'next/router';

import { api } from '../services/apiClient';

interface SignInCredentials {
	email: string;
	password: string;
}

interface User {
	email: string;
	permissions: string[];
	roles: string[];
}


interface AuthContext {
	signIn: (credentials: SignInCredentials) => Promise<void>;
	isAuthenticated: boolean;
	user: User;
}

interface AuthProviderProps {
	children: ReactNode;
}


const AuthContext = createContext({} as AuthContext);


let authChannel: BroadcastChannel;

export function signOut() {
	destroyCookie(null, '@nextauth.token');
	destroyCookie(null, '@nextauth.refreshToken');

	authChannel.postMessage('signOut');

	Router.push('/');
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User>();
	const isAuthenticated = !!user;

	useEffect(() => {
		authChannel = new BroadcastChannel('signOut');

		authChannel.onmessage = (message) => {
			switch (message.data) {
				case 'signOut':
					signOut();
					break
				case 'signIn':
					Router.push('/dashboard');
					break
				default:
					break
			}
		}
	}, []);

	useEffect(() => {
		const { '@nextauth.token': token } = parseCookies();

		if (token) {
			api.get('me').then(response => {
				const { email, permissions, roles } = response.data;

				setUser({ email, permissions, roles });
			}).catch(() => {
				signOut();
			})
		}
	}, [])

	async function signIn({ email, password }: SignInCredentials) {
		try {
			const response = await api.post('sessions', { email, password });
			const { permissions, roles, token, refreshToken } = response.data;

			setUser({
				email,
				permissions,
				roles
			});

			setCookie(null, '@nextauth.token', token, {
				maxAge: 60 * 60 * 24 * 30, // 30 days
				path: '/',
			})

			setCookie(null, '@nextauth.refreshToken', refreshToken, {
				maxAge: 60 * 60 * 24 * 30, //30 days
				path: '/',
			})

			api.defaults.headers.Authorization = `Bearer ${token}`

			Router.push('/dashboard');

			// authChannel.postMessage('signIn');
		} catch (error) {
			console.log(error);
		}
	}


	return (
		<AuthContext.Provider value={{ isAuthenticated, signIn, user }}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	return useContext(AuthContext);
}