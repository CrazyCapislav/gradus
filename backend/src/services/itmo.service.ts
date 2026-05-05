const ITMO_BASE = "https://id.itmo.ru/auth/realms/itmo/protocol/openid-connect";

export function getItmoAuthUrl(): string {
    const params = new URLSearchParams({
        client_id: process.env.ITMO_CLIENT_ID!,
        redirect_uri: process.env.ITMO_CALLBACK_URL!,
        response_type: "code",
        scope: "openid profile email",
    });
    return `${ITMO_BASE}/auth?${params.toString()}`;
}

export async function getItmoUser(code: string): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}> {
    const tokenRes = await fetch(`${ITMO_BASE}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: process.env.ITMO_CALLBACK_URL!,
            client_id: process.env.ITMO_CLIENT_ID!,
            client_secret: process.env.ITMO_CLIENT_SECRET!,
        }),
    });

    if (!tokenRes.ok) {
        throw new Error("Failed to exchange ITMO code for token");
    }

    const { access_token } = await tokenRes.json() as { access_token: string };

    const userRes = await fetch(`${ITMO_BASE}/userinfo`, {
        headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!userRes.ok) {
        throw new Error("Failed to fetch ITMO user info");
    }

    const user = await userRes.json() as {
        sub: string;
        email: string;
        given_name?: string;
        family_name?: string;
        firstname?: string;
        lastname?: string;
    };

    return {
        id: user.sub,
        email: user.email,
        firstName: user.given_name ?? user.firstname ?? "",
        lastName: user.family_name ?? user.lastname ?? "",
    };
}
