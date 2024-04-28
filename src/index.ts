import express, { Request, Response } from "express";
import crypto from "crypto";
import { PORT, AUTH_STATE, REDIRECT_URL } from "./constants";
import { exchangeCodeForToken, getCookie, getUserInfo } from "./utils";

const CLIENT_ID = process.env.CLIENT_ID || "";

const app = express();

app.use(express.static("static"));

app.get("/oauth/google", (_: any, res: Response) => {
    const params = new URLSearchParams();
    const state = crypto.randomBytes(16).toString("hex");

    params.set("response_type", "code");
    params.set("client_id", CLIENT_ID);
    params.set("redirect_uri", `http://localhost:3000${REDIRECT_URL}`);
    params.set("scope", "email");
    params.set("state", state);

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    res.set(
        "Set-Cookie",
        `${AUTH_STATE}=${state}; HttpOnly; Secure; SameSite=Lax`,
    );
    res.redirect(url);
});

app.get(REDIRECT_URL, async (req: Request, res: Response) => {
    const { code, state } = req.query;

    const oauthState = getCookie(AUTH_STATE, req.headers.cookie as string);

    if (state !== oauthState) {
        return res.status(400).send("Invalid state");
    }

    const accessTokenJson = await exchangeCodeForToken(code as string);
    const accessToken = accessTokenJson?.access_token;
    const userInfo = await getUserInfo(accessToken);

    res.header("Content-Type", "application/json").send(
        JSON.stringify(userInfo),
    );
});

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`);
});
