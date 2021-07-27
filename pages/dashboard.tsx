import React, { useEffect } from "react";
import { CanComponent } from "../components/Can";
import { signOut, useAuth } from "../hooks/useAuth";
import { APIClient } from '../services/api';
import { api } from "../services/apiClient";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard() {
	const { user } = useAuth();

	useEffect(() => {
		api.get('me').then(response => response).catch(() => signOut())
	}, []);

	function handleSignOut() {
		signOut();
	}

	return (
		<>
			<h1>Dashboard: {user?.email}</h1>
			<button type="button" onClick={handleSignOut}>SignOut</button>
			<CanComponent roles={['administrator']}>
				<div>Metrics</div>
			</CanComponent>
		</>
	)
}


export const getServerSideProps = withSSRAuth(async (ctx) => {
	const apiClient = APIClient(ctx);

	const response = await apiClient.get('me');

	return {
		props: {}
	}
})