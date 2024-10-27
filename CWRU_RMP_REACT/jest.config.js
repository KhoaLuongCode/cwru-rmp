// jest.config.js
require('dotenv').config({ path: '.env.test' });

module.exports = {
    transform: {
      "^.+\\.[jt]sx?$": "babel-jest"
    },
    moduleNameMapper: {
        '\\.css$': 'identity-obj-proxy',
    },
    testEnvironment: "jsdom",
    transformIgnorePatterns: ["/node_modules/"],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    
  };
  