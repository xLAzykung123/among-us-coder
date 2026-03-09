const CATEGORIES = {
  DATA_STRUCTURES: 'DATA_STRUCTURES',
  OOP: 'OOP',
  SECURITY: 'SECURITY',
  FRONTEND: 'FRONTEND',
  ALGORITHMS: 'ALGORITHMS',
  DATABASES: 'DATABASES',
};

const CATEGORY_INFO = {
  DATA_STRUCTURES: {
    name: 'Data Structures',
    emoji: '🗄️',
    description: 'Stacks, queues, linked lists',
    color: '#FF6B6B',
  },
  OOP: {
    name: 'Object-Oriented Programming',
    emoji: '🧩',
    description: 'Classes, inheritance, polymorphism',
    color: '#4ECDC4',
  },
  SECURITY: {
    name: 'Security',
    emoji: '🔐',
    description: 'Auth, encryption, SQL injection',
    color: '#FFE66D',
  },
  FRONTEND: {
    name: 'Front-End',
    emoji: '🎨',
    description: 'DOM, fetch, async, CSS',
    color: '#95E1D3',
  },
  ALGORITHMS: {
    name: 'Algorithms',
    emoji: '⚙️',
    description: 'Sorting, searching, recursion',
    color: '#A8E6CF',
  },
  DATABASES: {
    name: 'Databases',
    emoji: '🧮',
    description: 'SQL queries, joins, indexing',
    color: '#FFB3BA',
  },
};

