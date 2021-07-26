import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import decode from 'jwt-decode';

import { validateUserPermissions } from '../utils/validateUserPermissions';

import { AuthTokenError } from "../errors/AuthTokenError";

interface OptionsProps {
	permissions?: string[];
	roles?: string[];
}

export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: OptionsProps) {
	return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
		const cookie = parseCookies(ctx);

		if (!cookie['@nextauth.token']) {
			return {
				redirect: {
					destination: '/',
					permanent: false,
				}
			}
		}

		if (options) {
			const { permissions, roles } = options;
			const user = decode<{ permissions: string[], roles: [string] }>(cookie['@nextauth.token']);

			const userHasPermissions = validateUserPermissions({ user, permissions, roles });

			if (!userHasPermissions) {
				return {
					redirect: {
						destination: '/dashboard',
						permanent: false,
					}
				}
			}
		}

		try {
			return await fn(ctx)
		} catch (error) {
			if (error instanceof AuthTokenError) {
				destroyCookie(ctx, '@nextauth.token');
				destroyCookie(ctx, '@nextauth.refreshToken');

				return {
					redirect: {
						destination: '/',
						permanent: false,
					}
				}
			}
		}
	}
}
