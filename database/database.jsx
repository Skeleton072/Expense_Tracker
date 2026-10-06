import * as SQLite from 'expo-sqlite';

// should this be in the app folder?
let db;

export const initDb = async () => {
  db = await SQLite.openDatabaseAsync('expenses.db');

  //await db.execAsync(`DROP TABLE IF EXISTS categories`);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      budget REAL,
      color TEXT,
      iconLibrary TEXT,
      iconName TEXT
    )
  `);

  const result = await db.getFirstAsync('SELECT COUNT(*) AS count FROM categories');

  if (result?.count === 0) {
    await db.execAsync(`
      INSERT INTO categories (name, type, budget, color, iconLibrary, iconName) VALUES
      ('Food', 'expense', 0, '#ce0000', 'MaterialIcons', 'fastfood'),
      ('Transport', 'expense', 0, '#1087d3', 'MaterialIcons', 'directions-bus'),
      ('Entertainment', 'expense', 0, '#f36f21', 'MaterialIcons', 'subscriptions'),
      ('Medicine', 'expense', 0, '#9bd92c', 'MaterialIcons', 'medical-services'),
      ('Education', 'expense', 0, '#2baffc', 'FontAwesome5', 'graduation-cap'),
      ('Shopping', 'expense', 0, '#411271', 'MaterialIcons', 'shopping-cart'),
      ('Travel', 'expense', 0, '#bbdef0', 'FontAwesome5', 'plane'),
      ('Rent', 'expense', 0, '#946c5c', 'FontAwesome5', 'key'),
      ('Gift', 'expense', 0, '#cbf5af', 'MaterialCommunityIcons', 'wallet-giftcard'),
      ('Salary', 'income', 0, '#fafafa', 'FontAwesome5', 'money-bill-wave'),
      ('Others', 'expense', 0, '#000000', 'MaterialCommunityIcons', 'dots-horizontal-circle')
    `);
  }

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      income INTEGER NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT,
      date TEXT NOT NULL,
      FOREIGN KEY (category) REFERENCES categories(name)
    )
  `);

};


// Insert
export const insertFunction = async (isIncome, title, amount, category, date) => {
  try {
    if (!db) await initDb();

    const numericAmount = parseFloat(amount);
    const income = isIncome ? 1 : 0; // Convert boolean to integer

    await db.runAsync(`
      INSERT INTO expenses (income, title, amount, category, date)
      VALUES (?, ?, ?, ?, ?);
    `, [income, title, numericAmount, category, date]);
  } catch (error) {
    console.error('Insert failed:', error);
    throw error;
  }
};

// Delete
export const deleteTransactionsByCategoryName = async (name) => {
  await db.runAsync(`DELETE FROM expenses WHERE category = ?;`, [name]);
};

export const deleteTransactionsBySelected = async (ids) => {
  if (ids.length === 0) return;

  const placeholders = ids.map(() => '?').join(','); // "?,?,?,..."

  await db.runAsync(
    `DELETE FROM expenses WHERE id IN (${placeholders});`,
    ids
  );
};

export const deleteCategoryBySelected = async (name) => {
  await db.runAsync(`DELETE FROM categories WHERE name = ?;`, [name]);
}



// Get today
export const getTodayTransactions = async () => {
  const date = new Date().toISOString().slice(0, 10); 
  const res = await db.getAllAsync(`SELECT * FROM expenses WHERE date LIKE ?;`, [`${date}%`]);

  return res;
};

// Print all
export const getAllExpenses = async () => {
  const rows = await db.getAllAsync(`SELECT * FROM expenses;`);
  return rows;
};


export const getTotalIncome = async () => {
  const result = await db.getFirstAsync(`SELECT SUM(amount) as totalIncome FROM expenses WHERE income = 1;`);
  return result.totalIncome ?? 0;
};


export const getTotalExpenses = async () => {
  const result = await db.getFirstAsync(`SELECT SUM(amount) as totalExpenses FROM expenses WHERE income = 0;`);
  return result.totalExpenses ?? 0;
};


export const getFoodExpenses = async () => {
  const toISODate = (date) => date.toISOString().split('T')[0];

  const start = toISODate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const end = toISODate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));

  const result = await db.getFirstAsync(
    `SELECT SUM(amount) as totalFoodExpenses FROM expenses WHERE category = 'Food' AND date BETWEEN ? AND ?;`,
    [start, end]
  );
  return result?.totalFoodExpenses ?? 0;
};


export const getMonthlyTransactions = async () => {
  const toISODate = (date) => date.toISOString().split('T')[0];

  const start = toISODate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const end = toISODate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));

  const result = await db.getAllAsync(`SELECT * FROM expenses WHERE date BETWEEN ? AND ?;`, [start, end]);
  return result;
}


export const fetchExpensesByDate = async (input) => {
  const result = await db.getAllAsync(`SELECT * FROM expenses WHERE date LIKE ?;`, [`${input}%`]);
  return result;
};

export const getAllCategories = async (type) => {
  let res;

  if (type == 'all') {
    res = await db.getAllAsync(`SELECT * FROM categories;`);
  } else {
    res = await db.getAllAsync(`SELECT * FROM categories WHERE type = ?;`, [type]);
  }
  return res;
}

// it returns an object
export const getCategoryByName = async (name) => {
  const result = db.getAllAsync(`SELECT * FROM categories WHERE name = ?`, [name]);
  return result;
}

// update budget actually
export const updateCategories = async (name, newBudget) => {
  await db.runAsync(`UPDATE categories SET budget = ?  WHERE name = ?;`, [newBudget, name])
};

export const updateTransactions = async (isIncome, title, amount, category, date, id) => {
  
  const numericAmount = parseFloat(amount);
  const income = isIncome ? 1 : 0; // Convert boolean to integer

  try {
    await db.runAsync(`UPDATE expenses SET income = ?, title = ?, amount = ?, category = ?, date = ? WHERE id = ?;`, [income, title, numericAmount, category, date, id]);
  } catch (error) {
    console.log('error', error);
  }
  
}

export const getTransactionsByCategory = async (category) => {
  const result = await db.getAllAsync(`SELECT * FROM expenses WHERE category = ?;`, [category]);
  return result;
}

export const insertIntoCategories = async (newCategory) => {
  const {name, type, budget, color, iconLibrary, iconName} = newCategory;

  await db.runAsync(`
    INSERT INTO categories (name, type, budget, color, iconLibrary, iconName) 
    VALUEs (?, ?, ?, ?, ?, ?);
    `, [name, type, budget, color, iconLibrary, iconName]);

}