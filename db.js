import { MongoClient } from 'mongodb';

const port = 27017;
const client = new MongoClient(`mongodb://localhost:${port}`);

export const startDB = async () => {
    try {
      await client.connect();
      const db = client.db("myDB");
      console.log(`Connected with ${db.databaseName}`);
  
      const list = await db.listCollections().toArray();
  
      let usersObj = list.find(item => item.name == 'users');
      let stickersObj = list.find(item => item.name == 'stickers');
  
      if (usersObj === undefined) {
        console.log('creating users..');
        db.createCollection('users');
      }
  
      if (stickersObj === undefined) {
        console.log('creating stickers..');
        db.createCollection('stickers');
      }
  
      let usersCollection = db.collection('users');
      let stickersCollection = db.collection('stickers');
  
      return { usersCollection, stickersCollection };
  
    } catch (e) {
      console.log(e);
    }
  
    await client.close();
  }