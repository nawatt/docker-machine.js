# docker-machine.js
docker-machine API / command wrapper for nodejs (supports promises)

## Usage

```js
const machine = require('docker-machine.js')



function async createMyMachine() {
  const options = {
      "driver" : "amazonec2",
      "amazonec2-access-key" : process.env.AWS_ACCESS_KEY_ID,
      "amazonec2-secret-key": process.env.AWS_SECRET_ACCESS_KEY,
      "amazonec2-region": process.env.AWS_REGION,
      "amazonec2-instance-type": 't2.nano',
  }
  await machine.create('mymachine', options)
  
  const data = machine.inspect()
  const ip = machine.ip()
  // ...
  // ...
}

```
