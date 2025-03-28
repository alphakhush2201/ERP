# Neon Tech PostgreSQL Migration Guide

## Overview

This document outlines the migration process from SQLite to Neon Tech PostgreSQL for the School ERP system. Neon Tech provides a serverless PostgreSQL database service that offers better scalability, reliability, and performance compared to SQLite.

## Prerequisites

1. A Neon Tech account (sign up at https://neon.tech)
2. Node.js and npm installed
3. Access to the School ERP codebase

## Environment Variables

The following environment variables need to be set in your `.env` file:

```
DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"
DIRECT_URL="postgresql://username:password@hostname/database?sslmode=require"
```

- `DATABASE_URL`: Connection string for the Neon Tech PostgreSQL database (with connection pooling)
- `DIRECT_URL`: Direct connection string for migrations (without connection pooling)

## Database Migration Steps

1. **Create a Neon Tech Project**
   - Sign up or log in to Neon Tech
   - Create a new project
   - Get the connection string from the project dashboard

2. **Update Environment Variables**
   - Add the Neon Tech connection strings to your `.env` file

3. **Install Required Dependencies**
   - The project already has the necessary PostgreSQL dependencies:
     - `pg`: PostgreSQL client for Node.js
     - `@neondatabase/serverless`: Neon Tech serverless driver

4. **Initialize the Database**
   - Run the database initialization script:
     ```
     node init-db.js
     ```

5. **Test the Connection**
   - Start the application:
     ```
     npm run dev
     ```
   - Verify that the application can connect to the database

## Code Changes

The following files have been updated to use PostgreSQL instead of SQLite:

1. **Database Utilities**
   - Created a new database utility file (`utils/db.js`) for PostgreSQL connections

2. **API Endpoints**
   - Updated all API endpoints to use PostgreSQL instead of SQLite
   - Modified SQL queries to use PostgreSQL syntax and parameterized queries

3. **Database Initialization**
   - Updated the database initialization script to create PostgreSQL tables

## PostgreSQL vs SQLite Syntax Differences

1. **Parameterized Queries**
   - SQLite: Uses `?` placeholders (e.g., `WHERE id = ?`)
   - PostgreSQL: Uses `$1`, `$2`, etc. (e.g., `WHERE id = $1`)

2. **Data Types**
   - SQLite: Uses simplified types (INTEGER, TEXT, etc.)
   - PostgreSQL: Uses more specific types (SERIAL, VARCHAR, TIMESTAMP, etc.)

3. **Auto-incrementing IDs**
   - SQLite: `INTEGER PRIMARY KEY AUTOINCREMENT`
   - PostgreSQL: `SERIAL PRIMARY KEY`

4. **Boolean Values**
   - SQLite: Uses INTEGER (0/1)
   - PostgreSQL: Uses native BOOLEAN type

5. **String Concatenation**
   - SQLite: Uses `||` operator
   - PostgreSQL: Uses `CONCAT()` function

## Troubleshooting

1. **Connection Issues**
   - Verify that the DATABASE_URL is correct
   - Check that SSL is properly configured
   - Ensure the database user has the necessary permissions

2. **Migration Errors**
   - Check the PostgreSQL syntax in your queries
   - Verify that all table schemas are properly defined

3. **Performance Issues**
   - Consider adding indexes to frequently queried columns
   - Use connection pooling for better performance

## Benefits of Neon Tech PostgreSQL

1. **Scalability**: Automatically scales with your application's needs
2. **Reliability**: Managed service with automatic backups and high availability
3. **Performance**: Optimized for cloud environments with fast query execution
4. **Features**: Full PostgreSQL feature set including advanced data types, indexes, and constraints
5. **Cost-effective**: Pay only for what you use with serverless pricing model