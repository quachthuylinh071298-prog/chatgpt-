export function codespacesOrigin(env) {
  if (!env.CODESPACE_NAME || !env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN)
    throw new Error(
      "Thiếu thông tin GitHub Codespaces. Chạy npm run dev trên máy cá nhân.",
    );
  for (const value of [
    env.CODESPACE_NAME,
    env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN,
  ])
    if (!/^[a-z0-9.-]+$/i.test(value))
      throw new Error("Tên Codespaces hoặc tên miền không hợp lệ.");
  return `https://${env.CODESPACE_NAME}-3000.${env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`;
}
