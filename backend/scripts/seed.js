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

const insertPerson = db.prepare(
  `INSERT INTO people (house_id, first_name, last_name, notes, moved_in)
   VALUES (@house_id, @first_name, @last_name, @notes, @moved_in)`
);
const insertField = db.prepare(
  'INSERT INTO person_fields (person_id, kind, label, value, position) VALUES (?, ?, ?, ?, ?)'
);

const max = insertPerson.run({
  house_id: house.lastInsertRowid,
  first_name: 'Max',
  last_name: 'Mustermann',
  notes: 'Testkontakt aus seed.js',
  moved_in: 'seit 2020',
}).lastInsertRowid;
insertField.run(max, 'phone', 'Mobil', '0123 456789', 0);
insertField.run(max, 'phone', 'Arbeit', '030 1234567', 1);
insertField.run(max, 'email', 'Privat', 'max@example.com', 0);
insertField.run(max, 'address', 'Arbeit', 'Hauptstraße 5, 10115 Berlin', 0);

const erika = insertPerson.run({
  house_id: house.lastInsertRowid,
  first_name: 'Erika',
  last_name: 'Mustermann',
  notes: null,
  moved_in: 'seit 2020',
}).lastInsertRowid;
insertField.run(erika, 'phone', null, '0123 987654', 0);

// Erika ist für Max "Ehepartner", Max für Erika ebenfalls (symmetrisch).
db.prepare(
  `INSERT INTO relationships (person_id, related_person_id, category, label, reverse_label)
   VALUES (?, ?, 'family', 'Ehepartner', 'Ehepartner')`
).run(max, erika);

console.log('Seed data inserted.');
