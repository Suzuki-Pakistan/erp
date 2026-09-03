import { logout } from "@/lib/server/auth";
import { apiError, sameOrigin } from "@/lib/server/api";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await logout();
    return Response.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
