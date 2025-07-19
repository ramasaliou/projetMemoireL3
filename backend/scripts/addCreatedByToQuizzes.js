import sqlite3 from 'sqlite3';

const dbPath = './database.sqlite';
const db = new sqlite3.Database(dbPath);

// Vérifier si la colonne existe déjà
const checkColumn = `PRAGMA table_info('quizzes');`;

db.all(checkColumn, [], (err, columns) => {
  if (err) {
    console.error('Erreur lors de la vérification de la table:', err);
    db.close();
    return;
  }
  const hasCreatedBy = columns.some(col => col.name === 'created_by');
  if (hasCreatedBy) {
    console.log('La colonne created_by existe déjà dans quizzes.');
    db.close();
    return;
  }
  // Ajouter la colonne
  const alter = `ALTER TABLE quizzes ADD COLUMN created_by INTEGER;`;
  db.run(alter, [], (err2) => {
    if (err2) {
      console.error('Erreur lors de l\'ajout de la colonne:', err2);
    } else {
      console.log('Colonne created_by ajoutée à quizzes avec succès.');
    }
    db.close();
  });
}); 