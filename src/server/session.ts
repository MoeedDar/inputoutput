import { auth } from '@/server/auth';

export async function getSessionFromRequest(request: Request) {
	return await auth.api.getSession({
		headers: request.headers,
	});
}
