import { Hono, type Context } from 'hono';

import { connectMongo } from './mongo';
import { UserSchema } from './domain/user.schema';
import { RoomSchema } from './domain/room.schema';

const ALREADY_EXISTS = 11000;

const USERS_COLLECTION = 'users';
const ROOMS_COLLECTION = 'rooms';

const app = new Hono()

const loginHandler = async (c: Context) => {
  try {
    const body = await c.req.json()
    const user = UserSchema.parse(body);
    const db = await connectMongo();

    await db.collection(USERS_COLLECTION).insertOne(user);

    c.status(200)
    return c.json({
      ok: true,
      message: 'success'
    })
  } catch (e: any) {
    console.error(e);
    if (e?.code === ALREADY_EXISTS) {
      return c.json(
        { ok: false, err: 'UAE', message: 'User already exists' },
        409
      )
    }
    c.status(500)
    return c.json({
      ok: false,
      message: 'error'
    })
  }
};

const createRoomHandler = async (c: Context) => {
  try {
    const body = await c.req.json()
    const room = RoomSchema.parse(body);
    const db = await connectMongo();

    await db.collection(ROOMS_COLLECTION).insertOne(room);

    c.status(201)
    return c.json({
      ok: true,
      message: 'created'
    })
  } catch (e: any) {
    if (e?.code === ALREADY_EXISTS) {
      return c.json(
        { ok: false, err: 'RAE', message: 'Room already exists' },
        409
      )
    }
    c.status(500)
    return c.json({
      ok: false,
      message: 'error'
    })
  }
};

app.post('/login', loginHandler);
app.post('/create-room', createRoomHandler);

export default app
