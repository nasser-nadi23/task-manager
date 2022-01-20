const redis = require('redis');

(async () => {
    const client = redis.createClient()

    client.on('error', (error) => console.log('Redis Client Error', error))

    await client.connect()
    await client.set('name', 'lastname')
    const value = await client.get('name')
    console.log(value)
})()


