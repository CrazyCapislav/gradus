import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
);

export function getGoogleAuthUrl(): string {
    return client.generateAuthUrl({
        access_type: "offline",
        scope: ["profile", "email"],
        prompt: "select_account",
    });
}

export async function getGoogleUser(code: string): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}> {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const res = await client.request<{
        id: string;
        email: string;
        given_name: string;
        family_name: string;
    }>({ url: "https://www.googleapis.com/oauth2/v2/userinfo" });

    return {
        id: res.data.id,
        email: res.data.email,
        firstName: res.data.given_name ?? "",
        lastName: res.data.family_name ?? "",
    };
}
