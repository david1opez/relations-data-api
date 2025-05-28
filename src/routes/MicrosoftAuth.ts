// HELPER FUNCTIONS
import { Error, SendResponse } from "../utils/utils";

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
        .then((data: {
            access_token: string,
            expires_in: number,
            ext_expires_in: number,
            id_token: string,
            scope: string,
            token_type: string
        }) => {
            if (!data.access_token) {
                return Error(res, 400, 'Failed to obtain access token');
            }

            fetch("https://graph.microsoft.com/v1.0/me", {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${data.access_token}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then((profile: {
                "@odata.context": string;
                userPrincipalName: string;
                id: string;
                displayName: string;
                surname: string;
                givenName: string;
                preferredLanguage: string;
                mail: string | null;
                mobilePhone: string | null;
                jobTitle: string | null;
                officeLocation: string | null;
                businessPhones: string[];
            }) => {
                SendResponse(res, 200, { profile, tokens: data });
            })
            .catch(err => {
                Error(res, 400, err);
            });
        })
        .catch(err => {
            Error(res, 400, err);
        });
    } catch (err) {
        Error(res, 500, err);
    }
};
 