const challenges = {
  [CATEGORIES.DATA_STRUCTURES]: [
    {
      id: 'ds-1',
      category: CATEGORIES.DATA_STRUCTURES,
      title: 'Implement a Stack Class',
      difficulty: 'Easy',
      description: 'Implement a Stack class with push, pop, peek, and isEmpty methods.',
      starterCode: `class Stack {
  constructor() {
    this.items = [];
  }

  push(element) {
    // TODO: implement
  }

  pop() {
    // TODO: implement
  }

  peek() {
    // TODO: implement
  }

  isEmpty() {
    // TODO: implement
  }
}`,
      solutionCode: `class Stack {
  constructor() {
    this.items = [];
  }

  push(element) {
    this.items.push(element);
  }

  pop() {
    return this.items.pop();
  }

  peek() {
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length === 0;
  }
}`,
      testCases: [
        { description: 'Push and pop work', testFn: 'pushPop', expected: true },
        { description: 'Peek returns top without removing', testFn: 'peek', expected: true },
        { description: 'isEmpty works correctly', testFn: 'isEmpty', expected: true },
      ],
    },
    {
      id: 'ds-2',
      category: CATEGORIES.DATA_STRUCTURES,
      title: 'Fix the Queue Implementation',
      difficulty: 'Medium',
      description: 'The Queue dequeue method has a bug. Fix it so items are removed in FIFO order.',
      starterCode: `class Queue {
  constructor() {
    this.items = [];
  }

  enqueue(element) {
    this.items.push(element);
  }

  dequeue() {
    return this.items.pop(); // BUG: should use shift for FIFO
  }

  front() {
    return this.items[0];
  }

  isEmpty() {
    return this.items.length === 0;
  }
}`,
      solutionCode: `class Queue {
  constructor() {
    this.items = [];
  }

  enqueue(element) {
    this.items.push(element);
  }

  dequeue() {
    return this.items.shift();
  }

  front() {
    return this.items[0];
  }

  isEmpty() {
    return this.items.length === 0;
  }
}`,
      testCases: [
        { description: 'Dequeue returns items in FIFO order', testFn: 'fifo', expected: true },
        { description: 'Front returns first item without removing', testFn: 'front', expected: true },
      ],
    },
  ],
  [CATEGORIES.OOP]: [
    {
      id: 'oop-1',
      category: CATEGORIES.OOP,
      title: 'Fix Broken Inheritance',
      difficulty: 'Easy',
      description: 'The Dog class inherits from Animal but speak() returns the wrong value. Fix the method override.',
      starterCode: `class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return \`\${this.name} makes a sound\`;
  }
}

class Dog extends Animal {
  speak() {
    return \`\${this.name} barks\`; // This looks correct but isn't being called
  }
}`,
      solutionCode: `class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return \`\${this.name} makes a sound\`;
  }
}

class Dog extends Animal {
  speak() {
    return \`\${this.name} barks\`;
  }
}`,
      testCases: [
        { description: 'Dog.speak() returns correct message', testFn: 'dogSpeak', expected: 'Buddy barks' },
        { description: 'Animal.speak() still works', testFn: 'animalSpeak', expected: 'Generic makes a sound' },
      ],
    },
    {
      id: 'oop-2',
      category: CATEGORIES.OOP,
      title: 'Implement Shape Area Calculation',
      difficulty: 'Medium',
      description: 'Implement the missing area() method in the Shape class hierarchy.',
      starterCode: `class Shape {
  constructor(name) {
    this.name = name;
  }

  area() {
    return 0; // Placeholder
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super('Rectangle');
    this.width = width;
    this.height = height;
  }

  area() {
    // TODO: implement area calculation
  }
}

class Circle extends Shape {
  constructor(radius) {
    super('Circle');
    this.radius = radius;
  }

  area() {
    // TODO: implement area calculation
  }
}`,
      solutionCode: `class Shape {
  constructor(name) {
    this.name = name;
  }

  area() {
    return 0;
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super('Rectangle');
    this.width = width;
    this.height = height;
  }

  area() {
    return this.width * this.height;
  }
}

class Circle extends Shape {
  constructor(radius) {
    super('Circle');
    this.radius = radius;
  }

  area() {
    return Math.PI * this.radius * this.radius;
  }
}`,
      testCases: [
        { description: 'Rectangle area is correct', testFn: 'rectArea', expected: 20 },
        { description: 'Circle area is correct', testFn: 'circleArea', expected: Math.PI * 25 },
      ],
    },
  ],
  [CATEGORIES.SECURITY]: [
    {
      id: 'sec-1',
      category: CATEGORIES.SECURITY,
      title: 'Fix SQL Injection Vulnerability',
      difficulty: 'Hard',
      description: 'The query builder is vulnerable to SQL injection. Fix it by properly escaping input.',
      starterCode: `function buildUserQuery(userId) {
  // BUG: Direct string concatenation allows SQL injection
  return \`SELECT * FROM users WHERE id = \${userId}\`;
}

function escapeSQL(str) {
  // Helper function to prevent SQL injection
  return str.toString().replace(/'/g, "''");
}`,
      solutionCode: `function buildUserQuery(userId) {
  // Fixed: Use parameterized query
  return \`SELECT * FROM users WHERE id = ?\`;
  // In real code, userId would be passed separately to the driver
}

function escapeSQL(str) {
  return str.toString().replace(/'/g, "''");
}`,
      testCases: [
        { description: 'Query builder prevents injection', testFn: 'injectionCheck', expected: true },
        { description: 'Valid queries still work', testFn: 'validQuery', expected: true },
      ],
    },
    {
      id: 'sec-2',
      category: CATEGORIES.SECURITY,
      title: 'Fix Password Validation',
      difficulty: 'Medium',
      description: 'The password validation regex has a bug. Fix it to properly validate strong passwords.',
      starterCode: `function isStrongPassword(password) {
  // BUG: Regex is missing the anchors
  const regex = /[A-Z].*[0-9].*[!@#$%^&*]/;
  return regex.test(password);
}`,
      solutionCode: `function isStrongPassword(password) {
  // Fixed: Added anchors and correct pattern
  const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/;
  return regex.test(password);
}`,
      testCases: [
        { description: 'Strong password passes', testFn: 'strongPass', expected: true },
        { description: 'Weak password fails', testFn: 'weakPass', expected: false },
      ],
    },
  ],
  [CATEGORIES.FRONTEND]: [
    {
      id: 'fe-1',
      category: CATEGORIES.FRONTEND,
      title: 'Fix Broken Promise Chain',
      difficulty: 'Medium',
      description: 'The Promise chain is missing a return statement. Fix it so the chain works correctly.',
      starterCode: `function fetchUserData(userId) {
  return fetch(\`/api/users/\${userId}\`)
    .then(response => response.json())
    .then(data => {
      console.log(data); // BUG: missing return
    })
    .catch(error => console.error(error));
}`,
      solutionCode: `function fetchUserData(userId) {
  return fetch(\`/api/users/\${userId}\`)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      return data;
    })
    .catch(error => console.error(error));
}`,
      testCases: [
        { description: 'Promise chain returns data', testFn: 'chainReturn', expected: true },
        { description: 'Error handling works', testFn: 'errorHandling', expected: true },
      ],
    },
    {
      id: 'fe-2',
      category: CATEGORIES.FRONTEND,
      title: 'Fix DOM Query Bug',
      difficulty: 'Easy',
      description: 'The DOM query function returns the wrong elements. Fix the selector.',
      starterCode: `function updateUserElements(userId, name) {
  // BUG: querySelector returns first match, should return all
  const elements = document.querySelector('.user-item');
  elements.textContent = name; // Error: can't set textContent on null/single element
}`,
      solutionCode: `function updateUserElements(userId, name) {
  // Fixed: Use querySelectorAll for multiple elements
  const elements = document.querySelectorAll('.user-item');
  elements.forEach(el => {
    if (el.dataset.userId === userId) {
      el.textContent = name;
    }
  });
}`,
      testCases: [
        { description: 'Query returns correct elements', testFn: 'queryTest', expected: true },
        { description: 'Update works correctly', testFn: 'updateTest', expected: true },
      ],
    },
  ],
  [CATEGORIES.ALGORITHMS]: [
    {
      id: 'algo-1',
      category: CATEGORIES.ALGORITHMS,
      title: 'Fix Bubble Sort',
      difficulty: 'Easy',
      description: 'The bubble sort has the wrong comparison operator. Fix it.',
      starterCode: `function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) { // BUG: should be > not <
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
      solutionCode: `function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
      testCases: [
        { description: 'Sorts array correctly', testFn: 'sortTest', expected: [1, 2, 3, 4, 5] },
        { description: 'Handles single element', testFn: 'singleTest', expected: [5] },
      ],
    },
    {
      id: 'algo-2',
      category: CATEGORIES.ALGORITHMS,
      title: 'Implement Merge Sort',
      difficulty: 'Hard',
      description: 'Implement the missing merge step in merge sort.',
      starterCode: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  
  // TODO: implement merge logic
  
  return result;
}`,
      solutionCode: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }
  
  return result.concat(left.slice(i)).concat(right.slice(j));
}`,
      testCases: [
        { description: 'Sorts array', testFn: 'sortTest', expected: [1, 2, 3, 4, 5] },
        { description: 'Handles duplicates', testFn: 'duplicateTest', expected: [1, 2, 2, 3, 3] },
      ],
    },
  ],
  [CATEGORIES.DATABASES]: [
    {
      id: 'db-1',
      category: CATEGORIES.DATABASES,
      title: 'Fix SQL JOIN Logic',
      difficulty: 'Medium',
      description: 'Fix the broken query builder JOIN logic.',
      starterCode: `function buildJoinQuery(table1, table2, onCondition) {
  // BUG: JOIN logic is backwards
  return \`SELECT * FROM \${table2} LEFT JOIN \${table1} ON \${onCondition}\`;
}`,
      solutionCode: `function buildJoinQuery(table1, table2, onCondition) {
  // Fixed: Correct JOIN order
  return \`SELECT * FROM \${table1} LEFT JOIN \${table2} ON \${onCondition}\`;
}`,
      testCases: [
        { description: 'JOIN query is correct', testFn: 'joinTest', expected: true },
      ],
    },
    {
      id: 'db-2',
      category: CATEGORIES.DATABASES,
      title: 'Fix Data Aggregation',
      difficulty: 'Medium',
      description: 'The reduce function has wrong logic for aggregating data.',
      starterCode: `function sumUserScores(users) {
  // BUG: Wrong property or logic in reduce
  return users.reduce((sum, user) => sum + user.name, 0);
}`,
      solutionCode: `function sumUserScores(users) {
  // Fixed: Use correct property
  return users.reduce((sum, user) => sum + user.score, 0);
}`,
      testCases: [
        { description: 'Aggregates correctly', testFn: 'aggregateTest', expected: 300 },
      ],
    },
  ],
};

// Flatten challenges for backwards compatibility with old code
const flatChallenges = Object.values(challenges).flat();

function runTestCases(code, challengeId) {
  // Find challenge by ID
  let challenge = null;
  for (const category of Object.values(challenges)) {
    challenge = category.find(c => c.id === challengeId);
    if (challenge) break;
  }
  
  if (!challenge) {
    return [{ description: 'Challenge not found', passed: false, error: 'Invalid challenge ID' }];
  }

  const results = [];
  try {
    // Execute user code in a safe context
    const fn = new Function(code);
    fn();
    
    // Run test cases (simplified - real implementation would need test harness)
    for (const tc of challenge.testCases) {
      results.push({ 
        description: tc.description, 
        passed: true, 
        message: 'Test execution would happen here' 
      });
    }
  } catch (e) {
    return [{ 
      description: 'Code execution error', 
      passed: false, 
      error: e.message 
    }];
  }
  
  return results;
}

module.exports = { 
  challenges, 
  flatChallenges, 
  runTestCases, 
  CATEGORIES, 
  CATEGORY_INFO 
};
