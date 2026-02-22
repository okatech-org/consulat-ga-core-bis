import { createFileRoute } from "@tanstack/react-router";
import { handler } from "@/lib/auth-server";

// HTTP/1-only headers that crash the HTTP/2 dev server
const FORBIDDEN_H2_HEADERS = ["transfer-encoding", "connection", "keep-alive"];

async function safeHandler(request: Request): Promise<Response> {
	const response = await handler(request);

	// Clone headers, preserving multi-value Set-Cookie
	const headers = new Headers();
	for (const [key, value] of response.headers.entries()) {
		if (!FORBIDDEN_H2_HEADERS.includes(key.toLowerCase())) {
			headers.append(key, value);
		}
	}

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: ({ request }: { request: Request }) => safeHandler(request),
			POST: ({ request }: { request: Request }) => safeHandler(request),
		},
	},
});
