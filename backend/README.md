<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository with MySQL database, JWT authentication, role-based access control (RBAC), and permission system.

## Features

- **Authentication & Authorization**: JWT-based authentication with role and permission-based access control
- **Database**: MySQL with TypeORM for database management
- **Swagger Documentation**: Auto-generated API documentation
- **Role Management**: Create, update, and manage user roles
- **Permission System**: Granular permission control for fine-grained access
- **Database Seeding**: Automatic seeding of initial roles, permissions, and superadmin user

## Role & Permission System

This application implements a comprehensive role-based access control (RBAC) system:

### Default Roles
- **SUPERADMIN**: Full system access with all permissions
- **ADMIN**: Administrative access with most permissions
- **RETAILER**: Retailer-specific permissions for managing products and orders
- **USER**: Basic user access

### Permission Categories
- **User Management**: Create, read, update, delete users
- **Role Management**: Manage roles (SUPERADMIN only)
- **Permission Management**: Manage permissions (SUPERADMIN only)
- **Retailer Operations**: Product and order management
- **Admin Operations**: System settings and retailer management

### Access Control
- Only **SUPERADMIN** users can create, update, or delete roles and permissions
- Users must have specific permissions to access protected endpoints
- The system supports both role-based and permission-based access control

## Environment Setup

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=nestjs_rbac_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Application Configuration
NODE_ENV=development
PORT=3000

# Seeding Configuration
ENABLE_SEEDING=true
SUPERADMIN_EMAIL=admin@example.com
SUPERADMIN_PASSWORD=Admin123!
SUPERADMIN_FIRSTNAME=Super
SUPERADMIN_LASTNAME=Admin
```

## Project setup

```bash
# Install dependencies
$ npm install

# Create database (make sure MySQL is running)
$ npm run db:create

# Start the application (this will automatically seed the database)
$ npm run start:dev
```

## Database Setup

1. Make sure MySQL is installed and running
2. Create a `.env` file with your database credentials (see Environment Setup above)
3. Run the database creation script: `npm run db:create`
4. Start the application in development mode: `npm run start:dev`

The application will automatically create tables and seed initial data including:
- Default roles (SUPERADMIN, ADMIN, RETAILER, USER)
- All available permissions
- A superadmin user (credentials from your .env file)

## API Documentation

Once the application is running, visit:
- **Swagger UI**: `http://localhost:3001/api`
- **OpenAPI JSON**: `http://localhost:3001/api-json`

## Authentication

### Login
```bash
POST /auth/login
{
  "email": "admin@example.com",
  "password": "Admin123!"
}
```

### Register
```bash
POST /auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123!"
}
```

## Role & Permission Management

### Create Role (SUPERADMIN only)
```bash
POST /roles
Authorization: Bearer <token>
{
  "name": "custom-role",
  "displayName": "Custom Role",
  "description": "A custom role with specific permissions",
  "permissionIds": ["permission-uuid-1", "permission-uuid-2"]
}
```

### Create Permission (SUPERADMIN only)
```bash
POST /permissions
Authorization: Bearer <token>
{
  "name": "custom:permission",
  "displayName": "Custom Permission",
  "description": "A custom permission",
  "category": "custom"
}
```

### Get All Roles
```bash
GET /roles
Authorization: Bearer <token>
```

### Get All Permissions
```bash
GET /permissions
Authorization: Bearer <token>
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
