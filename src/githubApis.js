import GitHubApi from 'github';
import config from 'config';

const github = new GitHubApi({
  protocol: 'https',
  Promise,
  followRedirects: false,
  timeout: 5000,
});

github.authenticate({
  type: 'oauth',
  token: config.token,
});

export default github;
