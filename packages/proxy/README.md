# proxy
Development of a Proof of Concept for a Proxy capable of receiving parameters over HTTP and forming an MPC-TLS connection to the designated destination as per the provided parameters. This foundational component will be crucial to the T Node's core functionality.

## How to run
1) Install dependencies by running
```
pnpm install
cd packages/proxy
```

2) Firstly we run the notary server by running
```
npm run start:notary
```

1) Secondly we start the T node by running
```
npm run dev
```

1) Send a sample request to notarize
```
curl -X POST http://localhost:3000/proxy \
-H "T-PROXY-URL: https://jsonplaceholder.typicode.com/posts" \
-H "T-STORE: storeone" \
-H "foward-Content-Type: application/json" \
-d '{"title": "usher", "body": "labs", "userId": 10}'
```
Note: Replace `http://localhost:3000/` with the url and port of your proxy.
