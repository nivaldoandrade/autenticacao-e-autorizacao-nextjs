import { FormEvent, useState } from 'react';

import { useAuth } from "../hooks/useAuth"
import { withSSRGuest } from '../utils/withSSRGuest';

export default function Home() {
	const { signIn } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();

		const data = {
			email,
			password,
		}

		await signIn(data);
	}

	return (
		<form
			onSubmit={handleSubmit}
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: '8px',
				alignItems: 'center',
				justifyContent: 'center',
				height: '100vh',
			}}
		>
			<input
				type="text"
				placeholder="email"
				onChange={(e) => setEmail(e.target.value)}
			/>
			<input
				type="password"
				placeholder="senha"
				onChange={(e) => setPassword(e.target.value)}
			/>

			<button type="submit">Entrar</button>
		</form>
	)
}

export const getServerSideProps = withSSRGuest(async (ctx) => {
	return {
		props: {}
	}
})

