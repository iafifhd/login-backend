const path = require('path');
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    app: {
      name: 'login-backend'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/login-backend-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'login-backend'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/login-backend-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'login-backend'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/login-backend-production'
  }
};

module.exports = config[env];
