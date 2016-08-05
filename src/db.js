import _ from 'lodash';
import low from 'lowdb';
import path from 'path';
import stringify from 'json-stringify-safe';

const dbFile = path.resolve(process.cwd(), 'data.json');

const db = low(dbFile);

export const get = (keyPath) =>
  db.get(keyPath).value();

export const set = (keyPath, data) =>
  db.set(
    keyPath,
    (_.isObject(data) || _.isArray(data)) ? JSON.parse(stringify(data)) : data
  ).value();
