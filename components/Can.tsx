import { ReactNode } from 'react';
import { useCan } from '../hooks/useCan';

interface CanComponentProps {
	children: ReactNode;
	permissions?: string[];
	roles?: string[];
}

export function CanComponent({ children, permissions, roles }: CanComponentProps) {

	const userCanSeeComponent = useCan({ permissions, roles });

	if (!userCanSeeComponent) {
		return null;
	}

	return (
		<>
			{children}
		</>
	)
}