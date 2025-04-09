const mongoose = require('mongoose');

beforeAll(async () => {
});

afterAll(async () => {
});

global.console = {
  ...console,
  // Uncomment to silence logs during tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};