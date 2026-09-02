const SQL = {
  default: `SELECT s.name, s.cgpa, b.branch_name
FROM students s
JOIN branch b ON s.branch_id = b.id
ORDER BY s.cgpa DESC
LIMIT 10;`,
  salary: `SELECT e.name, e.salary, d.department_name
FROM employees e
JOIN departments d ON e.dept_id = d.id
WHERE e.salary > 50000
ORDER BY e.salary DESC;`,
  sales: `SELECT DATE_TRUNC('month', order_date) AS month,
       SUM(total_amount)                  AS total_sales,
       COUNT(*)                           AS order_count
FROM orders
WHERE order_date >= DATE_TRUNC('month', NOW())
GROUP BY 1;`,
}

const ROWS = {
  default: {
    columns: ['name', 'cgpa', 'branch_name'],
    rows: [
      ['Priya Sharma', '9.8', 'Computer Science'],
      ['Arjun Patel', '9.7', 'Electronics'],
      ['Neha Gupta', '9.6', 'Computer Science'],
      ['Rahul Singh', '9.5', 'Mechanical'],
      ['Divya Nair', '9.4', 'Computer Science'],
      ['Kiran Rao', '9.3', 'Civil'],
      ['Ananya Das', '9.2', 'Computer Science'],
      ['Vikram Kumar', '9.1', 'Electronics'],
      ['Meera Iyer', '9.0', 'Information Technology'],
      ['Suresh Verma', '8.9', 'Mechanical'],
    ],
  },
  salary: {
    columns: ['name', 'salary', 'department_name'],
    rows: [
      ['Alice Johnson', '120000', 'Engineering'],
      ['Bob Smith', '95000', 'Product'],
      ['Carol White', '87000', 'Design'],
      ['David Brown', '76000', 'Marketing'],
      ['Eve Davis', '68000', 'Sales'],
    ],
  },
  sales: {
    columns: ['month', 'total_sales', 'order_count'],
    rows: [['2026-06-01', '284750.00', '1243']],
  },
}

const TIMELINE = [
  { step: 'Question Received', status: 'done', time: '0ms' },
  { step: 'List Tables', status: 'done', time: '118ms' },
  { step: 'Read Schema', status: 'done', time: '342ms' },
  { step: 'Generate SQL', status: 'done', time: '891ms' },
  { step: 'Validate SQL', status: 'done', time: '954ms' },
  { step: 'Execute Query', status: 'done', time: '1238ms' },
  { step: 'Generate Answer', status: 'done', time: '1672ms' },
]

const ANSWERS = {
  default:
    'Here are the top 10 students ranked by CGPA. Priya Sharma leads with 9.8 from Computer Science, followed by Arjun Patel with 9.7 from Electronics.',
  salary:
    'Found 5 employees earning above ₹50,000. Alice Johnson from Engineering has the highest salary at ₹1,20,000.',
  sales:
    'Total sales for June 2026 amount to ₹2,84,750 across 1,243 orders.',
}

function key(q) {
  const s = q.toLowerCase()
  if (s.includes('salary') || s.includes('employee')) return 'salary'
  if (s.includes('sales') || s.includes('revenue') || s.includes('order')) return 'sales'
  return 'default'
}

export async function mockQuery(question) {
  await new Promise((r) => setTimeout(r, 600))
  const k = key(question)
  const ms = 110 + Math.floor(Math.random() * 180)
  return {
    content: ANSWERS[k],
    sql: SQL[k],
    result: ROWS[k],
    timeline: TIMELINE,
    stats: {
      executionTime: `${ms}ms`,
      rowsReturned: ROWS[k].rows.length,
      columnsReturned: ROWS[k].columns.length,
      database: 'defaultdb (PostgreSQL)',
      llm: 'Gemini 2.0 Flash',
    },
    tokenUsage: {
      prompt: 840 + Math.floor(Math.random() * 200),
      completion: 310 + Math.floor(Math.random() * 100),
      total: 1150 + Math.floor(Math.random() * 250),
    },
    tablesUsed:
      k === 'default'
        ? ['students', 'branch']
        : k === 'salary'
        ? ['employees', 'departments']
        : ['orders'],
  }
}

export const MOCK_SCHEMA = {
  students: [
    { name: 'id', type: 'integer', pk: true, fk: false, nullable: false },
    { name: 'name', type: 'varchar(100)', pk: false, fk: false, nullable: false },
    { name: 'cgpa', type: 'numeric(3,2)', pk: false, fk: false, nullable: true },
    { name: 'branch_id', type: 'integer', pk: false, fk: true, nullable: false },
    { name: 'email', type: 'varchar(150)', pk: false, fk: false, nullable: true },
    { name: 'year', type: 'integer', pk: false, fk: false, nullable: false },
  ],
  branch: [
    { name: 'id', type: 'integer', pk: true, fk: false, nullable: false },
    { name: 'branch_name', type: 'varchar(100)', pk: false, fk: false, nullable: false },
    { name: 'hod', type: 'varchar(100)', pk: false, fk: false, nullable: true },
  ],
  results: [
    { name: 'id', type: 'integer', pk: true, fk: false, nullable: false },
    { name: 'student_id', type: 'integer', pk: false, fk: true, nullable: false },
    { name: 'subject', type: 'varchar(100)', pk: false, fk: false, nullable: false },
    { name: 'marks', type: 'integer', pk: false, fk: false, nullable: true },
    { name: 'grade', type: 'varchar(2)', pk: false, fk: false, nullable: true },
  ],
}
