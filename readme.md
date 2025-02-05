# Auth Back-End

## Profile

Project Title: nodejs-auth-oauth-jwt

## Installation

### Prerequisites

Before installing, ensure you have the following prerequisites installed on your system:

- **Node.js**: The project requires Node.js to run. You can download it from Node.js official website.
- **npm**: npm (Node Package Manager) is used to manage the dependencies and should come installed with Node.js.

### Installing Dependencies

To set up the project for development on your local machine, please follow the steps below:

1. First, clone this repository to your local machine using Git commands. For example:

```bash
   git clone https://github.com/kevinvinn/nodejs-auth-oauth-jwt.git
    cd auth
```

2. Run the following command in the root directory of the project to install all necessary dependencies:

   `npm install`

## Starting the App

### Running the Application

Once the installation is complete, you can start the application using one of the following methods:

1. **npm**

   Automatically start using **nodemon** (if you have installed all the required dependencies and configured the value of "start" under the "scripts" to "nodemon app.js" in `package.json` file).

   `npm start`

2. **Directly using Node.js or nodemon**

   `node index.js` or `nodemon index.js`

## Configuring .env

1. Set the `DATABASE_URL` value to your own database information.
2. Set the value of `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to your own Google Client. This is to be used as the OAuth authentication.
3. Provide secure `JWT_SECRET` by running this on your terminal: `node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"`. Then, copy and paste the output as the value of `JWT_SECRET`. However, since you will try this on your local machine, it's fine to use the default value as the `JWT_SECRET`
4. `SESSION_SECRET` applies the same as `JWT_SECRET`
5. Set the `EMAIL_USER` to your own gmail address.
6. Set the `EMAIL_PASS` to your own gmail app password.

## Database

1. Run `npx prisma migrate dev` in the **auth/** directory.
2. Wait for the database migration to be completed.
3. Tara, your database is ready!
4. Ta-da, you have some data in your database!
