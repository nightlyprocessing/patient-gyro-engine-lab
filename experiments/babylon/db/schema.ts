import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const rooms=sqliteTable('rooms',{
 id:text('id').primaryKey(), created:integer('created').notNull(), hatch:integer('hatch').notNull().default(1), grill:integer('grill').notNull().default(1), served:integer('served').notNull().default(0), message:text('message').notNull().default('Welcome to the night shift.'), messageAt:integer('message_at').notNull().default(0)
});
export const players=sqliteTable('players',{
 id:text('id').primaryKey(), room:text('room').notNull(), slot:integer('slot').notNull(), token:text('token').notNull(), x:real('x').notNull(), z:real('z').notNull(), yaw:real('yaw').notNull(), heartbeat:integer('heartbeat').notNull(), lastInput:integer('last_input').notNull(), seq:integer('seq').notNull().default(0)
},t=>[uniqueIndex('room_slot').on(t.room,t.slot),uniqueIndex('player_token').on(t.token)]);
