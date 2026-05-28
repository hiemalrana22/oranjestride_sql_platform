/**
 * Mock SQL questions — preloaded by the platform owner.
 * Replace with API data when backend is ready.
 */

export const mockQuestions = [
  {
    id: 1,
    title: 'Find employees earning more than 50000',
    difficulty: 'Easy',
    description:
      'Write a SQL query to return all employees whose salary is greater than 50000. Return all columns from the employees table.',
    expectedOutput:
      'Two rows: John (60000, IT) and Lisa (55000, Finance). Employees with salary 50000 or below should not appear.',
    schema: {
      tableName: 'employees',
      columns: [
        { name: 'id', type: 'INTEGER', key: 'PRIMARY KEY' },
        { name: 'name', type: 'VARCHAR(100)' },
        { name: 'salary', type: 'INTEGER' },
        { name: 'department', type: 'VARCHAR(50)' },
      ],
    },
    sampleData: {
      columns: ['id', 'name', 'salary', 'department'],
      rows: [
        [1, 'John', 60000, 'IT'],
        [2, 'Sam', 30000, 'HR'],
        [3, 'Lisa', 55000, 'Finance'],
        [4, 'Mike', 45000, 'IT'],
      ],
    },
    starterSql: 'SELECT * FROM employees;',
    // Mock grader: query should filter by salary > 50000
    passPatterns: ['salary', '>', '50000'],
  },
  {
    id: 2,
    title: 'Count employees per department',
    difficulty: 'Medium',
    description:
      'Write a query that returns each department name and the number of employees in that department. Order results by department name alphabetically.',
    expectedOutput:
      'Three rows showing department names and counts, e.g. Finance: 1, HR: 1, IT: 2.',
    schema: {
      tableName: 'employees',
      columns: [
        { name: 'id', type: 'INTEGER', key: 'PRIMARY KEY' },
        { name: 'name', type: 'VARCHAR(100)' },
        { name: 'salary', type: 'INTEGER' },
        { name: 'department', type: 'VARCHAR(50)' },
      ],
    },
    sampleData: {
      columns: ['id', 'name', 'salary', 'department'],
      rows: [
        [1, 'John', 60000, 'IT'],
        [2, 'Sam', 30000, 'HR'],
        [3, 'Lisa', 55000, 'Finance'],
        [4, 'Mike', 45000, 'IT'],
      ],
    },
    starterSql: 'SELECT department, COUNT(*) AS employee_count\nFROM employees\nGROUP BY department;',
    passPatterns: ['count', 'group by', 'department'],
  },
  {
    id: 3,
    title: 'List orders with customer names',
    difficulty: 'Hard',
    description:
      'Join the orders and customers tables to return order id, customer name, product, and amount for all orders. Sort by amount descending.',
    expectedOutput:
      'All orders with the matching customer name from the customers table, sorted highest amount first.',
    schema: {
      tables: [
        {
          tableName: 'customers',
          columns: [
            { name: 'id', type: 'INTEGER', key: 'PRIMARY KEY' },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'email', type: 'VARCHAR(150)' },
          ],
        },
        {
          tableName: 'orders',
          columns: [
            { name: 'id', type: 'INTEGER', key: 'PRIMARY KEY' },
            { name: 'customer_id', type: 'INTEGER', key: 'FOREIGN KEY' },
            { name: 'product', type: 'VARCHAR(100)' },
            { name: 'amount', type: 'DECIMAL(10,2)' },
          ],
        },
      ],
    },
    sampleData: [
      {
        tableName: 'customers',
        columns: ['id', 'name', 'email'],
        rows: [
          [1, 'Alice', 'alice@mail.com'],
          [2, 'Bob', 'bob@mail.com'],
        ],
      },
      {
        tableName: 'orders',
        columns: ['id', 'customer_id', 'product', 'amount'],
        rows: [
          [101, 1, 'Laptop', 1200.0],
          [102, 2, 'Mouse', 25.5],
          [103, 1, 'Keyboard', 89.99],
        ],
      },
    ],
    starterSql:
      'SELECT o.id, c.name, o.product, o.amount\nFROM orders o\nJOIN customers c ON o.customer_id = c.id;',
    passPatterns: ['join', 'customers', 'orders'],
  },
];

export function getQuestionById(id) {
  return mockQuestions.find((q) => q.id === id) ?? mockQuestions[0];
}
