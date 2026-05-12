export function getAdminTokenFromRequest(
  request: Request,
  body?: Record<string, unknown>,
) {
  const url = new URL(request.url);
  const headerToken = request.headers.get("x-admin-import-token");
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  return (
    headerToken ||
    bearerToken ||
    url.searchParams.get("token") ||
    (typeof body?.token === "string" ? body.token : "")
  );
}

export function verifyAdminImportToken(token: string | null | undefined) {
  const expectedToken = process.env.ADMIN_IMPORT_TOKEN;
  return Boolean(expectedToken && token && token === expectedToken);
}
