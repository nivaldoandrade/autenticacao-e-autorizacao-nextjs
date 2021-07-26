import { withSSRAuth } from "../utils/withSSRAuth"

export default function Metrics() {
	return (
		<div>Metrics</div>
	)
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
	return {
		props: {}
	}
},
	{
		permissions: ['metrics.list'],
		roles: ['administrator']
	}
)
