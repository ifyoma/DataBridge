

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
    secret: '3137fca3-ff2a-44f3-8404-a0cd8433ad93',
    
    resave: false,
    saveUninitialized: true
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create MSAL application object
const pca = new msal.ConfidentialClientApplication({
    auth: {
        clientId: '855c171d-2610-4761-90c2-3ea99780167d', // Use client ID from environment variable
        authority: 'https://login.microsoftonline.com/e82f3871-a94d-4de0-9abd-c8b5645354da', // Use authority from environment variable
        clientSecret: 'PrE8Q~kc9p1zd3TFyuqGhoNNtu~sfH551aseadgr', // Use client secret from environment variable
        knownAuthorities: ['https://login.microsoftonline.com/e82f3871-a94d-4de0-9abd-c8b5645354da'],
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
    res.send('<!DOCTYPE html><html lang="en"><head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>DataBridge Logistics Ltd. | Portal</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet"/>
</head>
<body class="bg-blue-50 font-sans">

  <!-- Header -->
  <header class="bg-gradient-to-r from-blue-800 to-indigo-800 text-white p-6 shadow-md">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <h1 class="text-2xl font-bold">DataBridge Logistics Ltd.</h1>
      <nav class="space-x-6 text-sm font-medium">
        <a href="#home" class="hover:text-yellow-300">Home</a>
        <a href="#about" class="hover:text-yellow-300">About Us</a>
        <a href="#who" class="hover:text-yellow-300">Who We Are</a>
        <a href="#what" class="hover:text-yellow-300">What We Do</a>
        <a href="#dashboard" class="hover:text-yellow-300">Dashboard</a>
        <a href="login.html" class="hover:text-yellow-300">Login</a>
        <a href="#faqs" class="hover:text-yellow-300">FAQs</a>
        <a href="#contact" class="hover:text-yellow-300">Contact</a>
      </nav>
    </div>
  </header>

  <!-- Hero / Home -->
  <section id="home" class="text-center py-20 bg-gradient-to-r from-blue-100 to-white">
    <div class="max-w-4xl mx-auto px-6">
      <h2 class="text-4xl font-bold text-blue-900 mb-4">Empowering Global Logistics</h2>
      <p class="text-lg text-gray-700 mb-6">Secure. Scalable. Compliant. The future of logistics starts here.</p>
      <a href="#login" class="bg-blue-700 hover:bg-blue-900 text-white px-6 py-3 rounded-full shadow-lg transition">Get Started</a>
    </div>
  </section>

  <!-- Who We Are -->
  <section id="who" class="bg-white py-16">
    <div class="max-w-6xl mx-auto px-6 text-center">
      <h2 class="text-3xl font-bold text-indigo-800 mb-4">Who We Are</h2>
      <p class="text-gray-700 text-lg">A future-ready logistics technology company in Rotterdam, building secure, compliant digital systems for global trade.</p>
    </div>
  </section>

  <!-- What We Do -->
  <section id="what" class="py-16 bg-gradient-to-r from-indigo-50 to-blue-50">
    <div class="max-w-6xl mx-auto px-6">
      <h2 class="text-3xl font-bold text-indigo-900 mb-6 text-center">What We Do</h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-xl shadow hover:shadow-xl border-t-4 border-blue-500">
          <h3 class="text-xl font-semibold text-blue-700 mb-2">Shipment Tracking</h3>
          <p class="text-gray-600">Live status and history of shipments with secure role-based access.</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow hover:shadow-xl border-t-4 border-indigo-500">
          <h3 class="text-xl font-semibold text-indigo-700 mb-2">Compliance Reporting</h3>
          <p class="text-gray-600">Built-in GDPR, ISO 27001, and NIS2 audit capabilities.</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow hover:shadow-xl border-t-4 border-green-500">
          <h3 class="text-xl font-semibold text-green-700 mb-2">Document Exchange</h3>
          <p class="text-gray-600">Encrypted upload/download with version control.</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow hover:shadow-xl border-t-4 border-yellow-500">
          <h3 class="text-xl font-semibold text-yellow-700 mb-2">Real-time Alerts</h3>
          <p class="text-gray-600">Instant notifications on suspicious or critical activity.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- About Us -->
  <section id="about" class="bg-white py-16">
    <div class="max-w-6xl mx-auto px-6 text-center">
      <h2 class="text-3xl font-bold text-blue-800 mb-4">About Us</h2>
      <p class="text-gray-700 text-lg">We are dedicated to revolutionizing the logistics industry through digital innovation, offering secure, scalable, and intelligent cloud platforms.</p>
    </div>
  </section>

  <!-- Dashboard -->
  <section id="dashboard" class="bg-blue-100 py-16">
    <div class="max-w-6xl mx-auto px-6">
      <h2 class="text-3xl font-bold text-blue-900 mb-6 text-center">Dashboard Overview</h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-blue-800 font-bold mb-2">Shipment Tracking</h3>
          <p class="text-gray-600">Track your packages and logistics in real-time across regions.</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-blue-800 font-bold mb-2">Activity Logging</h3>
          <p class="text-gray-600">Review audit logs of system access and changes for compliance.</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-blue-800 font-bold mb-2">Session Management</h3>
          <p class="text-gray-600">View and manage active user sessions with timeout policies.</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-blue-800 font-bold mb-2">Inventory Management</h3>
          <p class="text-gray-600">Monitor available stock and warehouse data securely.</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-blue-800 font-bold mb-2">Store Audit Logs</h3>
          <p class="text-gray-600">Access tamper-proof activity logs for incident analysis.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Login Section -->
  <section id="login" class="bg-white py-16">
    <div class="max-w-md mx-auto p-6 rounded-lg shadow-lg bg-gray-50">
      <h2 class="text-2xl font-bold text-center text-blue-800 mb-6">Secure Login</h2>
      <form class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700">Email</label>
          <input type="email" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700">Password</label>
          <input type="password" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" required>
        </div>
        <button type="submit" class="w-full bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800 transition">Login</button>
      </form>
    </div>
  </section>

  <!-- FAQs -->
  <section id="faqs" class="bg-gradient-to-r from-yellow-50 to-green-50 py-16">
    <div class="max-w-4xl mx-auto px-6 text-center">
      <h2 class="text-3xl font-bold text-indigo-800 mb-6">Frequently Asked Questions</h2>
      <div class="space-y-4 text-left">
        <div>
          <h3 class="text-blue-700 font-semibold">Is my data safe?</h3>
          <p class="text-gray-700">Yes. Our platform uses zero-trust architecture, TLS encryption, and strict access controls.</p>
        </div>
        <div>
          <h3 class="text-blue-700 font-semibold">Is this system GDPR-compliant?</h3>
          <p class="text-gray-700">Yes. Our systems follow GDPR, NIS2, and ISO/IEC 27001 standards.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer id="contact" class="bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-10">
    <div class="max-w-6xl mx-auto px-6 text-center">
      <h3 class="text-2xl font-semibold mb-2">Contact Us</h3>
      <p>Email: support@databridgelogistics.com</p>
      <p class="mt-2">&copy; 2025 DataBridge Logistics Ltd. All rights reserved.</p>
    </div>
  </footer>

</body>
</html>');
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
