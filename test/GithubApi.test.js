const agent = require('superagent-promise')(require('superagent'), Promise);
const responseTime = require('superagent-response-time');
const statusCode = require('http-status-codes');
const { expect } = require('chai');
chai.use(require('chai-json-schema'));

const githubUserName = 'DanisaurioRex';

describe('Github Api Test', () => {
  describe('Authentication', () => {
    it('Via OAuth2 Tokens (sent in a header)', () => agent.get(`https://api.github.com/repos/${githubUserName}/psl-workshop-api-testing-js`)
      .auth('token', process.env.ACCESS_TOKEN)
      .then((response) => {
        expect(response.status).to.equal(statusCode.OK);
        expect(response.body.description).equal('This is a Workshop about Api Testing in JavaScript');
      }));

    it('Via OAuth2 Token (sent as a parameter)', () => {
      const query = {
        token: process.env.ACCESS_TOKEN
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
    it('Get branches', () => {
      agent.get(`https://api.github.com/repos/${githubUserName}/psl-workshop-api-testing-js`)
        .auth('token', process.env.ACCESS_TOKEN)
        .then((response) => {
          expect(response.status).to.equal(statusCode.OK);

          return agent.get(response.body.branches_url.replace('{/branch}', '/project-setup'))
            .auth('token', process.env.ACCESS_TOKEN)
            .then((newResponse) => {
              expect(newResponse.status).to.equal(statusCode.OK);
            });
        });
    });
  });

  describe('Schema', () => {
    it('Get repo', () => {
      const repoSchema = {
        title: 'Github repo schema v1',
        type: 'object',
        required: ['name', 'owner'],
        properties: {
          owner: {
            type: 'object',
            properties: {
              login: {
                type: 'string'
              },
              id: {
                type: 'number',
                minimum: 1
              },
              url: {
                pattern: `^(http|https)://[A-Za-z0-9 -_]+.[A-Za-z0-9 -_]+/${githubUserName}$`
              }
            }
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          html_url: {
            format: 'uri'
          }
        }
      };

      return agent.get(`https://api.github.com/repos/${githubUserName}/psl-workshop-api-testing-js`)
        .auth('token', process.env.ACCESS_TOKEN)
        .then((response) => {
          expect(response.status).to.equal(statusCode.OK);
          expect(response.body).to.be.jsonSchema(repoSchema);
        });
    });
  });

  it('Diferent Content-Type', () => {
    const contentType = 'application/zip';

    return agent.get(`https://api.github.com/repos/${githubUserName}/psl-workshop-api-testing-js/zipball/project-setup`)
      .set('Content-Type', contentType)
      .auth('token', process.env.ACCESS_TOKEN)
      .then((response) => {
        expect(response.status).to.equal(statusCode.OK);
        expect(response.type).to.equal(contentType);
      });
  });

  it('Timeout', () => {
    const maxTimeOut = 1000;

    return new Promise(function (resolve) {
      agent.get(`https://api.github.com/repos/${githubUserName}/psl-workshop-api-testing-js/zipball/project-setup`)
        .set('Content-Type', 'application/zip')
        .auth('token', process.env.ACCESS_TOKEN)
        .use(responseTime((req, time) => {
          resolve(time);
        }))
        .then(() => 0);
    }).then((time) => {
      expect(time).to.below(maxTimeOut);
    });
  });
});
