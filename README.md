<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Novacrust Interview - A wallet management API built with NestJS. This application allows users to create accounts, manage wallets, fund wallets, and transfer funds between users.

## Installation

```bash
$ pnpm install
```

## Running the app

### Development

```bash
# start in development mode (watch mode with auto-reload)
$ pnpm run start:dev

# start in debug mode
$ pnpm run start:debug
```

### Production

```bash
# build the application
$ pnpm run build

# start in production mode
$ pnpm run start:prod
```

The application will be available at:
- **Local**: `http://localhost:8888`
- **API Base**: `http://localhost:8888/api/v1`
- **Swagger Documentation**: `http://localhost:8888/api/docs`

## Environment Variables

Make sure to set up the following environment variables:

```env
NODE_ENV=development
PORT=8888
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password
DATABASE_NAME=your_database_name
DATABASE_SYNC=false
```

## API Testing

### Recommended: Swagger UI

**We recommend using Swagger UI** for testing the API as it provides an interactive interface with full documentation, request/response schemas, and the ability to test endpoints directly in your browser.

Access Swagger documentation at:
- **Production**: `https://novacrust-interview-production.up.railway.app/api/docs`
- **Local Development**: `http://localhost:8888/api/docs`

Swagger UI features:
- Interactive API testing without additional tools
- Complete request/response schemas
- Built-in validation and error messages
- Try-it-out functionality for all endpoints
- Real-time API documentation

### Alternative: Postman Collection

A Postman collection is also available for those who prefer using Postman for API testing.

**Files included:**
- `Novacrust-Interview.postman_collection.json` - Complete API collection
- `Novacrust-Interview.postman_environment.json` - Local development environment
- `Novacrust-Interview-Production.postman_environment.json` - Production environment

**To use the Postman collection:**
1. Import the collection file into Postman
2. Import the environment file (choose local or production)
3. Select the appropriate environment from the dropdown
4. Start testing endpoints with pre-configured requests

**Note:** While Postman is available, we strongly recommend using Swagger UI for the best experience with this API.

## How to Use the Application

### Step 1: Access Swagger Documentation

Navigate to the Swagger documentation (recommended) or use the Postman collection:
- **Swagger (Recommended)**: 
  - Production: `https://novacrust-interview-production.up.railway.app/api/docs`
  - Local: `http://localhost:8888/api/docs`
- **Postman**: Import `Novacrust-Interview.postman_collection.json`

### Step 2: Create a User Account

1. In the Swagger UI, find the **User** section
2. Expand the `POST /api/v1/user` endpoint
3. Click "Try it out"
4. Enter your details:
   ```json
   {
     "email": "user@example.com",
     "username": "johndoe"
   }
   ```
5. Click "Execute" to create your account
6. Save the user ID from the response (you'll need it later)

### Step 3: Create a Wallet

1. In the Swagger UI, find the **Wallet** section
2. Expand the `POST /api/v1/wallet` endpoint
3. Click "Try it out"
4. Enter your username:
   ```json
   {
     "username": "johndoe"
   }
   ```
5. Click "Execute" to create your wallet
6. Your wallet will be created with a balance of 0

### Step 4: Fund Your Wallet

1. Find the `POST /api/v1/wallet/fund` endpoint
2. Click "Try it out"
3. Enter the amount and your username:
   ```json
   {
     "amount": "100.50",
     "username": "johndoe"
   }
   ```
4. Click "Execute" to add funds to your wallet
5. Your wallet balance will be updated

### Step 5: Transfer Funds (Optional)

1. Find the `POST /api/v1/wallet/transfer` endpoint
2. Click "Try it out"
3. Enter transfer details:
   ```json
   {
     "senderUsername": "johndoe",
     "receiverUsername": "janedoe",
     "amount": "50.25"
   }
   ```
4. Click "Execute" to transfer funds
5. The amount will be deducted from the sender's wallet and added to the receiver's wallet

### Additional Endpoints

- **Get User Wallet**: `GET /api/v1/wallet/{username}` - View wallet balance and details
- **Get All Users**: `GET /api/v1/user` - List all users
- **Get User by Email**: `GET /api/v1/user/by-email?email={email}` - Find user by email
- **Get User by Username**: `GET /api/v1/user/by-username/{username}` - Find user by username

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
