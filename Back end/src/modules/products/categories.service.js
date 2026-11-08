const db = require('../../core/database');

const DEFAULT_CATEGORIES = ['Bakery', 'Meals', 'Produce', 'Other'].map((name) => ({ id: name, name }));

function listCategories() {
  const categories = db.read('categories');
  return categories.length ? categories : DEFAULT_CATEGORIES;
}

module.exports = { listCategories };
