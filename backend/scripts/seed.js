import db from '../src/db.js';

const house = db
  .prepare('INSERT INTO houses (name, address, notes, polygon) VALUES (@name, @address, @notes, @polygon)')
  .run({
    name: 'Beispielhaus',
    address: 'Dorfstraße 1',
    notes: 'Testdaten aus seed.js',
    polygon: JSON.stringify([
      [52.520008, 13.404954],
      [52.520108, 13.404954],
      [52.520108, 13.405154],
      [52.520008, 13.405154],
    ]),
  });

db.prepare(
  `INSERT INTO people (house_id, first_name, last_name, phone, email, notes, moved_in)
   VALUES (@house_id, @first_name, @last_name, @phone, @email, @notes, @moved_in)`
).run({
  house_id: house.lastInsertRowid,
  first_name: 'Max',
  last_name: 'Mustermann',
  phone: '0123 456789',
  email: 'max@example.com',
  notes: 'Testkontakt aus seed.js',
  moved_in: 'seit 2020',
});

console.log('Seed data inserted.');
