# node-seed
PacBio Seed for Node with JWT Security

[![Build Status](https://cdn.rawgit.com/salsanfilippo/pacbio/master/public/img/build-passed.svg)](https://github.com/pacbiodev/node-seed)
> Minimal setup of NodeJS server with support for authentication and user identity managment using JSON Web Tokens ([JWT](http://jwt.io), [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)). Logins are validated against LDAP and cached locally. If LDAP is unavailable, a user will be authenticated against the local cache (assuming they have successfully logged into LDAP in the past). This is a Typescript project.

#### JWT
A JSON Web Token, or JWT, is used to send information that can be verified and trusted by means of a digital signature. It comprises a compact and URL-safe JSON object, which is cryptographically signed to verify its authenticity, and which can also be encrypted if the payload contains sensitive information.

Because of it’s compact structure, JWT is usually used in HTTP Authorization headers or URL query parameters.

##### JWT Token
```
eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJjb250ZXh0Ijp7ImlkIjoiNTU2Nzk0ODEzYWFjNTEwMmZmM2UwYmVlIiwidXNlck5hbWUiOiJsYWJ0ZWNoIiwiZW1haWwiOiIiLCJmaXJzdE5hbWUiOiJMYWIiLCJsYXN0TmFtZSI6IlRlY2giLCJtb2RpZmllZCI6IjIwMTUtMDYtMTFUMTk6NTk6MzYuNTU5WiJ9LCJpYXQiOjE0MzQwNTI5NzQsImV4cCI6MTQzNDA2NzM3NCwiaXNzIjoicGFjaWZpY2Jpb3NjaWVuY2VzLmNvbSIsInN1YiI6ImxhYnRlY2gifQ.FUa0eUei7VDup__c6qu6cHUkHuV73k4nRT1TDa6yoEyoLuvq086tc7WezVScZ_ESc4xuq4idzuoptXMKPNZ1xG3IfbJDy6CozAKX3W1JXwnwVs-n7d83rIf-v6PRTpWMehAaphRlTgqYXFZIP9Y5QYcR60rDiLznkSSPraaz0CY
```

##### The Header
```
{
  "typ": "JWT",
  "alg": "RS256"
}
```

##### The Body
```
{
  "context": {
    "id": "556794813aac5102ff3e0bee",
    "userName": "labtech",
    "email": "",
    "firstName": "Lab",
    "lastName": "Tech",
    "modified": "2015-06-11T19:59:36.559Z"
  },
  "iat": 1434052974,
  "exp": 1434067374,
  "iss": "pacificbiosciences.com",
  "sub": "labtech"
}
```
The claims body is where the JWT really shines. It tells us:
- Who the user is (sub)
- Who issued this token (iss)
- When it was created (iat)
- When it expires (exp)
- Who is this user (context) - this is a private claim


##### Hashing Token with RSA SHA256
```
 RSASHA256(
    base64UrlEncode(header) + "." +
    base64UrlEncode(payload),
    publicKey,
    privateKey
  )
```

##### Public Key [![*](https://github.com/pacbiodev/resources/blob/master/images/warning.png)](#)
```
-----BEGIN CERTIFICATE-----
MIIDRDCCAq2gAwIBAgIJAIgHkZiVGzKZMA0GCSqGSIb3DQEBCwUAMIG6MQswCQYD
VQQGEwJVUzETMBEGA1UECAwKQ2FsaWZvcm5pYTETMBEGA1UEBwwKTWVubG8gUGFy
azEcMBoGA1UECgwTUGFjaWZpYyBCaW9zY2llbmNlczELMAkGA1UECwwCSVQxIzAh
BgNVBAMMGmRldi5wYWNpZmljYmlvc2NpZW5jZXMuY29tMTEwLwYJKoZIhvcNAQkB
FiJzc2FuZmlsaXBwb0BwYWNpZmljYmlvc2NpZW5jZXMuY29tMB4XDTE1MDUwNzE4
MDczN1oXDTIwMDUwNTE4MDczN1owgboxCzAJBgNVBAYTAlVTMRMwEQYDVQQIDApD
YWxpZm9ybmlhMRMwEQYDVQQHDApNZW5sbyBQYXJrMRwwGgYDVQQKDBNQYWNpZmlj
IEJpb3NjaWVuY2VzMQswCQYDVQQLDAJJVDEjMCEGA1UEAwwaZGV2LnBhY2lmaWNi
aW9zY2llbmNlcy5jb20xMTAvBgkqhkiG9w0BCQEWInNzYW5maWxpcHBvQHBhY2lm
aWNiaW9zY2llbmNlcy5jb20wgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBANzb
hO9jUOh2kYx0QEK1Ds0K4nVVlJsCc5GcDsXqjJrbfQ9lz6WcXzW0gFnV8EGGLzWs
doXqz+bmMYU4x93KJ/B50sgEIptr0gjr3C1Io+Z3FuKqUZur9LTBd9Sv/mphSNgW
/QjG5VRZy99Fs4jrmtVTqPyQvMurAMIzr/MPgnjlAgMBAAGjUDBOMB0GA1UdDgQW
BBT4+FjyfJQ/GlllmsfLtk3rJJGn1jAfBgNVHSMEGDAWgBT4+FjyfJQ/GlllmsfL
tk3rJJGn1jAMBgNVHRMEBTADAQH/MA0GCSqGSIb3DQEBCwUAA4GBAASCHsFV2GLq
VnysumnrkEVz7Od6V9XydUEyj3J41ICpM4/TiJg7tXtg8j4jtPHKCmGJXmyVBuv9
HBWtu07m8qDhlbvNlPU5mTlITkzFNTQCeuIb0FEjXhnBeKooEK94CF/39+caIVnd
xt5ep2RMXY3HMltdrGOB8mjKkpC1b8Ei
-----END CERTIFICATE-----
```

##### Private Key [![*](https://github.com/pacbiodev/resources/blob/master/images/warning.png)](#)
```
-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQDc24TvY1DodpGMdEBCtQ7NCuJ1VZSbAnORnA7F6oya230PZc+l
nF81tIBZ1fBBhi81rHaF6s/m5jGFOMfdyifwedLIBCKba9II69wtSKPmdxbiqlGb
q/S0wXfUr/5qYUjYFv0IxuVUWcvfRbOI65rVU6j8kLzLqwDCM6/zD4J45QIDAQAB
AoGABP6J0QgD6l3UCMMQOPHzNbvLRy/6Pk8d4esPgnY9W7se5tw8h9gzZvl/9Yga
+MBaDPKrc3fN38DQ2dxg2Kkbog+8nRt5MgEsqx1cypohCFkf++6tuicb2Lns+eLF
/yCCOMjCQAtHBQiiwJMxqn5qAxJiNUQAQdQ75EbVcaSoU3kCQQD1zihwaSk1/JAl
ZQTmkyXqDGg1lCyDsR2jZ9zuwkIKM+aUUAnm4sAdTo/qeDie+A8CxAD0qjUbJcB2
m3SjsxGPAkEA5gR6QBDxSF+dC5PWsOXUj79TpdtY5vf1ePmLUVHwoXjotD7+nHU5
b0/X1HQGss9uJoZh1dmdCox+rTx8rRxsSwJAXwxu+rjPZL7bBnq/oGF6IbzWdxFq
/Sl56nv5JKIdY1CacvNYQN2hqDN+1w3R5zbIpysfq3w9uNeqSrLmMX7G5QJAS5bT
GfS3ZiJNuL1Hw3Bz7x1f/tRbneOEntHbD8lOu7HBP2KoR4BadJMXiXDrtp1mRHDK
+/z8l7fd9U44Zqc9iwJBAMPKlIQx7jBEyLVd19vKf1/Q4unjrD7DP6PD2jOBH1Kf
BeClSJgv+geUctyt6g0V/bGrLOj6ql5luJmBrbA5BjI=
-----END RSA PRIVATE KEY-----
```
Because we’ve signed this token, we can trust this information (**after verifying** the signature). With this trust, our sever can get on with the task of resolving the request accordingly – no need to hit your database for this information!

[![*](https://github.com/pacbiodev/resources/blob/master/images/warning.png)](#) You should **NEVER** use these keys. They are for reference purpose only. Before deploying your server, procure a certificate (either self-signed or from certificate authority). Clients of this server application only need the public key to verify tokens (most clients will only hold the token in local storage or cookie and just pass to the server APIs). The private key is only required on the server and should be safeguarded.


#### Setup
----------
Clone this repo and setup the following tools on your machine:

- [NPM](https://www.npmjs.com/package/npm) - A package manager for JavaScript.
- [Node](http://nodejs.org) - Used for a variety of things: update/install project dependencies, webserver, etc.
- [Gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md) - Streaming build system.
- [TSD](https://www.npmjs.com/package/tsd) - A package manager to search and install TypeScript definition files directly from the community driven DefinitelyTyped repository.
- [Typescript 1.5](http://www.typescriptlang.org/#Download) - Offers classes, modules, and interfaces to help you build robust components.
- [MongoDB](https://www.mongodb.org/downloads) - Datbase server used to cache logins locally.

Once you have the tools setup install all dependencies by running:
```shell
npm install
```

Now start the webserver (available at `localhost:3000` by default) and the build process (runs on file change):

```shell
gulp play # Build, copy files and start server, `gulp debug` to start node in debug mode
```

#### Learning Material
----------------------
- [NodeJS](https://nodejs.org/)
- JWT
    - [IETF Internet Standards Track document](http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html)
    - [Claims](http://www.iana.org/assignments/jwt/jwt.xhtml#claims)
- [Typescript Playground](http://www.typescriptlang.org/Playground)
