

import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import * as msal from '@azure/msal-node';
import axios from 'axios';
import path from 'path';
import { SessionData } from 'express-session';

dotenv.config(); // Ensure environment variables are loaded

// Define a custom interface for the session object
interface CustomSession extends SessionData {
    isAuthenticated?: boolean;
    isAdmin?: boolean;
    isReader?: boolean;
}

const app = express();
const port = process.env.PORT || 3000;

// Configure Express session middleware
app.use(session({
    secret: process.env.SESSION_SECRET!,
    
    resave: false,
    saveUninitialized: true
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create MSAL application object
const pca = new msal.ConfidentialClientApplication({
    auth: {
        clientId: process.env.AZURE_AD_CLIENT_ID || '', // Use client ID from environment variable
        authority: process.env.AZURE_AD_AUTHORITY || '', // Use authority from environment variable
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET || '', // Use client secret from environment variable
        knownAuthorities: [process.env.AZURE_AD_AUTHORITY || ''],
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                console.log(message);
            },
            piiLoggingEnabled: false
        }
    }
});

// Route for home page
app.get('/', (req: Request, res: Response) => {
    res.send('<h1>Welcome to the Azure AD REST API!</h1><p>This is a simple REST API using TypeScript, Express, and Azure AD authentication.</p>');
});

// Route to initiate authentication
app.get('/login', async (req: Request, res: Response) => {
    const authUrl = await pca.getAuthCodeUrl({
        scopes: ['openid', 'profile', 'email'],
        redirectUri: 'https://databridge-fzd8c8gmbcd9f8h4.canadacentral-01.azurewebsites.net/auth/callback'
    });
    res.redirect(authUrl);
});

// Route to handle authentication callback
app.get('/auth/callback', async (req: Request, res: Response) => {
    const tokenRequest = {
        code: req.query.code as string,
        scopes: ['openid', 'profile', 'email'],
        redirectUri: 'https://databridge-fzd8c8gmbcd9f8h4.canadacentral-01.azurewebsites.net/auth/callback'
    };

    try {
        const response = await pca.acquireTokenByCode(tokenRequest);
        // Handle successful authentication, e.g., store token in session
        const session = req.session as CustomSession;
        session.isAuthenticated = true; // Set isAuthenticated flag in session

        // Retrieve user's group memberships from Microsoft Graph API
        const accessToken = response.accessToken;
        const graphEndpoint = 'https://graph.microsoft.com/v1.0/me/memberOf';
        const graphResponse = await axios.get(graphEndpoint, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        // Check if the user is a member of the "Admin" group
        session.isAdmin = graphResponse.data.value.some((group: any) => group.displayName === 'Admin');

        // Check if the user is a member of the "Reader" group
        session.isReader = graphResponse.data.value.some((group: any) => group.displayName === 'Reader');

        // Redirect to /widgets after successful authentication
        res.redirect('/widgets');
    } catch (error) {
        console.error('Error acquiring token:', error);
        res.status(500).send('Error acquiring token');
    }
});

// Middleware to check authentication status and authorization based on group membership
const authenticateAndAuthorize = (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated, e.g., by checking session
    const session = req.session as CustomSession;
    if (!session || !session.isAuthenticated) {
        return res.status(401).send('Unauthorized'); // User is not authenticated
    }

    next(); // Proceed to next middleware
};

// Route to get widgets (protected endpoint accessible only to authenticated and authorized users)
app.get('/widgets', authenticateAndAuthorize, async (req: Request, res: Response) => {
    // Serve widgets based on user's group membership
    const session = req.session as CustomSession;
    if (session.isAdmin) {
        // Serve widget.html for admins
        res.sendFile(path.join(__dirname, 'public', 'widget.html'));
    } else if (session.isReader) {
        // Serve widgets.html for readers
        res.sendFile(path.join(__dirname, 'public', 'widgets.html'));
    } else {
        // User is not in either group, serve an empty response
        res.send('<p>You have no widgets assigned. Kindly reach out to your administrator.</p>');
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
