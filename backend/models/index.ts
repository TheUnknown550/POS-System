import fs from 'fs';
import path from 'path';
import { Sequelize, DataTypes, ModelCtor, Model } from 'sequelize';
import process from 'process';

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// Adjust this to import your config properly (json or .ts)

import configJson from '../config/config.json';

import type { Dialect } from 'sequelize';
type ConfigType = {
  [key: string]: {
    username: string;
    password: string | null;
    database: string;
    host: string;
    dialect: Dialect;
    use_env_variable?: string;
    [key: string]: any;
  };
};

const config: ConfigType[string] = (configJson as ConfigType)[env];

interface DB {
  [key: string]: ModelCtor<Model<any, any>> | any;
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
}

const db = {} as DB;

let sequelize: Sequelize;

// Ensure password is undefined if null for Sequelize options
const configOptions = { ...config, password: config.password === null ? undefined : config.password };

if (config.use_env_variable) {
  const connectionString = process.env[config.use_env_variable];
  if (!connectionString) {
    throw new Error(`Environment variable ${config.use_env_variable} not set`);
  }
  sequelize = new Sequelize(connectionString, configOptions);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password === null ? undefined : config.password,
    configOptions
  );
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      (file.endsWith('.ts') || file.endsWith('.js')) &&  // support ts files too
      !file.endsWith('.test.ts') &&
      !file.endsWith('.test.js')
    );
  })
  .forEach(file => {
    // Import model as a function accepting (sequelize, DataTypes) and returning ModelCtor<Model>
    // We use dynamic import with require because ES import is async, or use require here.
    // This may require adjusting your tsconfig or build tool to allow require in ts files.
    // Alternatively, switch to async dynamic import.
    // For simplicity, keeping require:
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const modelImport = require(path.join(__dirname, file));
    // modelImport may be default or module exports, adjust accordingly:
    const model = typeof modelImport === 'function'
      ? modelImport(sequelize, DataTypes)
      : modelImport.default(sequelize, DataTypes);

    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
