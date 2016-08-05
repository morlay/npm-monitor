import _ from 'lodash';
import qs from 'qs';

export const queryToSearch = (query = {}) => {
  const searchString = qs.stringify(query);

  if (_.isEmpty(searchString)) {
    return '';
  }
  return `?${searchString}`;
};


const request = (method, url, data) => ({
  url,
  method,
  headers: {
    'Content-Type': 'application/json',
  },
  data,
});

export const get = (url, query) =>
  request('GET', `${url}${queryToSearch(query)}`);
