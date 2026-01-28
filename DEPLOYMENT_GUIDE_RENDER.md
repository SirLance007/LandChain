# Landchain Deployment Guide - Render

This guide will help you deploy the Landchain application (Frontend + Backend) to Render using the created `render.yaml` Blueprint.

## Prerequisites

1.  **GitHub Repository**: Ensure your project is pushed to a GitHub repository.
2.  **Render Account**: Create an account on [render.com](https://render.com).
3.  **Environment Variables**: Have the following ready:
    *   `MONGODB_URI`: Connection string from MongoDB Atlas.
    *   `PINATA_API_KEY` & `PINATA_SECRET_KEY`: For IPFS.
    *   `CONTRACT_ADDRESS`: Deployed contract address.
    *   `MONAD_RPC_URL`: RPC URL for the blockchain.
    *   `PRIVATE_KEY`: Private key for the wallet (Server wallet).
    *   `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: For Google Auth.

## Step 1: Push Code to GitHub

Ensure the new `render.yaml` file is committed and pushed to your repository.

```bash
git add render.yaml
git commit -m "Add Render deployment blueprint"
git push origin main
```

## Step 2: Create New Blueprint on Render

1.  Log in to your [Render Dashboard](https://dashboard.render.com).
2.  Click on the **"New +"** button and select **"Blueprint"**.
3.  Connect your GitHub account if you haven't already.
4.  Select the **landchain** repository.
5.  Give your service group a name (e.g., `landchain-production`).

## Step 3: Configure Environment Variables

Render will detect the `render.yaml` file and ask you to fill in the values for the environment variables marked as `sync: false`.

Fill in the following:

*   **MONGODB_URI**: Paste your MongoDB connection string.
    *   *Tip: Ensure your MongoDB Access List allows IP `0.0.0.0/0` (Allow Access from Anywhere) since Render IPs change.*
*   **PINATA_API_KEY**: Your Pinata API Key.
*   **PINATA_SECRET_KEY**: Your Pinata Secret Key.
*   **CONTRACT_ADDRESS**: The address of your Smart Contract.
*   **MONAD_RPC_URL**: The blockchain RPC URL.
*   **PRIVATE_KEY**: Your wallet private key (BE CAREFUL! Never share this).
*   **GOOGLE_CLIENT_ID**: OAuth Client ID from Google Cloud Console.
*   **GOOGLE_CLIENT_SECRET**: OAuth Client Secret.

> Note: `SESSION_SECRET` will be auto-generated. `FRONTEND_URL` and `REACT_APP_API_URL` will be auto-linked.

## Step 4: Deploy

1.  Click **"Apply"** or **"Create Blueprint"**.
2.  Render will verify the configuration and start deploying both the Backend and Frontend.
3.  You can watch the logs for both services in the dashboard.

## Step 5: Final Checks

1.  Wait for both services to show a Green "Live" status.
2.  **Backend**: Visit the backend URL (e.g., `https://landchain-backend.onrender.com/health`) to confirm it's running.
3.  **Frontend**: Visit the frontend URL. Try logging in and viewing lands to ensure the connection to the backend and database is working.

## Troubleshooting

*   **Build Failures**: Check the logs. If a dependency is missing, ensure it's in `package.json`.
*   **Connection Errors**:
    *   Check if `REACT_APP_API_URL` is set correctly in the Frontend "Environment" tab on Render.
    *   Check MongoDB Network Access (whitelist IP).
    *   Check Google OAuth "Authorized redirect URIs". You MUST add the new Backend URL callback path (e.g., `https://landchain-backend-xxxx.onrender.com/api/auth/google/callback`) to your Google Cloud Console.
