# FundraiseUp Test
Node.js application divided into client and server

## Client
Makes request to the https://fundraiseup.com and reports response time to the server.
On exit, prints request sucess statistics.

## Server
Doing its' best trying to process requests from the client.
On exit, prints median and average response time reported by the client.

## Install
`npm i`

## Build
`npm run build`

## Run

### Dev
Client: `npm run dev:client`

Server: `npm run dev:server`

### Distributed
Client: `npm run client`

Server: `npm run server`

## License
MIT