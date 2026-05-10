# Deployment Guide

## Target Stack

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## Environment Variables

### Backend

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_strong_secret
JWT_EXPIRE=30d
NODE_ENV=production
CLIENT_URL=https://your-vercel-app.vercel.app
```

### Frontend

```env
VITE_API_URL=https://your-render-app.onrender.com/api
VITE_APP_NAME=RentEase
```

## MongoDB Atlas Setup

1. Create a cluster in MongoDB Atlas.
2. Add a database user.
3. Allow network access from your deployment environment.
4. Copy the connection string into `MONGO_URI`.

## Backend Deployment on Render

1. Push the repository to GitHub.
2. Create a new Web Service in Render.
3. Select the repository and set the root directory to `backend`.
4. Use `npm install` as the build command.
5. Use `npm start` as the start command.
6. Add the backend environment variables.
7. Deploy and copy the Render URL.

## Frontend Deployment on Vercel

1. Create a new project in Vercel.
2. Import the repository and set the root directory to `frontend`.
3. Use `npm run build` as the build command.
4. Set the output directory to `dist`.
5. Add the frontend environment variables.
6. Point `VITE_API_URL` to the deployed backend API.
7. Deploy and verify the app loads correctly.

## Build and Start Commands

### Local development

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Production

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
```

## Common Deployment Troubleshooting

### CORS errors
- Check `CLIENT_URL` in the backend environment.
- Make sure the frontend URL matches the deployed domain.

### Database connection errors
- Verify the MongoDB Atlas connection string.
- Check the database user credentials.
- Confirm network access is enabled in Atlas.

### Build failures
- Run `npm install` in both folders.
- Check that the required environment variables are set.
- Run `npm run build` locally before redeploying.

### Authentication issues
- Verify `JWT_SECRET` is set on the backend.
- Clear browser storage if old tokens are cached.
- Confirm the frontend is calling the deployed API URL.