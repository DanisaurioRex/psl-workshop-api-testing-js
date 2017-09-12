const agent = require('superagent-promise')(require('superagent'), Promise);
const statusCode = require('http-status-codes');
const chai = require('chai');

const { expect } = { expect: chai.expect };

const githubUserName = 'DanisaurioRex';

describe('Github Api Test', () => {
  describe('Authentication', () => {
    it('Via OAuth2 Tokens (sent in a header)', () => agent.get(`https://api.github.com/repos/${githubUserName}/psl-workshop-api-testing-js`)
      .auth('token', process.env.GITHUB_PERSONAL_ACCESS_TOKEN)
      .then((response) => {
        expect(response.status).to.equal(statusCode.OK);
        expect(response.body.description).equal('This is a Workshop about Api Testing in JavaScript');
      }));

    it('Via OAuth2 Token (sent as a parameter)', () => {
      const query = {
        token: '31bb789a35b0ff62696ca5a26c1f50534d043e5f'
      };

      return agent.get(`https://api.github.com/repos/${githubUserName}/psl-workshop-api-testing-js`)
        .query(query)
        .then((response) => {
          expect(response.status).to.equal(statusCode.OK);
          expect(response.body.description).equal('This is a Workshop about Api Testing in JavaScript');
        });
    });
  });

  describe('Hypermedia', () => {
    it('Get branches', () => agent.get(`https://api.github.com/repos/${githubUserName}/psl-workshop-api-testing-js`)
      .auth('token', process.env.GITHUB_PERSONAL_ACCESS_TOKEN)
      .then((response) => {
        expect(response.status).to.equal(statusCode.OK);

        return agent.get(response.body.branches_url.replace('{/branch}', '/project-setup'))
          .auth('token', process.env.GITHUB_PERSONAL_ACCESS_TOKEN)
          .then((newResponse) => {
            expect(newResponse.status).to.equal(statusCode.OK);
          });
      }));
  });
});
