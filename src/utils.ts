import { REDIRECT_URL } from "./constants";
const CLIENT_ID = process.env.CLIENT_ID as string;
const CLIENT_SECRET = process.env.CLIENT_SECRET as string;

export const getCookie = (name: string, cookies: string) => {
    const derivedCookie = cookies
        .split(";")
        .find((cookie) => cookie.trim().startsWith(name + "="));
    // const derivedCookie = cookies.match(new RegExp(`${name}=[^;]+`))?.[0];

    if (!derivedCookie) {
        return null;
    }

    console.log("cookie", derivedCookie.split("=")[1]);

    return derivedCookie.split("=")[1];
};

export const exchangeCodeForToken = async (
    code: string,
): Promise<{ access_token: string }> => {
    const tokenUrl = "https://oauth2.googleapis.com/token";
    const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: `http://localhost:3000${REDIRECT_URL}`,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
        }).toString(),
    });

    if (!response.ok) {
        throw new Error("Something went wrong!");
    }

    return response.json();
};

export const getUserInfo = async (
    accessToken: string,
): Promise<{ email: string }> => {
    const response = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );

    return response.json();
};
