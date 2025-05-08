import { Parameters } from '@org.quicko/core';
import { config as envConfig } from 'dotenv';
import { resolve } from 'path';

envConfig({
  path: resolve(__dirname, `./environment/${process.env.NODE_ENV?.trim()}.env`),
});

export default {
  parameters: new Parameters(),
};
