const challenges = [
  {
    id: 0,
    title: "Fix the Binary Search",
    topic: "Data Structures - Binary Search",
    difficulty: "Easy",
    description: `The binary search function has a bug. It sometimes returns wrong results or crashes on edge cases. Find and fix the bug so all test cases pass.`,
    starterCode: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length; // BUG IS HERE
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    solutionCode: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    testCases: [
      { description: "binarySearch([1,2,3,4,5], 3) === 2", args: [[1,2,3,4,5], 3], expected: 2 },
      { description: "binarySearch([1,2,3,4,5], 1) === 0", args: [[1,2,3,4,5], 1], expected: 0 },
      { description: "binarySearch([1,2,3,4,5], 5) === 4", args: [[1,2,3,4,5], 5], expected: 4 },
      { description: "binarySearch([1,2,3,4,5], 6) === -1", args: [[1,2,3,4,5], 6], expected: -1 },
      { description: "binarySearch([], 1) === -1", args: [[], 1], expected: -1 },
    ],
  },
  {
    id: 1,
    title: "Complete the Linked List",
    topic: "Data Structures - Linked List",
    difficulty: "Medium",
    description: `The LinkedList class is missing its insertAt method. Implement it so nodes can be inserted at any valid index position.`,
    starterCode: `class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  insertAt(index, data) {
    // TODO: implement this method
    // Insert a new node with 'data' at position 'index'
  }

  getAt(index) {
    let current = this.head;
    let count = 0;
    while (current) {
      if (count === index) return current.data;
      count++;
      current = current.next;
    }
    return null;
  }
}`,
    solutionCode: `class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  insertAt(index, data) {
    if (index < 0 || index > this.size) return false;
    const newNode = new Node(data);
    if (index === 0) {
      newNode.next = this.head;
      this.head = newNode;
    } else {
      let current = this.head;
      for (let i = 0; i < index - 1; i++) {
        current = current.next;
      }
      newNode.next = current.next;
      current.next = newNode;
    }
    this.size++;
    return true;
  }

  getAt(index) {
    let current = this.head;
    let count = 0;
    while (current) {
      if (count === index) return current.data;
      count++;
      current = current.next;
    }
    return null;
  }
}`,
    testCases: [
      { description: "Insert at head (index 0)", testFn: "insertHead", expected: "head" },
      { description: "Insert at tail", testFn: "insertTail", expected: "tail" },
      { description: "Insert in middle", testFn: "insertMiddle", expected: "middle" },
      { description: "Size updates after 3 insertions", testFn: "checkSize", expected: 3 },
    ],
  },
  {
    id: 2,
    title: "Fix the Graph BFS",
    topic: "Algorithms - Graph Traversal",
    difficulty: "Hard",
    description: `The BFS traversal function has subtle bugs. It doesn't visit all nodes in the correct order. Find and fix ALL bugs to make it work correctly.`,
    starterCode: `function bfs(graph, start) {
  let visited = new Set();
  let queue = [start];
  let result = [];

  while (queue.length > 0) {
    let node = queue.pop(); // BUG: should use shift

    if (visited.has(node)) continue;

    visited.add(node);
    result.push(node);

    for (let neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
      }
    }
  }

  return result;
}`,
    solutionCode: `function bfs(graph, start) {
  let visited = new Set();
  let queue = [start];
  let result = [];

  while (queue.length > 0) {
    let node = queue.shift();

    if (visited.has(node)) continue;

    visited.add(node);
    result.push(node);

    for (let neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        queue.push(neighbor);
      }
    }
  }

  return result;
}`,
    testCases: [
      { description: "BFS visits all nodes from A", args: [{ A: ['B','C'], B: ['D'], C: ['D'], D: [] }, 'A'], expected: ['A','B','C','D'] },
      { description: "BFS works on single node", args: [{ A: [] }, 'A'], expected: ['A'] },
      { description: "BFS handles linear graph", args: [{ A: ['B'], B: ['C'], C: [] }, 'A'], expected: ['A','B','C'] },
    ],
  }
];

function runTestCases(code, challengeIndex) {
  const challenge = challenges[challengeIndex];
  const results = [];
  try {
    if (challengeIndex === 0) {
      const fn = new Function(`${code}; return binarySearch;`)();
      for (const tc of challenge.testCases) {
        try {
          const result = fn(...tc.args);
          results.push({ description: tc.description, passed: result === tc.expected, result, expected: tc.expected });
        } catch (e) {
          results.push({ description: tc.description, passed: false, error: e.message });
        }
      }
    } else if (challengeIndex === 1) {
      for (const tc of challenge.testCases) {
        try {
          const ListClass = new Function(`${code}; return LinkedList;`)();
          const list = new ListClass();
          let passed = false;
          if (tc.testFn === "insertHead") {
            list.insertAt(0, "head");
            passed = list.getAt(0) === "head";
          } else if (tc.testFn === "insertTail") {
            list.insertAt(0, "first");
            list.insertAt(1, "tail");
            passed = list.getAt(1) === "tail";
          } else if (tc.testFn === "insertMiddle") {
            list.insertAt(0, "first");
            list.insertAt(1, "last");
            list.insertAt(1, "middle");
            passed = list.getAt(1) === "middle";
          } else if (tc.testFn === "checkSize") {
            list.insertAt(0, "a");
            list.insertAt(1, "b");
            list.insertAt(2, "c");
            passed = list.size === 3;
          }
          results.push({ description: tc.description, passed });
        } catch (e) {
          results.push({ description: tc.description, passed: false, error: e.message });
        }
      }
    } else if (challengeIndex === 2) {
      const fn = new Function(`${code}; return bfs;`)();
      for (const tc of challenge.testCases) {
        try {
          const result = fn(...tc.args);
          const passed = JSON.stringify(result) === JSON.stringify(tc.expected);
          results.push({ description: tc.description, passed, result, expected: tc.expected });
        } catch (e) {
          results.push({ description: tc.description, passed: false, error: e.message });
        }
      }
    }
  } catch (e) {
    return challenge.testCases.map(tc => ({ description: tc.description, passed: false, error: "Syntax error: " + e.message }));
  }
  return results;
}

module.exports = { challenges, runTestCases };
