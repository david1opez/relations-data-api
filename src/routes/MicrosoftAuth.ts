// HELPER FUNCTIONS
import { Error, SendResponse } from "../utils/express/utils";

// TYPES
import { Request, Response } from 'express';

export default async function Home(req: Request, res: Response) {
    const { code } = req.query;

    if(!code) {
        return Error(res, 400, 'Missing code query parameter');
    };

    try {
        await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: process.env.MSFT_CLIENT_ID || '',
                scope: 'openid profile User.Read',
                code: code as string,
                redirect_uri: process.env.MSFT_REDIRECT_URL || '',
                grant_type: 'authorization_code',
                client_secret: process.env.MSFT_CLIENT_SECRET || ''
            })
        })
        .then(response => response.json())
        .then(data => {
            SendResponse(res, 200, data);
        })
        .catch(err => {
            Error(res, 400, err);
        });
    } catch (err) {
        Error(res, 500, err);
    }
};
 