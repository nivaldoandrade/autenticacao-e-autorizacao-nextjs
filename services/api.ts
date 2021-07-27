import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { AuthTokenError } from '../errors/AuthTokenError';
import { signOut } from '../hooks/useAuth';

let isrefreshing = false;
let failedResquestQueue = [];

export function APIClient(ctx = null) {
	let cookies = parseCookies(ctx);

	const api = axios.create({
		baseURL: 'http://localhost:3333',
		headers: {
			Authorization: `Bearer ${cookies['@nextauth.token']}`
		}
	})


	api.interceptors.response.use(response => {
		return response;
	}, (error: AxiosError) => {
		const { config, response: { status, data } } = error;

		if (status === 401) {
			if (data.code === 'token.expired') {
				cookies = parseCookies(ctx);

				const { '@nextauth.refreshToken': refreshToken } = cookies;
				const originalRequest = config;

				if (!isrefreshing) {
					isrefreshing = true;

					api.post('refresh', { refreshToken }).then(resolve => {
						console.log('ok');
						setCookie(ctx, '@nextauth.token', resolve.data.token, {
							maxAge: 60 * 60 * 24 * 30, // 30 days
							path: '/',
						})

						setCookie(ctx, '@nextauth.refreshToken', resolve.data.refreshToken, {
							maxAge: 60 * 60 * 24 * 30, //30 days
							path: '/',
						})

						api.defaults.headers.Authorization = `Bearer ${resolve.data.token}`

						failedResquestQueue.forEach(request => request.onSuccess(resolve.data.token));
						failedResquestQueue = [];

					}).catch(error => {
						failedResquestQueue.forEach(request => request.onFailure(error));
						failedResquestQueue = [];

						if (process.browser) {
							signOut()
						}
					}).finally(() => {
						isrefreshing = false;
					})
				}

				return new Promise((resolve, reject) => {
					failedResquestQueue.push({
						onSuccess: (token: string) => {
							originalRequest.headers['Authorization'] = `Bearer ${token}`
							resolve(api(originalRequest));
						},
						onFailure: (err: AxiosError) => {
							reject(err)
						}
					})
				})
			} else {
				//deslogar o usuário
				if (process.browser) {
					signOut()
				} else {
					return Promise.reject(new AuthTokenError());
				}
			}
		}
		return Promise.reject(error);
	})

	return api;
}





