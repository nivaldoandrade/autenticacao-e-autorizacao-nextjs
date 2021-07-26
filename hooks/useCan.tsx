import { validateUserPermissions } from "../utils/validateUserPermissions";
import { useAuth } from "./useAuth";

interface UseCanProps {
	permissions?: string[];
	roles?: string[];
}

export function useCan({ permissions, roles }: UseCanProps) {
	const { user, isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return false;
	}

	const userHasPermissions = validateUserPermissions({ user, permissions, roles });

	return userHasPermissions;
}