// Question bank — three formats:
//   type:'code'    → JS function problems with test cases (run in browser)
//   type:'numeric' → exact numerical answer with tolerance
//
// comparator options: 'exact' | 'sorted' (sort arrays before comparing) | 'any-palindrome'

const QUESTIONS = {
  tech: {
    easy: [
      {
        id: 'te1', type: 'code',
        title: 'Two Sum',
        description: 'Given an array of integers <code>nums</code> and an integer <code>target</code>, return the indices of the two numbers that add up to <code>target</code>.\n\nYou may assume each input has exactly one solution. You may not use the same element twice.',
        examples: [
          { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'nums[0] + nums[1] = 9' },
          { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]' },
        ],
        constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', 'Only one valid answer exists'],
        starter: 'function twoSum(nums, target) {\n  \n}',
        pythonStarter: 'def two_sum(nums, target):\n    pass',
        functionName: 'twoSum',
        pythonFunctionName: 'two_sum',
        comparator: 'sorted',
        testCases: [
          { input: [[2,7,11,15], 9], expected: [0,1], label: 'nums=[2,7,11,15], target=9' },
          { input: [[3,2,4], 6], expected: [1,2], label: 'nums=[3,2,4], target=6' },
          { input: [[3,3], 6], expected: [0,1], label: 'nums=[3,3], target=6' },
        ],
        hiddenCases: [
          { input: [[-1,-2,-3,-4,-5], -8], expected: [2,4] },
          { input: [[1,5,3,2], 4], expected: [2,3] },
        ],
        explanation: 'Use a hash map to store each number\'s index. For each num, check if (target - num) is already in the map. This gives O(n) time, O(n) space — much better than the O(n²) brute force.',
      },
      {
        id: 'te2', type: 'code',
        title: 'Contains Duplicate',
        description: 'Given an integer array <code>nums</code>, return <code>true</code> if any value appears <strong>at least twice</strong>, and <code>false</code> if every element is distinct.',
        examples: [
          { input: 'nums = [1, 2, 3, 1]', output: 'true' },
          { input: 'nums = [1, 2, 3, 4]', output: 'false' },
          { input: 'nums = [1, 1, 1, 3, 3, 4, 3, 2, 4, 2]', output: 'true' },
        ],
        constraints: ['1 ≤ nums.length ≤ 10⁵', '-10⁹ ≤ nums[i] ≤ 10⁹'],
        starter: 'function containsDuplicate(nums) {\n  \n}',
        pythonStarter: 'def contains_duplicate(nums):\n    pass',
        functionName: 'containsDuplicate',
        pythonFunctionName: 'contains_duplicate',
        comparator: 'exact',
        testCases: [
          { input: [[1,2,3,1]], expected: true, label: '[1,2,3,1]' },
          { input: [[1,2,3,4]], expected: false, label: '[1,2,3,4]' },
          { input: [[1,1,1,3,3,4]], expected: true, label: '[1,1,1,3,3,4]' },
        ],
        hiddenCases: [
          { input: [[1]], expected: false },
          { input: [[1,2]], expected: false },
          { input: [[1,1]], expected: true },
        ],
        explanation: 'Add each number to a Set. If the number already exists in the Set, return true. If you finish the loop without finding one, return false. O(n) time, O(n) space.',
      },
      {
        id: 'te3', type: 'code',
        title: 'Palindrome Number',
        description: 'Given an integer <code>x</code>, return <code>true</code> if <code>x</code> is a <strong>palindrome</strong>, and <code>false</code> otherwise.\n\nA palindrome reads the same forwards and backwards.',
        examples: [
          { input: 'x = 121', output: 'true', explanation: '121 reads as 121 from left to right and from right to left.' },
          { input: 'x = -121', output: 'false', explanation: 'From left to right: -121. From right to left: 121-. Not a palindrome.' },
          { input: 'x = 10', output: 'false' },
        ],
        constraints: ['-2³¹ ≤ x ≤ 2³¹ - 1'],
        starter: 'function isPalindrome(x) {\n  \n}',
        pythonStarter: 'def is_palindrome(x):\n    pass',
        functionName: 'isPalindrome',
        pythonFunctionName: 'is_palindrome',
        comparator: 'exact',
        testCases: [
          { input: [121], expected: true, label: 'x = 121' },
          { input: [-121], expected: false, label: 'x = -121' },
          { input: [10], expected: false, label: 'x = 10' },
          { input: [0], expected: true, label: 'x = 0' },
        ],
        hiddenCases: [
          { input: [1001], expected: false },
          { input: [1221], expected: true },
        ],
        explanation: 'Negative numbers are never palindromes. Convert x to a string and compare it to its reverse: `String(x) === String(x).split("").reverse().join("")`. Or do it mathematically by reversing the digits.',
      },
      {
        "id": "te4",
        "type": "code",
        "title": "Reverse a String",
        "description": "Given a string <code>s</code>, return a new string with the characters in <strong>reverse order</strong>.",
        "examples": [
          {
            "input": "s = \"hello\"",
            "output": "\"olleh\""
          },
          {
            "input": "s = \"a\"",
            "output": "\"a\""
          }
        ],
        "constraints": [
          "0 ≤ s.length ≤ 10⁴",
          "s consists of printable ASCII characters"
        ],
        "starter": "function reverseString(s) {\n  \n}",
        "pythonStarter": "def reverse_string(s):\n    pass",
        "functionName": "reverseString",
        "pythonFunctionName": "reverse_string",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              "hello"
            ],
            "expected": "olleh",
            "label": "s = \"hello\""
          },
          {
            "input": [
              "QuantBattle"
            ],
            "expected": "elttaBtnauQ",
            "label": "s = \"QuantBattle\""
          },
          {
            "input": [
              "a"
            ],
            "expected": "a",
            "label": "s = \"a\""
          }
        ],
        "hiddenCases": [
          {
            "input": [
              ""
            ],
            "expected": ""
          },
          {
            "input": [
              "racecar"
            ],
            "expected": "racecar"
          }
        ],
        "explanation": "Split the string into an array of characters, reverse the array, and join it back into a string. O(n) time, O(n) space."
      },
      {
        "id": "te5",
        "type": "code",
        "title": "Valid Anagram",
        "description": "Given two strings <code>s</code> and <code>t</code>, return <code>true</code> if <code>t</code> is an <strong>anagram</strong> of <code>s</code> (uses exactly the same letters, same counts, any order), and <code>false</code> otherwise.",
        "examples": [
          {
            "input": "s = \"listen\", t = \"silent\"",
            "output": "true"
          },
          {
            "input": "s = \"rat\", t = \"car\"",
            "output": "false"
          }
        ],
        "constraints": [
          "0 ≤ s.length, t.length ≤ 5 × 10⁴",
          "s and t consist of lowercase English letters"
        ],
        "starter": "function isAnagram(s, t) {\n  \n}",
        "pythonStarter": "def is_anagram(s, t):\n    pass",
        "functionName": "isAnagram",
        "pythonFunctionName": "is_anagram",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              "listen",
              "silent"
            ],
            "expected": true,
            "label": "s=\"listen\", t=\"silent\""
          },
          {
            "input": [
              "rat",
              "car"
            ],
            "expected": false,
            "label": "s=\"rat\", t=\"car\""
          },
          {
            "input": [
              "anagram",
              "nagaram"
            ],
            "expected": true,
            "label": "s=\"anagram\", t=\"nagaram\""
          }
        ],
        "hiddenCases": [
          {
            "input": [
              "",
              ""
            ],
            "expected": true
          },
          {
            "input": [
              "a",
              "ab"
            ],
            "expected": false
          }
        ],
        "explanation": "If lengths differ, they cannot be anagrams. Otherwise count each character in s using a hash map, then decrement counts while scanning t — if any count goes negative or missing, return false. O(n) time, O(1) space (bounded alphabet)."
      },
      {
        "id": "te6",
        "type": "code",
        "title": "FizzBuzz List",
        "description": "Given an integer <code>n</code>, return an array of strings for the numbers <code>1</code> through <code>n</code> where: multiples of 3 become <code>\"Fizz\"</code>, multiples of 5 become <code>\"Buzz\"</code>, multiples of both become <code>\"FizzBuzz\"</code>, and all other numbers are converted to strings.",
        "examples": [
          {
            "input": "n = 5",
            "output": "[\"1\",\"2\",\"Fizz\",\"4\",\"Buzz\"]"
          },
          {
            "input": "n = 3",
            "output": "[\"1\",\"2\",\"Fizz\"]"
          }
        ],
        "constraints": [
          "0 ≤ n ≤ 10⁴"
        ],
        "starter": "function fizzBuzzList(n) {\n  \n}",
        "pythonStarter": "def fizz_buzz_list(n):\n    pass",
        "functionName": "fizzBuzzList",
        "pythonFunctionName": "fizz_buzz_list",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              5
            ],
            "expected": [
              "1",
              "2",
              "Fizz",
              "4",
              "Buzz"
            ],
            "label": "n = 5"
          },
          {
            "input": [
              15
            ],
            "expected": [
              "1",
              "2",
              "Fizz",
              "4",
              "Buzz",
              "Fizz",
              "7",
              "8",
              "Fizz",
              "Buzz",
              "11",
              "Fizz",
              "13",
              "14",
              "FizzBuzz"
            ],
            "label": "n = 15"
          },
          {
            "input": [
              1
            ],
            "expected": [
              "1"
            ],
            "label": "n = 1"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              3
            ],
            "expected": [
              "1",
              "2",
              "Fizz"
            ]
          },
          {
            "input": [
              0
            ],
            "expected": []
          }
        ],
        "explanation": "Loop from 1 to n. Check divisibility by 15 first (both 3 and 5), then 3, then 5, otherwise push the number as a string. O(n) time, O(n) space."
      },
      {
        "id": "te7",
        "type": "code",
        "title": "Maximum Subarray Sum",
        "description": "Given an integer array <code>nums</code>, find the contiguous subarray (containing at least one number) with the <strong>largest sum</strong>, and return that sum.",
        "examples": [
          {
            "input": "nums = [-2,1,-3,4,-1,2,1,-5,4]",
            "output": "6",
            "explanation": "The subarray [4,-1,2,1] has the largest sum 6."
          },
          {
            "input": "nums = [1]",
            "output": "1"
          }
        ],
        "constraints": [
          "1 ≤ nums.length ≤ 10⁵",
          "-10⁴ ≤ nums[i] ≤ 10⁴"
        ],
        "starter": "function maxSubArray(nums) {\n  \n}",
        "pythonStarter": "def max_sub_array(nums):\n    pass",
        "functionName": "maxSubArray",
        "pythonFunctionName": "max_sub_array",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                -2,
                1,
                -3,
                4,
                -1,
                2,
                1,
                -5,
                4
              ]
            ],
            "expected": 6,
            "label": "nums = [-2,1,-3,4,-1,2,1,-5,4]"
          },
          {
            "input": [
              [
                1
              ]
            ],
            "expected": 1,
            "label": "nums = [1]"
          },
          {
            "input": [
              [
                5,
                4,
                -1,
                7,
                8
              ]
            ],
            "expected": 23,
            "label": "nums = [5,4,-1,7,8]"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                -1
              ]
            ],
            "expected": -1
          },
          {
            "input": [
              [
                -3,
                -2,
                -1
              ]
            ],
            "expected": -1
          }
        ],
        "explanation": "Kadane's algorithm: track the best sum ending at the current index (`cur`), resetting to just `nums[i]` whenever extending the previous subarray would hurt. Track the running maximum. O(n) time, O(1) space."
      },
      {
        "id": "te8",
        "type": "code",
        "title": "Find the Missing Number",
        "description": "You are given an array <code>nums</code> containing <code>n</code> distinct numbers taken from the range <code>[0, n]</code>. Exactly one number in that range is missing from the array. Return the missing number.",
        "examples": [
          {
            "input": "nums = [3, 0, 1]",
            "output": "2",
            "explanation": "n = 3, range is [0,3], and 2 is missing."
          },
          {
            "input": "nums = [0, 1]",
            "output": "2"
          }
        ],
        "constraints": [
          "n == nums.length",
          "1 ≤ n ≤ 10⁴",
          "All numbers are unique"
        ],
        "starter": "function missingNumber(nums) {\n  \n}",
        "pythonStarter": "def missing_number(nums):\n    pass",
        "functionName": "missingNumber",
        "pythonFunctionName": "missing_number",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                3,
                0,
                1
              ]
            ],
            "expected": 2,
            "label": "nums = [3,0,1]"
          },
          {
            "input": [
              [
                0,
                1
              ]
            ],
            "expected": 2,
            "label": "nums = [0,1]"
          },
          {
            "input": [
              [
                9,
                6,
                4,
                2,
                3,
                5,
                7,
                0,
                1
              ]
            ],
            "expected": 8,
            "label": "nums = [9,6,4,2,3,5,7,0,1]"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                0
              ]
            ],
            "expected": 1
          },
          {
            "input": [
              [
                1
              ]
            ],
            "expected": 0
          }
        ],
        "explanation": "The expected sum of 0..n is n(n+1)/2. Subtract the actual sum of nums from that — the difference is the missing number. O(n) time, O(1) space."
      },
      {
        "id": "te9",
        "type": "code",
        "title": "Single Number",
        "description": "Given a non-empty array of integers <code>nums</code> where <strong>every element appears exactly twice except for one</strong>, find that single element.",
        "examples": [
          {
            "input": "nums = [2, 2, 1]",
            "output": "1"
          },
          {
            "input": "nums = [4, 1, 2, 1, 2]",
            "output": "4"
          }
        ],
        "constraints": [
          "1 ≤ nums.length ≤ 3 × 10⁴",
          "-3 × 10⁴ ≤ nums[i] ≤ 3 × 10⁴",
          "Exactly one element appears once; the rest appear exactly twice"
        ],
        "starter": "function singleNumber(nums) {\n  \n}",
        "pythonStarter": "def single_number(nums):\n    pass",
        "functionName": "singleNumber",
        "pythonFunctionName": "single_number",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                2,
                2,
                1
              ]
            ],
            "expected": 1,
            "label": "nums = [2,2,1]"
          },
          {
            "input": [
              [
                4,
                1,
                2,
                1,
                2
              ]
            ],
            "expected": 4,
            "label": "nums = [4,1,2,1,2]"
          },
          {
            "input": [
              [
                1
              ]
            ],
            "expected": 1,
            "label": "nums = [1]"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                7,
                3,
                7
              ]
            ],
            "expected": 3
          },
          {
            "input": [
              [
                -1,
                -1,
                5
              ]
            ],
            "expected": 5
          }
        ],
        "explanation": "XOR every number together. A number XORed with itself is 0, and XOR is commutative/associative, so all paired numbers cancel out, leaving only the single number. O(n) time, O(1) space."
      },
      {
        "id": "te10",
        "type": "code",
        "title": "Move Zeroes to the End",
        "description": "Given an integer array <code>nums</code>, return a new array with all <code>0</code>s moved to the end, while keeping the <strong>relative order</strong> of the non-zero elements the same.",
        "examples": [
          {
            "input": "nums = [0, 1, 0, 3, 12]",
            "output": "[1, 3, 12, 0, 0]"
          },
          {
            "input": "nums = [0]",
            "output": "[0]"
          }
        ],
        "constraints": [
          "1 ≤ nums.length ≤ 10⁴",
          "-2³¹ ≤ nums[i] ≤ 2³¹ - 1"
        ],
        "starter": "function moveZeroesToEnd(nums) {\n  \n}",
        "pythonStarter": "def move_zeroes_to_end(nums):\n    pass",
        "functionName": "moveZeroesToEnd",
        "pythonFunctionName": "move_zeroes_to_end",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                0,
                1,
                0,
                3,
                12
              ]
            ],
            "expected": [
              1,
              3,
              12,
              0,
              0
            ],
            "label": "nums = [0,1,0,3,12]"
          },
          {
            "input": [
              [
                0
              ]
            ],
            "expected": [
              0
            ],
            "label": "nums = [0]"
          },
          {
            "input": [
              [
                1,
                2,
                3
              ]
            ],
            "expected": [
              1,
              2,
              3
            ],
            "label": "nums = [1,2,3]"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              []
            ],
            "expected": []
          },
          {
            "input": [
              [
                0,
                0,
                1
              ]
            ],
            "expected": [
              1,
              0,
              0
            ]
          }
        ],
        "explanation": "Walk through nums once, pushing every non-zero value into a result array and counting the zeroes seen. After the loop, push that many zeroes onto the end. O(n) time, O(n) space."
      },
      {
        "id": "te11",
        "type": "code",
        "title": "Best Time to Buy and Sell Stock",
        "description": "You are given an array <code>prices</code> where <code>prices[i]</code> is the price of a stock on day <code>i</code>. You want to maximize your profit by choosing a single day to buy and a later day to sell. Return the <strong>maximum profit</strong> you can achieve, or <code>0</code> if no profit is possible.",
        "examples": [
          {
            "input": "prices = [7,1,5,3,6,4]",
            "output": "5",
            "explanation": "Buy on day 2 (price 1), sell on day 5 (price 6), profit = 5."
          },
          {
            "input": "prices = [7,6,4,3,1]",
            "output": "0"
          }
        ],
        "constraints": [
          "1 ≤ prices.length ≤ 10⁵",
          "0 ≤ prices[i] ≤ 10⁴"
        ],
        "starter": "function maxProfit(prices) {\n  \n}",
        "pythonStarter": "def max_profit(prices):\n    pass",
        "functionName": "maxProfit",
        "pythonFunctionName": "max_profit",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                7,
                1,
                5,
                3,
                6,
                4
              ]
            ],
            "expected": 5,
            "label": "prices = [7,1,5,3,6,4]"
          },
          {
            "input": [
              [
                7,
                6,
                4,
                3,
                1
              ]
            ],
            "expected": 0,
            "label": "prices = [7,6,4,3,1]"
          },
          {
            "input": [
              [
                2,
                4,
                1
              ]
            ],
            "expected": 2,
            "label": "prices = [2,4,1]"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                1
              ]
            ],
            "expected": 0
          },
          {
            "input": [
              [
                1,
                2
              ]
            ],
            "expected": 1
          }
        ],
        "explanation": "Track the lowest price seen so far while scanning left to right. At each day, check if selling today (price - minPrice) beats the best profit found so far. O(n) time, O(1) space."
      },
      {
        "id": "te12",
        "type": "code",
        "title": "Valid Parentheses",
        "description": "Given a string <code>s</code> containing only the characters <code>(</code>, <code>)</code>, <code>{</code>, <code>}</code>, <code>[</code>, and <code>]</code>, return <code>true</code> if every bracket is closed in the correct order.",
        "examples": [
          {
            "input": "s = \"()[]{}\"",
            "output": "true"
          },
          {
            "input": "s = \"(]\"",
            "output": "false"
          }
        ],
        "constraints": [
          "1 ≤ s.length ≤ 10⁴",
          "s consists only of bracket characters"
        ],
        "starter": "function isValidParentheses(s) {\n  \n}",
        "pythonStarter": "def is_valid_parentheses(s):\n    pass",
        "functionName": "isValidParentheses",
        "pythonFunctionName": "is_valid_parentheses",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              "()"
            ],
            "expected": true,
            "label": "s = \"()\""
          },
          {
            "input": [
              "()[]{}"
            ],
            "expected": true,
            "label": "s = \"()[]{}\""
          },
          {
            "input": [
              "(]"
            ],
            "expected": false,
            "label": "s = \"(]\""
          }
        ],
        "hiddenCases": [
          {
            "input": [
              ""
            ],
            "expected": true
          },
          {
            "input": [
              "((("
            ],
            "expected": false
          }
        ],
        "explanation": "Use a stack. Push opening brackets. On a closing bracket, pop the stack and check it matches the corresponding opener — if not (or the stack is empty), return false. At the end, the string is valid only if the stack is empty. O(n) time, O(n) space."
      },
      {
        "id": "te13",
        "type": "code",
        "title": "Merge Two Sorted Arrays",
        "description": "Given two arrays <code>a</code> and <code>b</code> that are each sorted in ascending order, merge them into a single sorted array and return it.",
        "examples": [
          {
            "input": "a = [1,3,5], b = [2,4,6]",
            "output": "[1,2,3,4,5,6]"
          },
          {
            "input": "a = [], b = [1,2]",
            "output": "[1,2]"
          }
        ],
        "constraints": [
          "0 ≤ a.length, b.length ≤ 10⁴",
          "-10⁹ ≤ a[i], b[i] ≤ 10⁹"
        ],
        "starter": "function mergeSortedArrays(a, b) {\n  \n}",
        "pythonStarter": "def merge_sorted_arrays(a, b):\n    pass",
        "functionName": "mergeSortedArrays",
        "pythonFunctionName": "merge_sorted_arrays",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                1,
                3,
                5
              ],
              [
                2,
                4,
                6
              ]
            ],
            "expected": [
              1,
              2,
              3,
              4,
              5,
              6
            ],
            "label": "a=[1,3,5], b=[2,4,6]"
          },
          {
            "input": [
              [],
              [
                1,
                2
              ]
            ],
            "expected": [
              1,
              2
            ],
            "label": "a=[], b=[1,2]"
          },
          {
            "input": [
              [
                1,
                2
              ],
              []
            ],
            "expected": [
              1,
              2
            ],
            "label": "a=[1,2], b=[]"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [],
              []
            ],
            "expected": []
          },
          {
            "input": [
              [
                1,
                1
              ],
              [
                1,
                1
              ]
            ],
            "expected": [
              1,
              1,
              1,
              1
            ]
          }
        ],
        "explanation": "Use two pointers, one for each array. Repeatedly compare the current elements and push the smaller one onto the result, advancing that pointer. When one array runs out, append the rest of the other. O(n + m) time, O(n + m) space."
      },
      {
        "id": "te14",
        "type": "code",
        "title": "First Unique Character",
        "description": "Given a string <code>s</code>, return the index of the <strong>first character that does not repeat</strong>. If every character repeats, return <code>-1</code>.",
        "examples": [
          {
            "input": "s = \"leetcode\"",
            "output": "0",
            "explanation": "\"l\" appears only once and is the first such character."
          },
          {
            "input": "s = \"aabb\"",
            "output": "-1"
          }
        ],
        "constraints": [
          "1 ≤ s.length ≤ 10⁵",
          "s consists of lowercase English letters"
        ],
        "starter": "function firstUniqueChar(s) {\n  \n}",
        "pythonStarter": "def first_unique_char(s):\n    pass",
        "functionName": "firstUniqueChar",
        "pythonFunctionName": "first_unique_char",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              "leetcode"
            ],
            "expected": 0,
            "label": "s = \"leetcode\""
          },
          {
            "input": [
              "loveleetcode"
            ],
            "expected": 2,
            "label": "s = \"loveleetcode\""
          },
          {
            "input": [
              "aabb"
            ],
            "expected": -1,
            "label": "s = \"aabb\""
          }
        ],
        "hiddenCases": [
          {
            "input": [
              "a"
            ],
            "expected": 0
          },
          {
            "input": [
              "aa"
            ],
            "expected": -1
          }
        ],
        "explanation": "First pass: count occurrences of every character with a hash map. Second pass: scan left to right and return the first index whose count is exactly 1. O(n) time, O(1) space (bounded alphabet)."
      },
      {
        "id": "te15",
        "type": "code",
        "title": "Reverse an Integer",
        "description": "Given a signed 32-bit integer <code>x</code>, return <code>x</code> with its digits reversed. If reversing causes the value to fall outside the signed 32-bit integer range <code>[-2³¹, 2³¹ - 1]</code>, return <code>0</code> instead.",
        "examples": [
          {
            "input": "x = 123",
            "output": "321"
          },
          {
            "input": "x = -123",
            "output": "-321"
          },
          {
            "input": "x = 120",
            "output": "21"
          }
        ],
        "constraints": [
          "-2³¹ ≤ x ≤ 2³¹ - 1"
        ],
        "starter": "function reverseInteger(x) {\n  \n}",
        "pythonStarter": "def reverse_integer(x):\n    pass",
        "functionName": "reverseInteger",
        "pythonFunctionName": "reverse_integer",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              123
            ],
            "expected": 321,
            "label": "x = 123"
          },
          {
            "input": [
              -123
            ],
            "expected": -321,
            "label": "x = -123"
          },
          {
            "input": [
              120
            ],
            "expected": 21,
            "label": "x = 120"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              0
            ],
            "expected": 0
          },
          {
            "input": [
              1534236469
            ],
            "expected": 0
          }
        ],
        "explanation": "Take the absolute value, convert to a string, reverse it, and parse it back to a number, then reapply the sign. Check the result against the 32-bit signed range and return 0 if it overflows. O(d) time where d is the number of digits."
      },
      {
        "id": "te16",
        "type": "code",
        "title": "Power of Two",
        "description": "Given an integer <code>n</code>, return <code>true</code> if it is a power of two (<code>1, 2, 4, 8, ...</code>), and <code>false</code> otherwise.",
        "examples": [
          {
            "input": "n = 1",
            "output": "true",
            "explanation": "2⁰ = 1"
          },
          {
            "input": "n = 16",
            "output": "true"
          },
          {
            "input": "n = 3",
            "output": "false"
          }
        ],
        "constraints": [
          "-2³¹ ≤ n ≤ 2³¹ - 1"
        ],
        "starter": "function isPowerOfTwo(n) {\n  \n}",
        "pythonStarter": "def is_power_of_two(n):\n    pass",
        "functionName": "isPowerOfTwo",
        "pythonFunctionName": "is_power_of_two",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              1
            ],
            "expected": true,
            "label": "n = 1"
          },
          {
            "input": [
              16
            ],
            "expected": true,
            "label": "n = 16"
          },
          {
            "input": [
              3
            ],
            "expected": false,
            "label": "n = 3"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              0
            ],
            "expected": false
          },
          {
            "input": [
              -4
            ],
            "expected": false
          }
        ],
        "explanation": "A power of two has exactly one bit set in its binary representation. n must be positive, and `n & (n - 1)` clears the lowest set bit — if the result is 0, n had only one bit set. O(1) time and space."
      },
      {
        "id": "te17",
        "type": "code",
        "title": "Nth Fibonacci Number",
        "description": "Given an integer <code>n</code>, return the <code>n</code>th number in the Fibonacci sequence, where <code>fib(0) = 0</code>, <code>fib(1) = 1</code>, and <code>fib(n) = fib(n-1) + fib(n-2)</code> for <code>n &gt; 1</code>.",
        "examples": [
          {
            "input": "n = 2",
            "output": "1"
          },
          {
            "input": "n = 4",
            "output": "3"
          }
        ],
        "constraints": [
          "0 ≤ n ≤ 30"
        ],
        "starter": "function fibonacci(n) {\n  \n}",
        "pythonStarter": "def fibonacci(n):\n    pass",
        "functionName": "fibonacci",
        "pythonFunctionName": "fibonacci",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              2
            ],
            "expected": 1,
            "label": "n = 2"
          },
          {
            "input": [
              3
            ],
            "expected": 2,
            "label": "n = 3"
          },
          {
            "input": [
              4
            ],
            "expected": 3,
            "label": "n = 4"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              0
            ],
            "expected": 0
          },
          {
            "input": [
              10
            ],
            "expected": 55
          }
        ],
        "explanation": "Handle the base cases n=0 and n=1 directly. Otherwise iteratively build up the sequence with two running variables instead of using naive recursion, avoiding exponential blowup. O(n) time, O(1) space."
      },
      {
        "id": "te18",
        "type": "code",
        "title": "Factorial of N",
        "description": "Given a non-negative integer <code>n</code>, return <code>n!</code> (the product of all positive integers up to <code>n</code>). By definition, <code>0! = 1</code>.",
        "examples": [
          {
            "input": "n = 5",
            "output": "120",
            "explanation": "5! = 5 × 4 × 3 × 2 × 1 = 120"
          },
          {
            "input": "n = 0",
            "output": "1"
          }
        ],
        "constraints": [
          "0 ≤ n ≤ 12"
        ],
        "starter": "function factorial(n) {\n  \n}",
        "pythonStarter": "def factorial(n):\n    pass",
        "functionName": "factorial",
        "pythonFunctionName": "factorial",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              5
            ],
            "expected": 120,
            "label": "n = 5"
          },
          {
            "input": [
              0
            ],
            "expected": 1,
            "label": "n = 0"
          },
          {
            "input": [
              1
            ],
            "expected": 1,
            "label": "n = 1"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              3
            ],
            "expected": 6
          },
          {
            "input": [
              7
            ],
            "expected": 5040
          }
        ],
        "explanation": "Classic recursion: base case returns 1 for n = 0 or n = 1, otherwise return n times factorial(n - 1). O(n) time, O(n) call-stack space."
      },
      {
        "id": "te19",
        "type": "code",
        "title": "Sum of Digits",
        "description": "Given an integer <code>n</code>, return the sum of its digits. If <code>n</code> is negative, use its absolute value.",
        "examples": [
          {
            "input": "n = 1234",
            "output": "10",
            "explanation": "1 + 2 + 3 + 4 = 10"
          },
          {
            "input": "n = -456",
            "output": "15"
          }
        ],
        "constraints": [
          "-2³¹ ≤ n ≤ 2³¹ - 1"
        ],
        "starter": "function sumOfDigits(n) {\n  \n}",
        "pythonStarter": "def sum_of_digits(n):\n    pass",
        "functionName": "sumOfDigits",
        "pythonFunctionName": "sum_of_digits",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              1234
            ],
            "expected": 10,
            "label": "n = 1234"
          },
          {
            "input": [
              0
            ],
            "expected": 0,
            "label": "n = 0"
          },
          {
            "input": [
              9
            ],
            "expected": 9,
            "label": "n = 9"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              -456
            ],
            "expected": 15
          },
          {
            "input": [
              1000
            ],
            "expected": 1
          }
        ],
        "explanation": "Take the absolute value, then repeatedly take the number mod 10 to peel off the last digit and add it to a running sum, dividing by 10 (floor) each time until the number reaches 0. O(d) time where d is the digit count."
      },
      {
        "id": "te20",
        "type": "code",
        "title": "Count Vowels in a String",
        "description": "Given a string <code>s</code>, return the number of vowel characters (<code>a, e, i, o, u</code>, case-insensitive) it contains.",
        "examples": [
          {
            "input": "s = \"hello world\"",
            "output": "3"
          },
          {
            "input": "s = \"xyz\"",
            "output": "0"
          }
        ],
        "constraints": [
          "0 ≤ s.length ≤ 10⁴",
          "s consists of English letters and spaces"
        ],
        "starter": "function countVowels(s) {\n  \n}",
        "pythonStarter": "def count_vowels(s):\n    pass",
        "functionName": "countVowels",
        "pythonFunctionName": "count_vowels",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              "hello world"
            ],
            "expected": 3,
            "label": "s = \"hello world\""
          },
          {
            "input": [
              "xyz"
            ],
            "expected": 0,
            "label": "s = \"xyz\""
          },
          {
            "input": [
              "AEIOU"
            ],
            "expected": 5,
            "label": "s = \"AEIOU\""
          }
        ],
        "hiddenCases": [
          {
            "input": [
              ""
            ],
            "expected": 0
          },
          {
            "input": [
              "QuantBattle"
            ],
            "expected": 4
          }
        ],
        "explanation": "Lowercase the string, then scan each character and check membership in a Set of vowels, incrementing a counter. O(n) time, O(1) space."
      },
      {
        "id": "te21",
        "type": "code",
        "title": "Flatten One Level",
        "description": "Given an array <code>arr</code> whose elements are either numbers or arrays of numbers, return a new flat array where any one level of nested arrays has been flattened (elements that are themselves arrays get expanded in place; plain numbers stay as-is).",
        "examples": [
          {
            "input": "arr = [1, [2, 3], 4]",
            "output": "[1, 2, 3, 4]"
          },
          {
            "input": "arr = [[1, 2], [3, 4]]",
            "output": "[1, 2, 3, 4]"
          }
        ],
        "constraints": [
          "0 ≤ arr.length ≤ 10³",
          "Each element is a number or an array of numbers (no deeper nesting)"
        ],
        "starter": "function flattenOneLevel(arr) {\n  \n}",
        "pythonStarter": "def flatten_one_level(arr):\n    pass",
        "functionName": "flattenOneLevel",
        "pythonFunctionName": "flatten_one_level",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                1,
                [
                  2,
                  3
                ],
                4
              ]
            ],
            "expected": [
              1,
              2,
              3,
              4
            ],
            "label": "arr = [1, [2,3], 4]"
          },
          {
            "input": [
              [
                [
                  1,
                  2
                ],
                [
                  3,
                  4
                ]
              ]
            ],
            "expected": [
              1,
              2,
              3,
              4
            ],
            "label": "arr = [[1,2], [3,4]]"
          },
          {
            "input": [
              [
                1,
                2,
                3
              ]
            ],
            "expected": [
              1,
              2,
              3
            ],
            "label": "arr = [1,2,3]"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              []
            ],
            "expected": []
          },
          {
            "input": [
              [
                [
                  1
                ],
                [
                  2
                ],
                [
                  3
                ]
              ]
            ],
            "expected": [
              1,
              2,
              3
            ]
          }
        ],
        "explanation": "Iterate over the outer array. If an element is an array, spread its contents into the result; otherwise push it directly. O(n) time, O(n) space."
      },
      {
        "id": "te22",
        "type": "code",
        "title": "Array Intersection (Unique)",
        "description": "Given two integer arrays <code>a</code> and <code>b</code>, return an array of the <strong>unique</strong> values that appear in both, preserving the order they first appear in <code>a</code>.",
        "examples": [
          {
            "input": "a = [1,2,2,1], b = [2,2]",
            "output": "[2]"
          },
          {
            "input": "a = [4,9,5], b = [9,4,9,8,4]",
            "output": "[4, 9]"
          }
        ],
        "constraints": [
          "0 ≤ a.length, b.length ≤ 10³",
          "0 ≤ a[i], b[i] ≤ 1000"
        ],
        "starter": "function arrayIntersection(a, b) {\n  \n}",
        "pythonStarter": "def array_intersection(a, b):\n    pass",
        "functionName": "arrayIntersection",
        "pythonFunctionName": "array_intersection",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                1,
                2,
                2,
                1
              ],
              [
                2,
                2
              ]
            ],
            "expected": [
              2
            ],
            "label": "a=[1,2,2,1], b=[2,2]"
          },
          {
            "input": [
              [
                4,
                9,
                5
              ],
              [
                9,
                4,
                9,
                8,
                4
              ]
            ],
            "expected": [
              4,
              9
            ],
            "label": "a=[4,9,5], b=[9,4,9,8,4]"
          },
          {
            "input": [
              [
                1,
                2,
                3
              ],
              [
                4,
                5,
                6
              ]
            ],
            "expected": [],
            "label": "a=[1,2,3], b=[4,5,6]"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [],
              [
                1,
                2
              ]
            ],
            "expected": []
          },
          {
            "input": [
              [
                1,
                1,
                1
              ],
              [
                1
              ]
            ],
            "expected": [
              1
            ]
          }
        ],
        "explanation": "Build a Set from b for O(1) lookups. Scan a, and whenever a value is in that Set and hasn't already been added to the result, push it and mark it as seen. O(n + m) time, O(n + m) space."
      },
      {
        "id": "te23",
        "type": "code",
        "title": "Majority Element",
        "description": "Given an array <code>nums</code> of size <code>n</code>, return the <strong>majority element</strong> — the value that appears more than <code>⌊n / 2⌋</code> times. You may assume the majority element always exists.",
        "examples": [
          {
            "input": "nums = [3,2,3]",
            "output": "3"
          },
          {
            "input": "nums = [2,2,1,1,1,2,2]",
            "output": "2"
          }
        ],
        "constraints": [
          "1 ≤ nums.length ≤ 5 × 10⁴",
          "A majority element is guaranteed to exist"
        ],
        "starter": "function majorityElement(nums) {\n  \n}",
        "pythonStarter": "def majority_element(nums):\n    pass",
        "functionName": "majorityElement",
        "pythonFunctionName": "majority_element",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                3,
                2,
                3
              ]
            ],
            "expected": 3,
            "label": "nums = [3,2,3]"
          },
          {
            "input": [
              [
                2,
                2,
                1,
                1,
                1,
                2,
                2
              ]
            ],
            "expected": 2,
            "label": "nums = [2,2,1,1,1,2,2]"
          },
          {
            "input": [
              [
                1
              ]
            ],
            "expected": 1,
            "label": "nums = [1]"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                6,
                5,
                5
              ]
            ],
            "expected": 5
          },
          {
            "input": [
              [
                1,
                1,
                2
              ]
            ],
            "expected": 1
          }
        ],
        "explanation": "Boyer-Moore voting algorithm: keep a running candidate and a count. If count hits 0, pick a new candidate. Increment count when the current number matches the candidate, otherwise decrement. The candidate left at the end is the majority element. O(n) time, O(1) space."
      },
      {
        "id": "te24",
        "type": "code",
        "title": "Remove Duplicates from Sorted Array",
        "description": "Given an integer array <code>nums</code> sorted in non-decreasing order, return a new array with duplicate values removed, keeping only the first occurrence of each value.",
        "examples": [
          {
            "input": "nums = [1,1,2]",
            "output": "[1, 2]"
          },
          {
            "input": "nums = [0,0,1,1,1,2,2,3,3,4]",
            "output": "[0, 1, 2, 3, 4]"
          }
        ],
        "constraints": [
          "0 ≤ nums.length ≤ 3 × 10⁴",
          "nums is sorted in non-decreasing order"
        ],
        "starter": "function removeDuplicatesSorted(nums) {\n  \n}",
        "pythonStarter": "def remove_duplicates_sorted(nums):\n    pass",
        "functionName": "removeDuplicatesSorted",
        "pythonFunctionName": "remove_duplicates_sorted",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                1,
                1,
                2
              ]
            ],
            "expected": [
              1,
              2
            ],
            "label": "nums = [1,1,2]"
          },
          {
            "input": [
              [
                0,
                0,
                1,
                1,
                1,
                2,
                2,
                3,
                3,
                4
              ]
            ],
            "expected": [
              0,
              1,
              2,
              3,
              4
            ],
            "label": "nums = [0,0,1,1,1,2,2,3,3,4]"
          },
          {
            "input": [
              [
                1
              ]
            ],
            "expected": [
              1
            ],
            "label": "nums = [1]"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              []
            ],
            "expected": []
          },
          {
            "input": [
              [
                1,
                1,
                1,
                1
              ]
            ],
            "expected": [
              1
            ]
          }
        ],
        "explanation": "Since the array is sorted, duplicates are always adjacent. Walk through starting at index 1, and only push a value onto the result if it differs from the previous value in the input. O(n) time, O(n) space."
      },
      {
        "id": "te25",
        "type": "code",
        "title": "Valid Palindrome (Alphanumeric Only)",
        "description": "Given a string <code>s</code>, return <code>true</code> if it is a palindrome when considering only <strong>letters and digits</strong> and ignoring case, <code>false</code> otherwise.",
        "examples": [
          {
            "input": "s = \"A man, a plan, a canal: Panama\"",
            "output": "true"
          },
          {
            "input": "s = \"race a car\"",
            "output": "false"
          }
        ],
        "constraints": [
          "1 ≤ s.length ≤ 2 × 10⁵",
          "s consists of printable ASCII characters"
        ],
        "starter": "function isValidPalindromeString(s) {\n  \n}",
        "pythonStarter": "def is_valid_palindrome_string(s):\n    pass",
        "functionName": "isValidPalindromeString",
        "pythonFunctionName": "is_valid_palindrome_string",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              "A man, a plan, a canal: Panama"
            ],
            "expected": true,
            "label": "s = \"A man, a plan, a canal: Panama\""
          },
          {
            "input": [
              "race a car"
            ],
            "expected": false,
            "label": "s = \"race a car\""
          },
          {
            "input": [
              " "
            ],
            "expected": true,
            "label": "s = \" \""
          }
        ],
        "hiddenCases": [
          {
            "input": [
              "0P"
            ],
            "expected": false
          },
          {
            "input": [
              ".,"
            ],
            "expected": true
          }
        ],
        "explanation": "Strip out everything except letters and digits and lowercase the result, then use two pointers moving inward from both ends, comparing characters until they meet or a mismatch is found. O(n) time, O(n) space."
      },
      {
        "id": "te26",
        "type": "code",
        "title": "Climbing Stairs",
        "description": "You are climbing a staircase with <code>n</code> steps. Each move you can climb either <code>1</code> or <code>2</code> steps. Return the number of distinct ways to reach the top.",
        "examples": [
          {
            "input": "n = 2",
            "output": "2",
            "explanation": "1+1 or 2."
          },
          {
            "input": "n = 3",
            "output": "3",
            "explanation": "1+1+1, 1+2, or 2+1."
          }
        ],
        "constraints": [
          "1 ≤ n ≤ 45"
        ],
        "starter": "function climbStairs(n) {\n  \n}",
        "pythonStarter": "def climb_stairs(n):\n    pass",
        "functionName": "climbStairs",
        "pythonFunctionName": "climb_stairs",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              2
            ],
            "expected": 2,
            "label": "n = 2"
          },
          {
            "input": [
              3
            ],
            "expected": 3,
            "label": "n = 3"
          },
          {
            "input": [
              1
            ],
            "expected": 1,
            "label": "n = 1"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              5
            ],
            "expected": 8
          },
          {
            "input": [
              4
            ],
            "expected": 5
          }
        ],
        "explanation": "This is the Fibonacci sequence in disguise: ways(n) = ways(n-1) + ways(n-2), since the last move is either a 1-step or a 2-step. Iterate up from the base cases using two running variables. O(n) time, O(1) space."
      },
      {
        "id": "te27",
        "type": "code",
        "title": "Binary Search",
        "description": "Given a sorted (ascending) integer array <code>nums</code> with distinct values and an integer <code>target</code>, return the index of <code>target</code> in <code>nums</code>, or <code>-1</code> if it is not present. Your solution must run in <code>O(log n)</code> time.",
        "examples": [
          {
            "input": "nums = [-1,0,3,5,9,12], target = 9",
            "output": "4"
          },
          {
            "input": "nums = [-1,0,3,5,9,12], target = 2",
            "output": "-1"
          }
        ],
        "constraints": [
          "1 ≤ nums.length ≤ 10⁴",
          "nums is sorted in strictly ascending order",
          "All values are unique"
        ],
        "starter": "function binarySearchIndex(nums, target) {\n  \n}",
        "pythonStarter": "def binary_search_index(nums, target):\n    pass",
        "functionName": "binarySearchIndex",
        "pythonFunctionName": "binary_search_index",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                -1,
                0,
                3,
                5,
                9,
                12
              ],
              9
            ],
            "expected": 4,
            "label": "nums=[-1,0,3,5,9,12], target=9"
          },
          {
            "input": [
              [
                -1,
                0,
                3,
                5,
                9,
                12
              ],
              2
            ],
            "expected": -1,
            "label": "nums=[-1,0,3,5,9,12], target=2"
          },
          {
            "input": [
              [
                5
              ],
              5
            ],
            "expected": 0,
            "label": "nums=[5], target=5"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [],
              5
            ],
            "expected": -1
          },
          {
            "input": [
              [
                1,
                2,
                3,
                4,
                5
              ],
              1
            ],
            "expected": 0
          }
        ],
        "explanation": "Maintain a low and high pointer over the search range. Repeatedly check the midpoint: if it matches target, return its index; if it's too small, search the right half; otherwise search the left half. O(log n) time, O(1) space."
      },
      {
        "id": "te28",
        "type": "code",
        "title": "Find the Maximum Value",
        "description": "Given a non-empty array of integers <code>nums</code>, return the largest value in the array without using a built-in max function.",
        "examples": [
          {
            "input": "nums = [1, 3, 2]",
            "output": "3"
          },
          {
            "input": "nums = [-5, -2, -9]",
            "output": "-2"
          }
        ],
        "constraints": [
          "1 ≤ nums.length ≤ 10⁵",
          "-10⁹ ≤ nums[i] ≤ 10⁹"
        ],
        "starter": "function findMax(nums) {\n  \n}",
        "pythonStarter": "def find_max(nums):\n    pass",
        "functionName": "findMax",
        "pythonFunctionName": "find_max",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                1,
                3,
                2
              ]
            ],
            "expected": 3,
            "label": "nums = [1,3,2]"
          },
          {
            "input": [
              [
                -5,
                -2,
                -9
              ]
            ],
            "expected": -2,
            "label": "nums = [-5,-2,-9]"
          },
          {
            "input": [
              [
                7
              ]
            ],
            "expected": 7,
            "label": "nums = [7]"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                1,
                1,
                1
              ]
            ],
            "expected": 1
          },
          {
            "input": [
              [
                3,
                3,
                7,
                7,
                2
              ]
            ],
            "expected": 7
          }
        ],
        "explanation": "Initialize a running max to the first element, then scan the rest of the array and update it whenever a larger value is found. O(n) time, O(1) space."
      },
      {
        "id": "te29",
        "type": "code",
        "title": "Chunk an Array",
        "description": "Given an array <code>arr</code> and a positive integer <code>size</code>, split <code>arr</code> into consecutive chunks of length <code>size</code> and return the array of chunks. The final chunk may be shorter if <code>arr.length</code> is not evenly divisible.",
        "examples": [
          {
            "input": "arr = [1,2,3,4,5], size = 2",
            "output": "[[1,2],[3,4],[5]]"
          },
          {
            "input": "arr = [1,2,3], size = 5",
            "output": "[[1,2,3]]"
          }
        ],
        "constraints": [
          "0 ≤ arr.length ≤ 10⁴",
          "1 ≤ size ≤ 10⁴"
        ],
        "starter": "function chunkArray(arr, size) {\n  \n}",
        "pythonStarter": "def chunk_array(arr, size):\n    pass",
        "functionName": "chunkArray",
        "pythonFunctionName": "chunk_array",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                1,
                2,
                3,
                4,
                5
              ],
              2
            ],
            "expected": [
              [
                1,
                2
              ],
              [
                3,
                4
              ],
              [
                5
              ]
            ],
            "label": "arr=[1,2,3,4,5], size=2"
          },
          {
            "input": [
              [
                1,
                2,
                3,
                4
              ],
              2
            ],
            "expected": [
              [
                1,
                2
              ],
              [
                3,
                4
              ]
            ],
            "label": "arr=[1,2,3,4], size=2"
          },
          {
            "input": [
              [
                1,
                2,
                3
              ],
              1
            ],
            "expected": [
              [
                1
              ],
              [
                2
              ],
              [
                3
              ]
            ],
            "label": "arr=[1,2,3], size=1"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [],
              3
            ],
            "expected": []
          },
          {
            "input": [
              [
                1,
                2,
                3
              ],
              5
            ],
            "expected": [
              [
                1,
                2,
                3
              ]
            ]
          }
        ],
        "explanation": "Loop over the array in steps of `size`, using `slice(i, i + size)` to pull out each chunk and push it onto the result. O(n) time, O(n) space."
      },
      {
        "id": "te30",
        "type": "code",
        "title": "Basic String Compression",
        "description": "Given a string <code>s</code> of lowercase letters, compress it by replacing each run of consecutive identical characters with the character followed by the run length. Return the compressed string (do not compare it to the original length — always return the run-length version).",
        "examples": [
          {
            "input": "s = \"aabcccccaaa\"",
            "output": "\"a2b1c5a3\""
          },
          {
            "input": "s = \"abcdef\"",
            "output": "\"a1b1c1d1e1f1\""
          }
        ],
        "constraints": [
          "0 ≤ s.length ≤ 10⁴",
          "s consists of lowercase English letters"
        ],
        "starter": "function compressString(s) {\n  \n}",
        "pythonStarter": "def compress_string(s):\n    pass",
        "functionName": "compressString",
        "pythonFunctionName": "compress_string",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              "aabcccccaaa"
            ],
            "expected": "a2b1c5a3",
            "label": "s = \"aabcccccaaa\""
          },
          {
            "input": [
              "abcdef"
            ],
            "expected": "a1b1c1d1e1f1",
            "label": "s = \"abcdef\""
          },
          {
            "input": [
              "aaaa"
            ],
            "expected": "a4",
            "label": "s = \"aaaa\""
          }
        ],
        "hiddenCases": [
          {
            "input": [
              ""
            ],
            "expected": ""
          },
          {
            "input": [
              "a"
            ],
            "expected": "a1"
          }
        ],
        "explanation": "Walk through the string tracking a run count. Whenever the next character differs from the current run's character (or the string ends), append the character and its count to the result and reset the counter. O(n) time, O(n) space."
      },
      {
        "id": "te31",
        "type": "code",
        "title": "Rotate Array Right",
        "description": "Given an array <code>nums</code> and a non-negative integer <code>k</code>, return a new array rotated to the right by <code>k</code> steps (elements that fall off the end wrap around to the front).",
        "examples": [
          {
            "input": "nums = [1,2,3,4,5,6,7], k = 3",
            "output": "[5,6,7,1,2,3,4]"
          },
          {
            "input": "nums = [-1,-100,3,99], k = 2",
            "output": "[3,99,-1,-100]"
          }
        ],
        "constraints": [
          "0 ≤ nums.length ≤ 10⁵",
          "0 ≤ k ≤ 10⁵"
        ],
        "starter": "function rotateArrayRight(nums, k) {\n  \n}",
        "pythonStarter": "def rotate_array_right(nums, k):\n    pass",
        "functionName": "rotateArrayRight",
        "pythonFunctionName": "rotate_array_right",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                1,
                2,
                3,
                4,
                5,
                6,
                7
              ],
              3
            ],
            "expected": [
              5,
              6,
              7,
              1,
              2,
              3,
              4
            ],
            "label": "nums=[1,2,3,4,5,6,7], k=3"
          },
          {
            "input": [
              [
                -1,
                -100,
                3,
                99
              ],
              2
            ],
            "expected": [
              3,
              99,
              -1,
              -100
            ],
            "label": "nums=[-1,-100,3,99], k=2"
          },
          {
            "input": [
              [
                1,
                2
              ],
              0
            ],
            "expected": [
              1,
              2
            ],
            "label": "nums=[1,2], k=0"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [],
              3
            ],
            "expected": []
          },
          {
            "input": [
              [
                1
              ],
              5
            ],
            "expected": [
              1
            ]
          }
        ],
        "explanation": "Normalize k with `k % n` to handle k larger than the array length (and guard against an empty array). The rotated array is the last k elements followed by the first n-k elements — build it with two slices. O(n) time, O(n) space."
      },
      {
        "id": "te32",
        "type": "code",
        "title": "Greatest Common Divisor",
        "description": "Given two integers <code>a</code> and <code>b</code>, return their <strong>greatest common divisor</strong> (GCD) — the largest positive integer that divides both evenly.",
        "examples": [
          {
            "input": "a = 12, b = 18",
            "output": "6"
          },
          {
            "input": "a = 7, b = 13",
            "output": "1"
          }
        ],
        "constraints": [
          "-10⁶ ≤ a, b ≤ 10⁶",
          "a and b are not both 0"
        ],
        "starter": "function gcdOfTwoNumbers(a, b) {\n  \n}",
        "pythonStarter": "def gcd_of_two_numbers(a, b):\n    pass",
        "functionName": "gcdOfTwoNumbers",
        "pythonFunctionName": "gcd_of_two_numbers",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              12,
              18
            ],
            "expected": 6,
            "label": "a=12, b=18"
          },
          {
            "input": [
              7,
              13
            ],
            "expected": 1,
            "label": "a=7, b=13"
          },
          {
            "input": [
              0,
              5
            ],
            "expected": 5,
            "label": "a=0, b=5"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              -12,
              18
            ],
            "expected": 6
          },
          {
            "input": [
              17,
              17
            ],
            "expected": 17
          }
        ],
        "explanation": "The Euclidean algorithm: repeatedly replace (a, b) with (b, a mod b) until b becomes 0 — at that point a holds the GCD. Take absolute values first so negative inputs work correctly. O(log(min(a,b))) time, O(1) space."
      },
      {
        "id": "te33",
        "type": "code",
        "title": "Is Prime Number",
        "description": "Given an integer <code>n</code>, return <code>true</code> if it is a <strong>prime number</strong> (greater than 1, with no positive divisors other than 1 and itself), and <code>false</code> otherwise.",
        "examples": [
          {
            "input": "n = 7",
            "output": "true"
          },
          {
            "input": "n = 10",
            "output": "false",
            "explanation": "10 = 2 × 5"
          }
        ],
        "constraints": [
          "-10⁴ ≤ n ≤ 10⁶"
        ],
        "starter": "function isPrime(n) {\n  \n}",
        "pythonStarter": "def is_prime(n):\n    pass",
        "functionName": "isPrime",
        "pythonFunctionName": "is_prime",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              7
            ],
            "expected": true,
            "label": "n = 7"
          },
          {
            "input": [
              10
            ],
            "expected": false,
            "label": "n = 10"
          },
          {
            "input": [
              2
            ],
            "expected": true,
            "label": "n = 2"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              1
            ],
            "expected": false
          },
          {
            "input": [
              97
            ],
            "expected": true
          }
        ],
        "explanation": "Numbers less than 2 are never prime. Otherwise, check for a divisor from 2 up to √n — if none divide n evenly, it's prime. Checking only up to the square root is enough because factors pair up around it. O(√n) time, O(1) space."
      },
      {
        "id": "te34",
        "type": "code",
        "title": "Reverse the Words in a Sentence",
        "description": "Given a string <code>s</code> containing words separated by spaces (possibly with extra leading, trailing, or multiple spaces between words), return a string with the words in <strong>reverse order</strong>, separated by a single space, with no leading or trailing whitespace.",
        "examples": [
          {
            "input": "s = \"the sky is blue\"",
            "output": "\"blue is sky the\""
          },
          {
            "input": "s = \"  hello world  \"",
            "output": "\"world hello\""
          }
        ],
        "constraints": [
          "1 ≤ s.length ≤ 10⁴",
          "s contains at least one non-space character"
        ],
        "starter": "function reverseWords(s) {\n  \n}",
        "pythonStarter": "def reverse_words(s):\n    pass",
        "functionName": "reverseWords",
        "pythonFunctionName": "reverse_words",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              "the sky is blue"
            ],
            "expected": "blue is sky the",
            "label": "s = \"the sky is blue\""
          },
          {
            "input": [
              "  hello world  "
            ],
            "expected": "world hello",
            "label": "s = \"  hello world  \""
          },
          {
            "input": [
              "a good   example"
            ],
            "expected": "example good a",
            "label": "s = \"a good   example\""
          }
        ],
        "hiddenCases": [
          {
            "input": [
              "single"
            ],
            "expected": "single"
          },
          {
            "input": [
              "  a  "
            ],
            "expected": "a"
          }
        ],
        "explanation": "Trim the string, split on one-or-more whitespace characters using a regex, reverse the resulting array of words, and join them back with single spaces. O(n) time, O(n) space."
      },
      {
        "id": "te35",
        "type": "code",
        "title": "Count Occurrences of a Target",
        "description": "Given an integer array <code>nums</code> and a value <code>target</code>, return how many times <code>target</code> appears in <code>nums</code>.",
        "examples": [
          {
            "input": "nums = [1,2,2,3,2], target = 2",
            "output": "3"
          },
          {
            "input": "nums = [1,2,3], target = 5",
            "output": "0"
          }
        ],
        "constraints": [
          "0 ≤ nums.length ≤ 10⁵",
          "-10⁹ ≤ nums[i], target ≤ 10⁹"
        ],
        "starter": "function countOccurrences(nums, target) {\n  \n}",
        "pythonStarter": "def count_occurrences(nums, target):\n    pass",
        "functionName": "countOccurrences",
        "pythonFunctionName": "count_occurrences",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                1,
                2,
                2,
                3,
                2
              ],
              2
            ],
            "expected": 3,
            "label": "nums=[1,2,2,3,2], target=2"
          },
          {
            "input": [
              [
                1,
                2,
                3
              ],
              5
            ],
            "expected": 0,
            "label": "nums=[1,2,3], target=5"
          },
          {
            "input": [
              [],
              1
            ],
            "expected": 0,
            "label": "nums=[], target=1"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                4
              ],
              4
            ],
            "expected": 1
          },
          {
            "input": [
              [
                -1,
                -1,
                -1
              ],
              -1
            ],
            "expected": 3
          }
        ],
        "explanation": "Scan the array once, incrementing a counter whenever the current element equals target. O(n) time, O(1) space."
      },
      {
        "id": "te36",
        "type": "code",
        "title": "Ransom Note",
        "description": "Given two strings <code>ransomNote</code> and <code>magazine</code>, return <code>true</code> if <code>ransomNote</code> can be built by using letters from <code>magazine</code>, where each letter in <code>magazine</code> can be used <strong>at most once</strong>.",
        "examples": [
          {
            "input": "ransomNote = \"aa\", magazine = \"aab\"",
            "output": "true"
          },
          {
            "input": "ransomNote = \"aa\", magazine = \"ab\"",
            "output": "false"
          }
        ],
        "constraints": [
          "0 ≤ ransomNote.length, magazine.length ≤ 5 × 10⁴",
          "Both strings consist of lowercase English letters"
        ],
        "starter": "function canConstructRansomNote(ransomNote, magazine) {\n  \n}",
        "pythonStarter": "def can_construct_ransom_note(ransom_note, magazine):\n    pass",
        "functionName": "canConstructRansomNote",
        "pythonFunctionName": "can_construct_ransom_note",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              "a",
              "b"
            ],
            "expected": false,
            "label": "ransomNote=\"a\", magazine=\"b\""
          },
          {
            "input": [
              "aa",
              "ab"
            ],
            "expected": false,
            "label": "ransomNote=\"aa\", magazine=\"ab\""
          },
          {
            "input": [
              "aa",
              "aab"
            ],
            "expected": true,
            "label": "ransomNote=\"aa\", magazine=\"aab\""
          }
        ],
        "hiddenCases": [
          {
            "input": [
              "",
              "abc"
            ],
            "expected": true
          },
          {
            "input": [
              "abc",
              "abc"
            ],
            "expected": true
          }
        ],
        "explanation": "Count each letter available in magazine using a hash map. Then scan ransomNote, decrementing counts as letters are used — if a letter is unavailable (count is 0 or missing), return false. O(n + m) time, O(1) space (bounded alphabet)."
      },
      {
        "id": "te37",
        "type": "code",
        "title": "Is Subsequence",
        "description": "Given two strings <code>s</code> and <code>t</code>, return <code>true</code> if <code>s</code> is a <strong>subsequence</strong> of <code>t</code> — meaning the characters of <code>s</code> appear in <code>t</code> in the same order, though not necessarily contiguously.",
        "examples": [
          {
            "input": "s = \"abc\", t = \"ahbgdc\"",
            "output": "true"
          },
          {
            "input": "s = \"axc\", t = \"ahbgdc\"",
            "output": "false"
          }
        ],
        "constraints": [
          "0 ≤ s.length ≤ 100",
          "0 ≤ t.length ≤ 10⁴"
        ],
        "starter": "function isSubsequence(s, t) {\n  \n}",
        "pythonStarter": "def is_subsequence(s, t):\n    pass",
        "functionName": "isSubsequence",
        "pythonFunctionName": "is_subsequence",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              "abc",
              "ahbgdc"
            ],
            "expected": true,
            "label": "s=\"abc\", t=\"ahbgdc\""
          },
          {
            "input": [
              "axc",
              "ahbgdc"
            ],
            "expected": false,
            "label": "s=\"axc\", t=\"ahbgdc\""
          },
          {
            "input": [
              "",
              "ahbgdc"
            ],
            "expected": true,
            "label": "s=\"\", t=\"ahbgdc\""
          }
        ],
        "hiddenCases": [
          {
            "input": [
              "abc",
              ""
            ],
            "expected": false
          },
          {
            "input": [
              "ace",
              "abcde"
            ],
            "expected": true
          }
        ],
        "explanation": "Use two pointers, one into s and one into t. Advance the t-pointer through every character; whenever it matches the current s-pointer character, advance the s-pointer too. If the s-pointer reaches the end of s, all characters were found in order. O(n) time, O(1) space."
      },
      {
        "id": "te38",
        "type": "code",
        "title": "Running Sum of an Array",
        "description": "Given an array <code>nums</code>, return a new array where each element at index <code>i</code> is the sum of <code>nums[0..i]</code> (the running total).",
        "examples": [
          {
            "input": "nums = [1,2,3,4]",
            "output": "[1,3,6,10]"
          },
          {
            "input": "nums = [1,1,1,1,1]",
            "output": "[1,2,3,4,5]"
          }
        ],
        "constraints": [
          "1 ≤ nums.length ≤ 10³",
          "-10⁶ ≤ nums[i] ≤ 10⁶"
        ],
        "starter": "function runningSum(nums) {\n  \n}",
        "pythonStarter": "def running_sum(nums):\n    pass",
        "functionName": "runningSum",
        "pythonFunctionName": "running_sum",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                1,
                2,
                3,
                4
              ]
            ],
            "expected": [
              1,
              3,
              6,
              10
            ],
            "label": "nums = [1,2,3,4]"
          },
          {
            "input": [
              [
                1,
                1,
                1,
                1,
                1
              ]
            ],
            "expected": [
              1,
              2,
              3,
              4,
              5
            ],
            "label": "nums = [1,1,1,1,1]"
          },
          {
            "input": [
              [
                3,
                1,
                2,
                10,
                1
              ]
            ],
            "expected": [
              3,
              4,
              6,
              16,
              17
            ],
            "label": "nums = [3,1,2,10,1]"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              []
            ],
            "expected": []
          },
          {
            "input": [
              [
                -2,
                3
              ]
            ],
            "expected": [
              -2,
              1
            ]
          }
        ],
        "explanation": "Keep a running total while iterating through nums, adding each element to it and pushing the current total onto the result array. O(n) time, O(n) space."
      },
    ],
    medium: [
      {
        id: 'tm1', type: 'code',
        title: 'Valid Parentheses',
        description: 'Given a string <code>s</code> containing only the characters <code>(</code>, <code>)</code>, <code>{</code>, <code>}</code>, <code>[</code> and <code>]</code>, determine if the input string is valid.\n\nAn input string is valid if:\n• Open brackets are closed by the same type of brackets\n• Open brackets are closed in the correct order\n• Every close bracket has a corresponding open bracket',
        examples: [
          { input: 's = "()"', output: 'true' },
          { input: 's = "()[]{}"', output: 'true' },
          { input: 's = "(]"', output: 'false' },
          { input: 's = "([)]"', output: 'false' },
          { input: 's = "{[]}"', output: 'true' },
        ],
        constraints: ['1 ≤ s.length ≤ 10⁴', 's consists of parentheses only ()[]{}'],
        starter: 'function isValid(s) {\n  \n}',
        pythonStarter: 'def is_valid(s):\n    pass',
        functionName: 'isValid',
        pythonFunctionName: 'is_valid',
        comparator: 'exact',
        testCases: [
          { input: ['()'], expected: true, label: '"()"' },
          { input: ['()[]{}'], expected: true, label: '"()[]{}"' },
          { input: ['(]'], expected: false, label: '"(]"' },
          { input: ['([)]'], expected: false, label: '"([)]"' },
          { input: ['{[]}'], expected: true, label: '"{[]}"' },
        ],
        hiddenCases: [
          { input: [''], expected: true },
          { input: ['{'], expected: false },
          { input: ['(((('], expected: false },
        ],
        explanation: 'Classic stack problem. Push open brackets onto a stack. When you see a close bracket, check if the top of the stack is the matching open bracket. If not (or stack is empty), return false. At the end, the stack should be empty.',
      },
      {
        id: 'tm2', type: 'code',
        title: 'Maximum Subarray',
        description: 'Given an integer array <code>nums</code>, find the subarray with the largest sum, and return its sum.\n\nA subarray is a contiguous non-empty sequence of elements within an array.',
        examples: [
          { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', output: '6', explanation: 'Subarray [4,-1,2,1] has the largest sum = 6.' },
          { input: 'nums = [1]', output: '1' },
          { input: 'nums = [5, 4, -1, 7, 8]', output: '23' },
        ],
        constraints: ['1 ≤ nums.length ≤ 10⁵', '-10⁴ ≤ nums[i] ≤ 10⁴'],
        starter: 'function maxSubArray(nums) {\n  \n}',
        pythonStarter: 'def max_sub_array(nums):\n    pass',
        functionName: 'maxSubArray',
        pythonFunctionName: 'max_sub_array',
        comparator: 'exact',
        testCases: [
          { input: [[-2,1,-3,4,-1,2,1,-5,4]], expected: 6, label: '[-2,1,-3,4,-1,2,1,-5,4]' },
          { input: [[1]], expected: 1, label: '[1]' },
          { input: [[5,4,-1,7,8]], expected: 23, label: '[5,4,-1,7,8]' },
          { input: [[-1]], expected: -1, label: '[-1]' },
        ],
        hiddenCases: [
          { input: [[-2,-1]], expected: -1 },
          { input: [[1,2,3,-4,5]], expected: 7 },
        ],
        explanation: "Kadane's Algorithm: keep a running `currentSum`. At each element, either extend the current subarray or start fresh (whichever is larger). Track the global max. O(n) time, O(1) space.",
      },
      {
        id: 'tm3', type: 'code',
        title: 'Climbing Stairs',
        description: 'You are climbing a staircase with <code>n</code> steps. Each time you can climb <strong>1 or 2 steps</strong>. In how many distinct ways can you climb to the top?',
        examples: [
          { input: 'n = 2', output: '2', explanation: '2 ways: {1,1} or {2}' },
          { input: 'n = 3', output: '3', explanation: '3 ways: {1,1,1}, {1,2}, {2,1}' },
        ],
        constraints: ['1 ≤ n ≤ 45'],
        starter: 'function climbStairs(n) {\n  \n}',
        pythonStarter: 'def climb_stairs(n):\n    pass',
        functionName: 'climbStairs',
        pythonFunctionName: 'climb_stairs',
        comparator: 'exact',
        testCases: [
          { input: [2], expected: 2, label: 'n = 2' },
          { input: [3], expected: 3, label: 'n = 3' },
          { input: [5], expected: 8, label: 'n = 5' },
          { input: [1], expected: 1, label: 'n = 1' },
        ],
        hiddenCases: [
          { input: [10], expected: 89 },
          { input: [44], expected: 1134903170 },
        ],
        explanation: 'This is Fibonacci in disguise. ways(n) = ways(n-1) + ways(n-2). Either you came from step n-1 (1 step) or n-2 (2 steps). Use DP with two variables to get O(n) time, O(1) space.',
      },
      {
        "id": "tm4",
        "type": "code",
        "title": "Longest Substring Without Repeating Characters",
        "description": "Given a string <code>s</code>, find the length of the <strong>longest substring</strong> without repeating characters.\n\nA substring is a contiguous run of characters within the string.",
        "examples": [
          {
            "input": "s = \"abcabcbb\"",
            "output": "3",
            "explanation": "The answer is \"abc\", with length 3."
          },
          {
            "input": "s = \"bbbbb\"",
            "output": "1",
            "explanation": "The answer is \"b\", with length 1."
          },
          {
            "input": "s = \"pwwkew\"",
            "output": "3",
            "explanation": "The answer is \"wke\", with length 3. Note \"pwke\" is not a substring."
          }
        ],
        "constraints": [
          "0 ≤ s.length ≤ 5 × 10⁴",
          "s consists of English letters, digits, symbols and spaces"
        ],
        "starter": "function lengthOfLongestSubstring(s) {\n  \n}",
        "pythonStarter": "def length_of_longest_substring(s):\n    pass",
        "functionName": "lengthOfLongestSubstring",
        "pythonFunctionName": "length_of_longest_substring",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              "abcabcbb"
            ],
            "label": "s = \"abcabcbb\"",
            "expected": 3
          },
          {
            "input": [
              "bbbbb"
            ],
            "label": "s = \"bbbbb\"",
            "expected": 1
          },
          {
            "input": [
              "pwwkew"
            ],
            "label": "s = \"pwwkew\"",
            "expected": 3
          },
          {
            "input": [
              ""
            ],
            "label": "s = \"\"",
            "expected": 0
          }
        ],
        "hiddenCases": [
          {
            "input": [
              " "
            ],
            "expected": 1
          },
          {
            "input": [
              "dvdf"
            ],
            "expected": 3
          },
          {
            "input": [
              "abba"
            ],
            "expected": 2
          }
        ],
        "explanation": "Sliding window with a map of the last-seen index of each character. Expand the right edge; whenever a repeat is found inside the current window, jump the left edge past its previous occurrence. Track the max window size. O(n) time, O(min(n, charset)) space."
      },
      {
        "id": "tm5",
        "type": "code",
        "title": "Minimum Size Subarray Sum",
        "description": "Given an array of positive integers <code>nums</code> and a positive integer <code>target</code>, return the <strong>minimal length</strong> of a contiguous subarray whose sum is greater than or equal to <code>target</code>.\n\nIf no such subarray exists, return <code>0</code>.",
        "examples": [
          {
            "input": "target = 7, nums = [2,3,1,2,4,3]",
            "output": "2",
            "explanation": "The subarray [4,3] has the minimal length under the problem constraint."
          },
          {
            "input": "target = 4, nums = [1,4,4]",
            "output": "1"
          },
          {
            "input": "target = 11, nums = [1,1,1,1,1,1,1,1]",
            "output": "0",
            "explanation": "The total sum is only 8, which is less than 11."
          }
        ],
        "constraints": [
          "1 ≤ target ≤ 10⁹",
          "1 ≤ nums.length ≤ 10⁵",
          "1 ≤ nums[i] ≤ 10⁴"
        ],
        "starter": "function minSubArrayLen(target, nums) {\n  \n}",
        "pythonStarter": "def min_sub_array_len(target, nums):\n    pass",
        "functionName": "minSubArrayLen",
        "pythonFunctionName": "min_sub_array_len",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              7,
              [
                2,
                3,
                1,
                2,
                4,
                3
              ]
            ],
            "label": "target=7, nums=[2,3,1,2,4,3]",
            "expected": 2
          },
          {
            "input": [
              4,
              [
                1,
                4,
                4
              ]
            ],
            "label": "target=4, nums=[1,4,4]",
            "expected": 1
          },
          {
            "input": [
              11,
              [
                1,
                1,
                1,
                1,
                1,
                1,
                1,
                1
              ]
            ],
            "label": "target=11, nums=[1,1,1,1,1,1,1,1]",
            "expected": 0
          },
          {
            "input": [
              15,
              [
                1,
                2,
                3,
                4,
                5
              ]
            ],
            "label": "target=15, nums=[1,2,3,4,5]",
            "expected": 5
          }
        ],
        "hiddenCases": [
          {
            "input": [
              5,
              [
                1,
                2,
                3
              ]
            ],
            "expected": 2
          },
          {
            "input": [
              100,
              [
                1,
                2,
                3
              ]
            ],
            "expected": 0
          },
          {
            "input": [
              3,
              [
                3
              ]
            ],
            "expected": 1
          }
        ],
        "explanation": "Variable-size sliding window. Expand the right edge, adding to a running sum. Whenever the sum meets the target, shrink from the left while recording the smallest window size seen. O(n) time, O(1) space."
      },
      {
        "id": "tm6",
        "type": "code",
        "title": "Max Fruit Basket",
        "description": "You are visiting a row of fruit trees, represented by the array <code>fruits</code> where <code>fruits[i]</code> is the type of fruit produced by the <code>i</code>-th tree.\n\nYou have exactly <strong>two baskets</strong>, and each basket can only hold a <strong>single type</strong> of fruit (unlimited quantity). Starting at any tree, you must pick fruit from consecutive trees while moving right, stopping once a tree produces a fruit type that does not fit in either basket.\n\nReturn the <strong>maximum number of fruits</strong> you can collect.",
        "examples": [
          {
            "input": "fruits = [1, 2, 1]",
            "output": "3",
            "explanation": "Both baskets can hold types 1 and 2, so you can pick every tree."
          },
          {
            "input": "fruits = [0, 1, 2, 2]",
            "output": "3",
            "explanation": "Pick from [1,2,2]."
          },
          {
            "input": "fruits = [1, 2, 3, 2, 2]",
            "output": "4",
            "explanation": "Pick from [2,3,2,2]."
          }
        ],
        "constraints": [
          "1 ≤ fruits.length ≤ 10⁵",
          "0 ≤ fruits[i] ≤ 10⁴"
        ],
        "starter": "function totalFruit(fruits) {\n  \n}",
        "pythonStarter": "def total_fruit(fruits):\n    pass",
        "functionName": "totalFruit",
        "pythonFunctionName": "total_fruit",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                1,
                2,
                1
              ]
            ],
            "label": "fruits=[1,2,1]",
            "expected": 3
          },
          {
            "input": [
              [
                0,
                1,
                2,
                2
              ]
            ],
            "label": "fruits=[0,1,2,2]",
            "expected": 3
          },
          {
            "input": [
              [
                1,
                2,
                3,
                2,
                2
              ]
            ],
            "label": "fruits=[1,2,3,2,2]",
            "expected": 4
          },
          {
            "input": [
              [
                3,
                3,
                3,
                1,
                2,
                1,
                1,
                2,
                3,
                3,
                4
              ]
            ],
            "label": "fruits=[3,3,3,1,2,1,1,2,3,3,4]",
            "expected": 5
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                1
              ]
            ],
            "expected": 1
          },
          {
            "input": [
              [
                1,
                1,
                1,
                1
              ]
            ],
            "expected": 4
          },
          {
            "input": [
              [
                1,
                2,
                3,
                4,
                5
              ]
            ],
            "expected": 2
          }
        ],
        "explanation": "This is \"longest subarray with at most 2 distinct values\" in disguise. Maintain a sliding window with a frequency map; whenever the map has more than 2 distinct keys, shrink from the left until it has at most 2. Track the max window length. O(n) time."
      },
      {
        "id": "tm7",
        "type": "code",
        "title": "Count Zero-Sum Triplets",
        "description": "Given an integer array <code>nums</code>, return the <strong>number of unique triplets</strong> <code>[nums[i], nums[j], nums[k]]</code> (as value combinations, not indices) such that <code>i, j, k</code> are distinct indices and <code>nums[i] + nums[j] + nums[k] == 0</code>.\n\nTriplets are considered the same if they contain the same values regardless of index — count each distinct value-triplet only once.",
        "examples": [
          {
            "input": "nums = [-1, 0, 1, 2, -1, -4]",
            "output": "2",
            "explanation": "The unique triplets are [-1,-1,2] and [-1,0,1]."
          },
          {
            "input": "nums = [0, 1, 1]",
            "output": "0"
          },
          {
            "input": "nums = [0, 0, 0]",
            "output": "1",
            "explanation": "Only [0,0,0]."
          }
        ],
        "constraints": [
          "3 ≤ nums.length ≤ 3000",
          "-10⁵ ≤ nums[i] ≤ 10⁵"
        ],
        "starter": "function threeSumCount(nums) {\n  \n}",
        "pythonStarter": "def three_sum_count(nums):\n    pass",
        "functionName": "threeSumCount",
        "pythonFunctionName": "three_sum_count",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                -1,
                0,
                1,
                2,
                -1,
                -4
              ]
            ],
            "label": "nums=[-1,0,1,2,-1,-4]",
            "expected": 2
          },
          {
            "input": [
              [
                0,
                1,
                1
              ]
            ],
            "label": "nums=[0,1,1]",
            "expected": 0
          },
          {
            "input": [
              [
                0,
                0,
                0
              ]
            ],
            "label": "nums=[0,0,0]",
            "expected": 1
          },
          {
            "input": [
              [
                -2,
                0,
                1,
                1,
                2
              ]
            ],
            "label": "nums=[-2,0,1,1,2]",
            "expected": 2
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                0,
                0,
                0,
                0
              ]
            ],
            "expected": 1
          },
          {
            "input": [
              [
                1,
                2,
                -2,
                -1
              ]
            ],
            "expected": 0
          },
          {
            "input": [
              [
                3,
                -2,
                1,
                0
              ]
            ],
            "expected": 0
          }
        ],
        "explanation": "Sort the array. Fix each index i, then use two pointers (lo, hi) on the remaining range to find pairs summing to -nums[i], skipping duplicate values at each of the three positions to avoid counting the same triplet twice. O(n²) time, O(1) extra space (ignoring sort)."
      },
      {
        "id": "tm8",
        "type": "code",
        "title": "Container With Most Water",
        "description": "You are given an integer array <code>height</code> where <code>height[i]</code> is the height of a vertical line drawn at position <code>i</code>.\n\nFind two lines that, together with the x-axis, form a container holding the most water, and return that maximum <strong>area</strong>.",
        "examples": [
          {
            "input": "height = [1,8,6,2,5,4,8,3,7]",
            "output": "49",
            "explanation": "Lines at index 1 (height 8) and index 8 (height 7) form a container of width 7 and height min(8,7)=7, area 49."
          },
          {
            "input": "height = [1,1]",
            "output": "1"
          },
          {
            "input": "height = [4,3,2,1,4]",
            "output": "16"
          }
        ],
        "constraints": [
          "2 ≤ height.length ≤ 10⁵",
          "0 ≤ height[i] ≤ 10⁴"
        ],
        "starter": "function maxArea(height) {\n  \n}",
        "pythonStarter": "def max_area(height):\n    pass",
        "functionName": "maxArea",
        "pythonFunctionName": "max_area",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                1,
                8,
                6,
                2,
                5,
                4,
                8,
                3,
                7
              ]
            ],
            "label": "height=[1,8,6,2,5,4,8,3,7]",
            "expected": 49
          },
          {
            "input": [
              [
                1,
                1
              ]
            ],
            "label": "height=[1,1]",
            "expected": 1
          },
          {
            "input": [
              [
                4,
                3,
                2,
                1,
                4
              ]
            ],
            "label": "height=[4,3,2,1,4]",
            "expected": 16
          },
          {
            "input": [
              [
                1,
                2,
                1
              ]
            ],
            "label": "height=[1,2,1]",
            "expected": 2
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                1,
                2
              ]
            ],
            "expected": 1
          },
          {
            "input": [
              [
                0,
                0,
                0
              ]
            ],
            "expected": 0
          },
          {
            "input": [
              [
                6,
                4,
                3,
                1,
                9,
                2
              ]
            ],
            "expected": 24
          }
        ],
        "explanation": "Two pointers starting at both ends. Area is limited by the shorter line, so always move the pointer at the shorter line inward (moving the taller one can only decrease or keep the width while never increasing the limiting height). Track the max area seen. O(n) time, O(1) space."
      },
      {
        "id": "tm9",
        "type": "code",
        "title": "Integer Square Root",
        "description": "Given a non-negative integer <code>x</code>, return the <strong>largest integer</strong> whose square is less than or equal to <code>x</code>.\n\nYou may not use any built-in exponent or square-root function.",
        "examples": [
          {
            "input": "x = 4",
            "output": "2"
          },
          {
            "input": "x = 8",
            "output": "2",
            "explanation": "The square root of 8 is approx 2.828, and since we round down, 2 is returned."
          },
          {
            "input": "x = 1",
            "output": "1"
          }
        ],
        "constraints": [
          "0 ≤ x ≤ 2³¹ - 1"
        ],
        "starter": "function mySqrt(x) {\n  \n}",
        "pythonStarter": "def my_sqrt(x):\n    pass",
        "functionName": "mySqrt",
        "pythonFunctionName": "my_sqrt",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              4
            ],
            "label": "x = 4",
            "expected": 2
          },
          {
            "input": [
              8
            ],
            "label": "x = 8",
            "expected": 2
          },
          {
            "input": [
              1
            ],
            "label": "x = 1",
            "expected": 1
          },
          {
            "input": [
              0
            ],
            "label": "x = 0",
            "expected": 0
          }
        ],
        "hiddenCases": [
          {
            "input": [
              2147395599
            ],
            "expected": 46339
          },
          {
            "input": [
              99
            ],
            "expected": 9
          },
          {
            "input": [
              100
            ],
            "expected": 10
          }
        ],
        "explanation": "Binary search on the answer space [0, x]. For a candidate mid, check if mid*mid <= x; if so it could be the answer (search higher), otherwise search lower. O(log x) time, O(1) space — much faster than linear scanning or using Math.sqrt."
      },
      {
        "id": "tm10",
        "type": "code",
        "title": "Minimum Eating Speed",
        "description": "Koko has <code>piles</code> of bananas, where <code>piles[i]</code> is the number of bananas in the <code>i</code>-th pile. She has <code>h</code> hours before the zoo closes.\n\nEach hour Koko chooses a pile and eats up to <code>k</code> bananas from it (an integer eating speed). If the pile has fewer than <code>k</code> bananas, she finishes that pile and the leftover hour capacity is wasted (she moves to the next hour). Return the <strong>minimum integer speed</strong> <code>k</code> such that she can eat all the bananas within <code>h</code> hours.",
        "examples": [
          {
            "input": "piles = [3,6,7,11], h = 8",
            "output": "4"
          },
          {
            "input": "piles = [30,11,23,4,20], h = 5",
            "output": "30"
          },
          {
            "input": "piles = [30,11,23,4,20], h = 6",
            "output": "23"
          }
        ],
        "constraints": [
          "1 ≤ piles.length ≤ 10⁴",
          "piles.length ≤ h ≤ 10⁹",
          "1 ≤ piles[i] ≤ 10⁹"
        ],
        "starter": "function minEatingSpeed(piles, h) {\n  \n}",
        "pythonStarter": "def min_eating_speed(piles, h):\n    pass",
        "functionName": "minEatingSpeed",
        "pythonFunctionName": "min_eating_speed",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                3,
                6,
                7,
                11
              ],
              8
            ],
            "label": "piles=[3,6,7,11], h=8",
            "expected": 4
          },
          {
            "input": [
              [
                30,
                11,
                23,
                4,
                20
              ],
              5
            ],
            "label": "piles=[30,11,23,4,20], h=5",
            "expected": 30
          },
          {
            "input": [
              [
                30,
                11,
                23,
                4,
                20
              ],
              6
            ],
            "label": "piles=[30,11,23,4,20], h=6",
            "expected": 23
          },
          {
            "input": [
              [
                1,
                1,
                1,
                1
              ],
              4
            ],
            "label": "piles=[1,1,1,1], h=4",
            "expected": 1
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                312884470
              ],
              968709470
            ],
            "expected": 1
          },
          {
            "input": [
              [
                1000000000
              ],
              2
            ],
            "expected": 500000000
          },
          {
            "input": [
              [
                5
              ],
              1
            ],
            "expected": 5
          }
        ],
        "explanation": "Binary search on the possible eating speed, from 1 to max(piles). For each candidate speed, compute the total hours needed (sum of ceil(pile/speed)); if it fits within h, try a smaller speed, otherwise try a larger one. O(n log(max(piles))) time."
      },
      {
        "id": "tm11",
        "type": "code",
        "title": "Search in Rotated Sorted Array",
        "description": "You are given an integer array <code>nums</code>, sorted in ascending order with <strong>distinct values</strong>, that has been rotated at some unknown pivot. Given a <code>target</code> value, return its index in <code>nums</code>, or <code>-1</code> if it is not present.\n\nYour solution must run in <code>O(log n)</code> time.",
        "examples": [
          {
            "input": "nums = [4,5,6,7,0,1,2], target = 0",
            "output": "4"
          },
          {
            "input": "nums = [4,5,6,7,0,1,2], target = 3",
            "output": "-1"
          },
          {
            "input": "nums = [1], target = 0",
            "output": "-1"
          }
        ],
        "constraints": [
          "1 ≤ nums.length ≤ 5000",
          "-10⁴ ≤ nums[i] ≤ 10⁴",
          "All values of nums are unique",
          "nums is an ascending array possibly rotated"
        ],
        "starter": "function search(nums, target) {\n  \n}",
        "pythonStarter": "def search(nums, target):\n    pass",
        "functionName": "search",
        "pythonFunctionName": "search",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                4,
                5,
                6,
                7,
                0,
                1,
                2
              ],
              0
            ],
            "label": "nums=[4,5,6,7,0,1,2], target=0",
            "expected": 4
          },
          {
            "input": [
              [
                4,
                5,
                6,
                7,
                0,
                1,
                2
              ],
              3
            ],
            "label": "nums=[4,5,6,7,0,1,2], target=3",
            "expected": -1
          },
          {
            "input": [
              [
                1
              ],
              0
            ],
            "label": "nums=[1], target=0",
            "expected": -1
          },
          {
            "input": [
              [
                5,
                1,
                3
              ],
              5
            ],
            "label": "nums=[5,1,3], target=5",
            "expected": 0
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                1
              ],
              1
            ],
            "expected": 0
          },
          {
            "input": [
              [
                3,
                1
              ],
              1
            ],
            "expected": 1
          },
          {
            "input": [
              [
                1,
                2,
                3,
                4,
                5
              ],
              4
            ],
            "expected": 3
          }
        ],
        "explanation": "Modified binary search. At each step, one half of [lo, mid] or [mid, hi] is guaranteed to be normally sorted. Determine which half is sorted by comparing nums[lo] and nums[mid], then check whether target falls within that sorted half to decide which side to search next. O(log n) time, O(1) space."
      },
      {
        "id": "tm12",
        "type": "code",
        "title": "Binary Tree Level Order Traversal",
        "description": "A binary tree is given as a flat array <code>tree</code> using level-order indexing: the root is at index 0, and for a node at index <code>i</code>, its left child is at index <code>2i+1</code> and its right child is at index <code>2i+2</code>. A value of <code>null</code> (or a missing index) means \"no node there\".\n\nReturn the tree's values grouped <strong>level by level</strong>, top to bottom, as an array of arrays.",
        "examples": [
          {
            "input": "tree = [3,9,20,null,null,15,7]",
            "output": "[[3],[9,20],[15,7]]"
          },
          {
            "input": "tree = [1]",
            "output": "[[1]]"
          },
          {
            "input": "tree = []",
            "output": "[]"
          }
        ],
        "constraints": [
          "0 ≤ number of nodes ≤ 2000",
          "-1000 ≤ node value ≤ 1000"
        ],
        "starter": "function levelOrder(tree) {\n  \n}",
        "pythonStarter": "def level_order(tree):\n    pass",
        "functionName": "levelOrder",
        "pythonFunctionName": "level_order",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                3,
                9,
                20,
                null,
                null,
                15,
                7
              ]
            ],
            "label": "tree=[3,9,20,null,null,15,7]",
            "expected": [
              [
                3
              ],
              [
                9,
                20
              ],
              [
                15,
                7
              ]
            ]
          },
          {
            "input": [
              [
                1
              ]
            ],
            "label": "tree=[1]",
            "expected": [
              [
                1
              ]
            ]
          },
          {
            "input": [
              []
            ],
            "label": "tree=[]",
            "expected": []
          },
          {
            "input": [
              [
                1,
                2,
                3,
                4,
                5,
                6,
                7
              ]
            ],
            "label": "tree=[1,2,3,4,5,6,7]",
            "expected": [
              [
                1
              ],
              [
                2,
                3
              ],
              [
                4,
                5,
                6,
                7
              ]
            ]
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                1,
                null,
                2,
                null,
                3
              ]
            ],
            "expected": [
              [
                1
              ],
              [
                2
              ]
            ]
          },
          {
            "input": [
              [
                5,
                3,
                8,
                1,
                4,
                7,
                9
              ]
            ],
            "expected": [
              [
                5
              ],
              [
                3,
                8
              ],
              [
                1,
                4,
                7,
                9
              ]
            ]
          },
          {
            "input": [
              [
                null
              ]
            ],
            "expected": []
          }
        ],
        "explanation": "Standard BFS. Start a queue with index 0. At each step, process every index currently in the queue (one \"level\"), collecting existing values and enqueueing their children indices (2i+1, 2i+2), skipping null/out-of-range entries. O(n) time, O(n) space."
      },
      {
        "id": "tm13",
        "type": "code",
        "title": "Validate Binary Search Tree",
        "description": "A binary tree is given as a flat array <code>tree</code> using level-order indexing (root at index 0; node <code>i</code> has left child <code>2i+1</code> and right child <code>2i+2</code>; <code>null</code> means no node).\n\nReturn <code>true</code> if it is a <strong>valid binary search tree</strong>: for every node, all values in its left subtree are strictly less than the node's value, and all values in its right subtree are strictly greater.",
        "examples": [
          {
            "input": "tree = [2,1,3]",
            "output": "true"
          },
          {
            "input": "tree = [5,1,4,null,null,3,6]",
            "output": "false",
            "explanation": "The root's value is 5, but its right child's value is 4, which violates the BST rule (and 4's own left child 3 is fine locally but the subtree still fails against the root)."
          },
          {
            "input": "tree = [10,5,15,null,null,6,20]",
            "output": "false",
            "explanation": "6 is in the right subtree of 10 but is also in the left subtree of 15, and 6 < 15 is fine, but 6 must be > 10 since it's in the root's right subtree — it isn't."
          }
        ],
        "constraints": [
          "0 ≤ number of nodes ≤ 10⁴",
          "-2³¹ ≤ node value ≤ 2³¹ - 1"
        ],
        "starter": "function isValidBST(tree) {\n  \n}",
        "pythonStarter": "def is_valid_bst(tree):\n    pass",
        "functionName": "isValidBST",
        "pythonFunctionName": "is_valid_bst",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                2,
                1,
                3
              ]
            ],
            "label": "tree=[2,1,3]",
            "expected": true
          },
          {
            "input": [
              [
                5,
                1,
                4,
                null,
                null,
                3,
                6
              ]
            ],
            "label": "tree=[5,1,4,null,null,3,6]",
            "expected": false
          },
          {
            "input": [
              [
                10,
                5,
                15,
                null,
                null,
                6,
                20
              ]
            ],
            "label": "tree=[10,5,15,null,null,6,20]",
            "expected": false
          },
          {
            "input": [
              [
                1
              ]
            ],
            "label": "tree=[1]",
            "expected": true
          }
        ],
        "hiddenCases": [
          {
            "input": [
              []
            ],
            "expected": true
          },
          {
            "input": [
              [
                5,
                4,
                6,
                null,
                null,
                3,
                7
              ]
            ],
            "expected": false
          },
          {
            "input": [
              [
                2,
                2,
                2
              ]
            ],
            "expected": false
          }
        ],
        "explanation": "DFS while carrying down a valid (lo, hi) range for each node. The root can be any value; when recursing left, tighten hi to the current value; when recursing right, tighten lo. If any node falls outside its allowed range, the tree is invalid. O(n) time, O(h) space for recursion."
      },
      {
        "id": "tm14",
        "type": "code",
        "title": "Kth Smallest Element in a BST",
        "description": "A binary search tree is given as a flat array <code>tree</code> using level-order indexing (root at index 0; node <code>i</code> has left child <code>2i+1</code> and right child <code>2i+2</code>; <code>null</code> means no node).\n\nReturn the <code>k</code>-th smallest value in the tree (1-indexed).",
        "examples": [
          {
            "input": "tree = [5,3,8,1,4,7,9], k = 1",
            "output": "1"
          },
          {
            "input": "tree = [5,3,8,1,4,7,9], k = 4",
            "output": "5"
          },
          {
            "input": "tree = [3,1,4,null,2], k = 1",
            "output": "1"
          }
        ],
        "constraints": [
          "1 ≤ number of nodes ≤ 10⁴",
          "1 ≤ k ≤ number of nodes",
          "0 ≤ node value ≤ 10⁴"
        ],
        "starter": "function kthSmallest(tree, k) {\n  \n}",
        "pythonStarter": "def kth_smallest(tree, k):\n    pass",
        "functionName": "kthSmallest",
        "pythonFunctionName": "kth_smallest",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                5,
                3,
                8,
                1,
                4,
                7,
                9
              ],
              1
            ],
            "label": "tree=[5,3,8,1,4,7,9], k=1",
            "expected": 1
          },
          {
            "input": [
              [
                5,
                3,
                8,
                1,
                4,
                7,
                9
              ],
              4
            ],
            "label": "tree=[5,3,8,1,4,7,9], k=4",
            "expected": 5
          },
          {
            "input": [
              [
                3,
                1,
                4,
                null,
                2
              ],
              1
            ],
            "label": "tree=[3,1,4,null,2], k=1",
            "expected": 1
          },
          {
            "input": [
              [
                3,
                1,
                4,
                null,
                2
              ],
              3
            ],
            "label": "tree=[3,1,4,null,2], k=3",
            "expected": 3
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                1
              ],
              1
            ],
            "expected": 1
          },
          {
            "input": [
              [
                5,
                3,
                8,
                1,
                4,
                7,
                9
              ],
              7
            ],
            "expected": 9
          },
          {
            "input": [
              [
                10,
                5,
                15,
                3,
                7,
                null,
                18
              ],
              5
            ],
            "expected": 15
          }
        ],
        "explanation": "An in-order traversal (left, node, right) of a BST visits values in ascending sorted order. Collect values during in-order DFS and return the (k-1)-th entry. O(n) time, O(n) space (can be optimized to O(h) by stopping early once k values are collected)."
      },
      {
        "id": "tm15",
        "type": "code",
        "title": "Number of Islands",
        "description": "You are given an <code>m x n</code> binary grid <code>grid</code> where <code>1</code> represents land and <code>0</code> represents water.\n\nAn <strong>island</strong> is a group of land cells connected horizontally or vertically (not diagonally). Return the <strong>number of islands</strong>.",
        "examples": [
          {
            "input": "grid = [[1,1,0,0],[1,1,0,0],[0,0,1,0],[0,0,0,1]]",
            "output": "3"
          },
          {
            "input": "grid = [[1,1,1],[0,1,0],[1,1,1]]",
            "output": "1"
          },
          {
            "input": "grid = [[0,0],[0,0]]",
            "output": "0"
          }
        ],
        "constraints": [
          "1 ≤ m, n ≤ 300",
          "grid[i][j] is either 0 or 1"
        ],
        "starter": "function numIslands(grid) {\n  \n}",
        "pythonStarter": "def num_islands(grid):\n    pass",
        "functionName": "numIslands",
        "pythonFunctionName": "num_islands",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                [
                  1,
                  1,
                  0,
                  0
                ],
                [
                  1,
                  1,
                  0,
                  0
                ],
                [
                  0,
                  0,
                  1,
                  0
                ],
                [
                  0,
                  0,
                  0,
                  1
                ]
              ]
            ],
            "label": "4x4 grid with 3 islands",
            "expected": 3
          },
          {
            "input": [
              [
                [
                  1,
                  1,
                  1
                ],
                [
                  0,
                  1,
                  0
                ],
                [
                  1,
                  1,
                  1
                ]
              ]
            ],
            "label": "3x3 grid, single connected island",
            "expected": 1
          },
          {
            "input": [
              [
                [
                  0,
                  0
                ],
                [
                  0,
                  0
                ]
              ]
            ],
            "label": "2x2 grid, no land",
            "expected": 0
          },
          {
            "input": [
              [
                [
                  1
                ]
              ]
            ],
            "label": "1x1 grid, single land cell",
            "expected": 1
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                [
                  1,
                  0,
                  1,
                  0,
                  1
                ]
              ]
            ],
            "expected": 3
          },
          {
            "input": [
              [
                [
                  1,
                  1
                ],
                [
                  1,
                  1
                ]
              ]
            ],
            "expected": 1
          },
          {
            "input": [
              [
                [
                  0,
                  1,
                  0
                ],
                [
                  1,
                  0,
                  1
                ],
                [
                  0,
                  1,
                  0
                ]
              ]
            ],
            "expected": 4
          }
        ],
        "explanation": "Scan every cell; whenever an unvisited land cell is found, it is a new island — run a BFS/DFS flood fill from there marking all connected land cells as visited, then continue scanning. O(m*n) time and space."
      },
      {
        "id": "tm16",
        "type": "code",
        "title": "Course Schedule Feasibility",
        "description": "There are <code>numCourses</code> courses labeled <code>0</code> to <code>numCourses - 1</code>. You are given <code>prerequisites</code>, an array of pairs <code>[a, b]</code> meaning you must take course <code>b</code> before course <code>a</code>.\n\nReturn <code>true</code> if it is possible to finish <strong>all</strong> courses, or <code>false</code> if the requirements contain a cycle (making it impossible).",
        "examples": [
          {
            "input": "numCourses = 2, prerequisites = [[1,0]]",
            "output": "true",
            "explanation": "Take course 0 then course 1."
          },
          {
            "input": "numCourses = 2, prerequisites = [[1,0],[0,1]]",
            "output": "false",
            "explanation": "Course 0 needs course 1, and course 1 needs course 0 — a cycle."
          },
          {
            "input": "numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]",
            "output": "true"
          }
        ],
        "constraints": [
          "1 ≤ numCourses ≤ 2000",
          "0 ≤ prerequisites.length ≤ 5000",
          "prerequisites[i].length == 2"
        ],
        "starter": "function canFinish(numCourses, prerequisites) {\n  \n}",
        "pythonStarter": "def can_finish(num_courses, prerequisites):\n    pass",
        "functionName": "canFinish",
        "pythonFunctionName": "can_finish",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              2,
              [
                [
                  1,
                  0
                ]
              ]
            ],
            "label": "numCourses=2, prerequisites=[[1,0]]",
            "expected": true
          },
          {
            "input": [
              2,
              [
                [
                  1,
                  0
                ],
                [
                  0,
                  1
                ]
              ]
            ],
            "label": "numCourses=2, prerequisites=[[1,0],[0,1]]",
            "expected": false
          },
          {
            "input": [
              4,
              [
                [
                  1,
                  0
                ],
                [
                  2,
                  0
                ],
                [
                  3,
                  1
                ],
                [
                  3,
                  2
                ]
              ]
            ],
            "label": "numCourses=4, prerequisites=[[1,0],[2,0],[3,1],[3,2]]",
            "expected": true
          },
          {
            "input": [
              1,
              []
            ],
            "label": "numCourses=1, prerequisites=[]",
            "expected": true
          }
        ],
        "hiddenCases": [
          {
            "input": [
              3,
              [
                [
                  0,
                  1
                ],
                [
                  1,
                  2
                ],
                [
                  2,
                  0
                ]
              ]
            ],
            "expected": false
          },
          {
            "input": [
              5,
              [
                [
                  1,
                  0
                ],
                [
                  2,
                  1
                ],
                [
                  3,
                  2
                ],
                [
                  4,
                  3
                ]
              ]
            ],
            "expected": true
          },
          {
            "input": [
              3,
              []
            ],
            "expected": true
          }
        ],
        "explanation": "Build an adjacency list and in-degree count for each course, then run Kahn's algorithm (BFS topological sort): repeatedly remove courses with in-degree 0, decrementing the in-degree of their dependents. If every course gets processed, there is no cycle and finishing is possible. O(V + E) time."
      },
      {
        "id": "tm17",
        "type": "code",
        "title": "Rotting Oranges",
        "description": "You are given an <code>m x n</code> grid where each cell is <code>0</code> (empty), <code>1</code> (fresh orange), or <code>2</code> (rotten orange).\n\nEvery minute, any fresh orange adjacent (horizontally or vertically) to a rotten orange also becomes rotten. Return the <strong>minimum number of minutes</strong> until no fresh orange remains. If that is impossible, return <code>-1</code>.",
        "examples": [
          {
            "input": "grid = [[2,1,1],[1,1,0],[0,1,1]]",
            "output": "4"
          },
          {
            "input": "grid = [[2,1,1],[0,1,1],[1,0,1]]",
            "output": "-1",
            "explanation": "The orange in the bottom-left corner is never reached."
          },
          {
            "input": "grid = [[0,2]]",
            "output": "0"
          }
        ],
        "constraints": [
          "1 ≤ m, n ≤ 10",
          "grid[i][j] is 0, 1, or 2"
        ],
        "starter": "function orangesRotting(grid) {\n  \n}",
        "pythonStarter": "def oranges_rotting(grid):\n    pass",
        "functionName": "orangesRotting",
        "pythonFunctionName": "oranges_rotting",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                [
                  2,
                  1,
                  1
                ],
                [
                  1,
                  1,
                  0
                ],
                [
                  0,
                  1,
                  1
                ]
              ]
            ],
            "label": "grid=[[2,1,1],[1,1,0],[0,1,1]]",
            "expected": 4
          },
          {
            "input": [
              [
                [
                  2,
                  1,
                  1
                ],
                [
                  0,
                  1,
                  1
                ],
                [
                  1,
                  0,
                  1
                ]
              ]
            ],
            "label": "grid=[[2,1,1],[0,1,1],[1,0,1]]",
            "expected": -1
          },
          {
            "input": [
              [
                [
                  0,
                  2
                ]
              ]
            ],
            "label": "grid=[[0,2]]",
            "expected": 0
          },
          {
            "input": [
              [
                [
                  1
                ]
              ]
            ],
            "label": "grid=[[1]] (isolated fresh orange, never rots)",
            "expected": -1
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                [
                  0
                ]
              ]
            ],
            "expected": 0
          },
          {
            "input": [
              [
                [
                  2
                ]
              ]
            ],
            "expected": 0
          },
          {
            "input": [
              [
                [
                  2,
                  1,
                  1
                ],
                [
                  1,
                  1,
                  1
                ],
                [
                  0,
                  1,
                  2
                ]
              ]
            ],
            "expected": 2
          }
        ],
        "explanation": "Multi-source BFS: seed the queue with all initially rotten cells and count fresh oranges. Process the queue level by level (one level = one minute), rotting adjacent fresh cells and decrementing the fresh count. If fresh reaches 0, return the elapsed minutes; if the queue empties first, return -1. O(m*n) time."
      },
      {
        "id": "tm18",
        "type": "code",
        "title": "Merge Intervals Count",
        "description": "Given an array of intervals <code>intervals</code> where <code>intervals[i] = [start, end]</code>, merge all overlapping intervals and return the <strong>number of intervals</strong> remaining after merging.\n\nTwo intervals overlap (and should merge) if one starts at or before the other ends.",
        "examples": [
          {
            "input": "intervals = [[1,3],[2,6],[8,10],[15,18]]",
            "output": "3",
            "explanation": "[1,3] and [2,6] merge into [1,6], leaving [1,6],[8,10],[15,18]."
          },
          {
            "input": "intervals = [[1,4],[4,5]]",
            "output": "1",
            "explanation": "They merge into [1,5] since 4 <= 4."
          },
          {
            "input": "intervals = [[1,4],[0,4]]",
            "output": "1"
          }
        ],
        "constraints": [
          "0 ≤ intervals.length ≤ 10⁴",
          "intervals[i].length == 2",
          "0 ≤ start ≤ end ≤ 10⁵"
        ],
        "starter": "function mergeIntervalsCount(intervals) {\n  \n}",
        "pythonStarter": "def merge_intervals_count(intervals):\n    pass",
        "functionName": "mergeIntervalsCount",
        "pythonFunctionName": "merge_intervals_count",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                [
                  1,
                  3
                ],
                [
                  2,
                  6
                ],
                [
                  8,
                  10
                ],
                [
                  15,
                  18
                ]
              ]
            ],
            "label": "intervals=[[1,3],[2,6],[8,10],[15,18]]",
            "expected": 3
          },
          {
            "input": [
              [
                [
                  1,
                  4
                ],
                [
                  4,
                  5
                ]
              ]
            ],
            "label": "intervals=[[1,4],[4,5]]",
            "expected": 1
          },
          {
            "input": [
              [
                [
                  1,
                  4
                ],
                [
                  0,
                  4
                ]
              ]
            ],
            "label": "intervals=[[1,4],[0,4]]",
            "expected": 1
          },
          {
            "input": [
              [
                [
                  1,
                  4
                ],
                [
                  2,
                  3
                ]
              ]
            ],
            "label": "intervals=[[1,4],[2,3]]",
            "expected": 1
          }
        ],
        "hiddenCases": [
          {
            "input": [
              []
            ],
            "expected": 0
          },
          {
            "input": [
              [
                [
                  1,
                  2
                ]
              ]
            ],
            "expected": 1
          },
          {
            "input": [
              [
                [
                  1,
                  10
                ],
                [
                  2,
                  3
                ],
                [
                  4,
                  5
                ],
                [
                  6,
                  7
                ],
                [
                  8,
                  9
                ]
              ]
            ],
            "expected": 1
          }
        ],
        "explanation": "Sort intervals by start time. Walk through them keeping a \"current merged interval\"; if the next interval's start is <= the current merged end, extend the merge, otherwise close it out and start a new one. Count the final merged intervals. O(n log n) time."
      },
      {
        "id": "tm19",
        "type": "code",
        "title": "Insert Interval",
        "description": "You are given a list of non-overlapping intervals <code>intervals</code>, sorted by start time, and a new interval <code>newInterval</code>.\n\nInsert <code>newInterval</code> into <code>intervals</code>, merging any overlaps as needed, and return the resulting list of intervals still sorted by start time.",
        "examples": [
          {
            "input": "intervals = [[1,3],[6,9]], newInterval = [2,5]",
            "output": "[[1,5],[6,9]]"
          },
          {
            "input": "intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]",
            "output": "[[1,2],[3,10],[12,16]]"
          },
          {
            "input": "intervals = [], newInterval = [5,7]",
            "output": "[[5,7]]"
          }
        ],
        "constraints": [
          "0 ≤ intervals.length ≤ 10⁴",
          "intervals is sorted by start and non-overlapping",
          "newInterval.length == 2"
        ],
        "starter": "function insert(intervals, newInterval) {\n  \n}",
        "pythonStarter": "def insert(intervals, new_interval):\n    pass",
        "functionName": "insert",
        "pythonFunctionName": "insert",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                [
                  1,
                  3
                ],
                [
                  6,
                  9
                ]
              ],
              [
                2,
                5
              ]
            ],
            "label": "intervals=[[1,3],[6,9]], newInterval=[2,5]",
            "expected": [
              [
                1,
                5
              ],
              [
                6,
                9
              ]
            ]
          },
          {
            "input": [
              [
                [
                  1,
                  2
                ],
                [
                  3,
                  5
                ],
                [
                  6,
                  7
                ],
                [
                  8,
                  10
                ],
                [
                  12,
                  16
                ]
              ],
              [
                4,
                8
              ]
            ],
            "label": "intervals=[[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval=[4,8]",
            "expected": [
              [
                1,
                2
              ],
              [
                3,
                10
              ],
              [
                12,
                16
              ]
            ]
          },
          {
            "input": [
              [],
              [
                5,
                7
              ]
            ],
            "label": "intervals=[], newInterval=[5,7]",
            "expected": [
              [
                5,
                7
              ]
            ]
          },
          {
            "input": [
              [
                [
                  1,
                  5
                ]
              ],
              [
                6,
                8
              ]
            ],
            "label": "intervals=[[1,5]], newInterval=[6,8]",
            "expected": [
              [
                1,
                5
              ],
              [
                6,
                8
              ]
            ]
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                [
                  1,
                  5
                ]
              ],
              [
                0,
                0
              ]
            ],
            "expected": [
              [
                0,
                0
              ],
              [
                1,
                5
              ]
            ]
          },
          {
            "input": [
              [
                [
                  1,
                  5
                ]
              ],
              [
                2,
                3
              ]
            ],
            "expected": [
              [
                1,
                5
              ]
            ]
          },
          {
            "input": [
              [
                [
                  3,
                  5
                ],
                [
                  12,
                  15
                ]
              ],
              [
                6,
                6
              ]
            ],
            "expected": [
              [
                3,
                5
              ],
              [
                6,
                6
              ],
              [
                12,
                15
              ]
            ]
          }
        ],
        "explanation": "Single pass in three phases: (1) copy all intervals that end before newInterval starts, (2) merge all intervals that overlap newInterval by expanding its bounds, (3) copy the rest unchanged. Insert the (possibly expanded) newInterval between phase 1 and 3. O(n) time since input is pre-sorted."
      },
      {
        "id": "tm20",
        "type": "code",
        "title": "Minimum Meeting Rooms",
        "description": "Given an array of meeting time intervals <code>intervals</code> where <code>intervals[i] = [start, end]</code>, return the <strong>minimum number of conference rooms</strong> required so that no two overlapping meetings share a room.",
        "examples": [
          {
            "input": "intervals = [[0,30],[5,10],[15,20]]",
            "output": "2",
            "explanation": "[5,10] and [15,20] can share a room, but [0,30] overlaps both, requiring a second room."
          },
          {
            "input": "intervals = [[7,10],[2,4]]",
            "output": "1",
            "explanation": "The meetings do not overlap."
          },
          {
            "input": "intervals = [[1,5],[8,9],[8,9]]",
            "output": "2"
          }
        ],
        "constraints": [
          "0 ≤ intervals.length ≤ 10⁴",
          "0 ≤ start < end ≤ 10⁶"
        ],
        "starter": "function minMeetingRooms(intervals) {\n  \n}",
        "pythonStarter": "def min_meeting_rooms(intervals):\n    pass",
        "functionName": "minMeetingRooms",
        "pythonFunctionName": "min_meeting_rooms",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                [
                  0,
                  30
                ],
                [
                  5,
                  10
                ],
                [
                  15,
                  20
                ]
              ]
            ],
            "label": "intervals=[[0,30],[5,10],[15,20]]",
            "expected": 2
          },
          {
            "input": [
              [
                [
                  7,
                  10
                ],
                [
                  2,
                  4
                ]
              ]
            ],
            "label": "intervals=[[7,10],[2,4]]",
            "expected": 1
          },
          {
            "input": [
              [
                [
                  1,
                  5
                ],
                [
                  8,
                  9
                ],
                [
                  8,
                  9
                ]
              ]
            ],
            "label": "intervals=[[1,5],[8,9],[8,9]]",
            "expected": 2
          },
          {
            "input": [
              [
                [
                  1,
                  10
                ],
                [
                  2,
                  7
                ],
                [
                  3,
                  19
                ]
              ]
            ],
            "label": "intervals=[[1,10],[2,7],[3,19]]",
            "expected": 3
          }
        ],
        "hiddenCases": [
          {
            "input": [
              []
            ],
            "expected": 0
          },
          {
            "input": [
              [
                [
                  1,
                  2
                ]
              ]
            ],
            "expected": 1
          },
          {
            "input": [
              [
                [
                  1,
                  4
                ],
                [
                  2,
                  5
                ],
                [
                  3,
                  6
                ],
                [
                  4,
                  7
                ]
              ]
            ],
            "expected": 3
          }
        ],
        "explanation": "Separate and sort all start times and all end times independently. Walk through start times with two pointers: whenever the next start is before the earliest unfinished end, a new room is needed; otherwise a room frees up. Track the maximum concurrent rooms. O(n log n) time."
      },
      {
        "id": "tm21",
        "type": "code",
        "title": "Rotate Image 90 Degrees",
        "description": "Given an <code>n x n</code> 2D matrix <code>matrix</code>, return a <strong>new matrix</strong> representing the image rotated <strong>90 degrees clockwise</strong>.",
        "examples": [
          {
            "input": "matrix = [[1,2,3],[4,5,6],[7,8,9]]",
            "output": "[[7,4,1],[8,5,2],[9,6,3]]"
          },
          {
            "input": "matrix = [[5,1],[2,8]]",
            "output": "[[2,5],[8,1]]"
          },
          {
            "input": "matrix = [[1]]",
            "output": "[[1]]"
          }
        ],
        "constraints": [
          "1 ≤ n ≤ 20",
          "-1000 ≤ matrix[i][j] ≤ 1000"
        ],
        "starter": "function rotate(matrix) {\n  \n}",
        "pythonStarter": "def rotate(matrix):\n    pass",
        "functionName": "rotate",
        "pythonFunctionName": "rotate",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                [
                  1,
                  2,
                  3
                ],
                [
                  4,
                  5,
                  6
                ],
                [
                  7,
                  8,
                  9
                ]
              ]
            ],
            "label": "3x3 matrix",
            "expected": [
              [
                7,
                4,
                1
              ],
              [
                8,
                5,
                2
              ],
              [
                9,
                6,
                3
              ]
            ]
          },
          {
            "input": [
              [
                [
                  5,
                  1
                ],
                [
                  2,
                  8
                ]
              ]
            ],
            "label": "2x2 matrix",
            "expected": [
              [
                2,
                5
              ],
              [
                8,
                1
              ]
            ]
          },
          {
            "input": [
              [
                [
                  1
                ]
              ]
            ],
            "label": "1x1 matrix",
            "expected": [
              [
                1
              ]
            ]
          },
          {
            "input": [
              [
                [
                  1,
                  2
                ],
                [
                  3,
                  4
                ]
              ]
            ],
            "label": "2x2 matrix, second case",
            "expected": [
              [
                3,
                1
              ],
              [
                4,
                2
              ]
            ]
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                [
                  1,
                  2,
                  3,
                  4
                ],
                [
                  5,
                  6,
                  7,
                  8
                ],
                [
                  9,
                  10,
                  11,
                  12
                ],
                [
                  13,
                  14,
                  15,
                  16
                ]
              ]
            ],
            "expected": [
              [
                13,
                9,
                5,
                1
              ],
              [
                14,
                10,
                6,
                2
              ],
              [
                15,
                11,
                7,
                3
              ],
              [
                16,
                12,
                8,
                4
              ]
            ]
          },
          {
            "input": [
              [
                [
                  0,
                  0
                ],
                [
                  0,
                  0
                ]
              ]
            ],
            "expected": [
              [
                0,
                0
              ],
              [
                0,
                0
              ]
            ]
          }
        ],
        "explanation": "For a 90-degree clockwise rotation, the element at [r][c] moves to [c][n-1-r]. Build the result by mapping every source cell to its destination position directly (or, in-place: transpose the matrix then reverse each row). O(n²) time, O(n²) space for a new matrix (O(1) extra if done truly in-place)."
      },
      {
        "id": "tm22",
        "type": "code",
        "title": "Spiral Matrix Traversal",
        "description": "Given an <code>m x n</code> matrix <code>matrix</code>, return all elements of the matrix in <strong>spiral order</strong>: starting at the top-left, moving right, then down, then left, then up, and repeating inward.",
        "examples": [
          {
            "input": "matrix = [[1,2,3],[4,5,6],[7,8,9]]",
            "output": "[1,2,3,6,9,8,7,4,5]"
          },
          {
            "input": "matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]",
            "output": "[1,2,3,4,8,12,11,10,9,5,6,7]"
          },
          {
            "input": "matrix = [[1]]",
            "output": "[1]"
          }
        ],
        "constraints": [
          "0 ≤ m, n ≤ 10",
          "-100 ≤ matrix[i][j] ≤ 100"
        ],
        "starter": "function spiralOrder(matrix) {\n  \n}",
        "pythonStarter": "def spiral_order(matrix):\n    pass",
        "functionName": "spiralOrder",
        "pythonFunctionName": "spiral_order",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                [
                  1,
                  2,
                  3
                ],
                [
                  4,
                  5,
                  6
                ],
                [
                  7,
                  8,
                  9
                ]
              ]
            ],
            "label": "3x3 matrix",
            "expected": [
              1,
              2,
              3,
              6,
              9,
              8,
              7,
              4,
              5
            ]
          },
          {
            "input": [
              [
                [
                  1,
                  2,
                  3,
                  4
                ],
                [
                  5,
                  6,
                  7,
                  8
                ],
                [
                  9,
                  10,
                  11,
                  12
                ]
              ]
            ],
            "label": "3x4 matrix",
            "expected": [
              1,
              2,
              3,
              4,
              8,
              12,
              11,
              10,
              9,
              5,
              6,
              7
            ]
          },
          {
            "input": [
              [
                [
                  1
                ]
              ]
            ],
            "label": "1x1 matrix",
            "expected": [
              1
            ]
          },
          {
            "input": [
              [
                [
                  1,
                  2
                ],
                [
                  3,
                  4
                ]
              ]
            ],
            "label": "2x2 matrix",
            "expected": [
              1,
              2,
              4,
              3
            ]
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                [
                  1,
                  2,
                  3
                ]
              ]
            ],
            "expected": [
              1,
              2,
              3
            ]
          },
          {
            "input": [
              [
                [
                  1
                ],
                [
                  2
                ],
                [
                  3
                ]
              ]
            ],
            "expected": [
              1,
              2,
              3
            ]
          },
          {
            "input": [
              []
            ],
            "expected": []
          }
        ],
        "explanation": "Maintain four boundaries (top, bottom, left, right). Traverse the top row left-to-right, the right column top-to-bottom, the bottom row right-to-left, and the left column bottom-to-top, shrinking the boundaries after each side and checking they remain valid before each traversal. O(m*n) time."
      },
      {
        "id": "tm23",
        "type": "code",
        "title": "Cells Cleared by Zeroes",
        "description": "Given an <code>m x n</code> integer matrix <code>matrix</code>, whenever an element is <code>0</code>, its entire row and column would be set to <code>0</code>.\n\nInstead of mutating the matrix, return the <strong>count of cells that would change</strong> from a non-zero value to <code>0</code> under this rule (cells that were already <code>0</code> do not count as changed).",
        "examples": [
          {
            "input": "matrix = [[1,1,1],[1,0,1],[1,1,1]]",
            "output": "4",
            "explanation": "The middle row and middle column become zero; 4 previously non-zero cells change (the center itself was already 0)."
          },
          {
            "input": "matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]",
            "output": "6"
          },
          {
            "input": "matrix = [[1,2,3],[4,5,6]]",
            "output": "0"
          }
        ],
        "constraints": [
          "1 ≤ m, n ≤ 200",
          "-2³¹ ≤ matrix[i][j] ≤ 2³¹ - 1"
        ],
        "starter": "function countCellsCleared(matrix) {\n  \n}",
        "pythonStarter": "def count_cells_cleared(matrix):\n    pass",
        "functionName": "countCellsCleared",
        "pythonFunctionName": "count_cells_cleared",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                [
                  1,
                  1,
                  1
                ],
                [
                  1,
                  0,
                  1
                ],
                [
                  1,
                  1,
                  1
                ]
              ]
            ],
            "label": "3x3 with one zero in center",
            "expected": 4
          },
          {
            "input": [
              [
                [
                  0,
                  1,
                  2,
                  0
                ],
                [
                  3,
                  4,
                  5,
                  2
                ],
                [
                  1,
                  3,
                  1,
                  5
                ]
              ]
            ],
            "label": "3x4 with two zeroes in top row",
            "expected": 6
          },
          {
            "input": [
              [
                [
                  1,
                  2,
                  3
                ],
                [
                  4,
                  5,
                  6
                ]
              ]
            ],
            "label": "2x3, no zeroes",
            "expected": 0
          },
          {
            "input": [
              [
                [
                  0
                ]
              ]
            ],
            "label": "1x1 zero",
            "expected": 0
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                [
                  1
                ]
              ]
            ],
            "expected": 0
          },
          {
            "input": [
              [
                [
                  0,
                  0
                ],
                [
                  0,
                  0
                ]
              ]
            ],
            "expected": 0
          },
          {
            "input": [
              [
                [
                  1,
                  2
                ],
                [
                  3,
                  0
                ]
              ]
            ],
            "expected": 2
          }
        ],
        "explanation": "First pass: record which rows and which columns contain at least one zero (using two sets). Second pass: for every cell that is in a marked row or column and is not already zero, count it. O(m*n) time, O(m+n) space."
      },
      {
        "id": "tm24",
        "type": "code",
        "title": "Search a Sorted 2D Matrix",
        "description": "You are given an <code>m x n</code> matrix <code>matrix</code> where each row is sorted in ascending order left to right, and each column is sorted in ascending order top to bottom.\n\nGiven a <code>target</code>, return <code>true</code> if it exists in the matrix, or <code>false</code> otherwise.",
        "examples": [
          {
            "input": "matrix = [[1,4,7,11],[2,5,8,12],[3,6,9,16],[10,13,14,17]], target = 5",
            "output": "true"
          },
          {
            "input": "matrix = [[1,4,7,11],[2,5,8,12],[3,6,9,16],[10,13,14,17]], target = 20",
            "output": "false"
          },
          {
            "input": "matrix = [[1]], target = 1",
            "output": "true"
          }
        ],
        "constraints": [
          "1 ≤ m, n ≤ 300",
          "-10⁹ ≤ matrix[i][j] ≤ 10⁹",
          "Rows and columns are each sorted ascending"
        ],
        "starter": "function searchMatrix(matrix, target) {\n  \n}",
        "pythonStarter": "def search_matrix(matrix, target):\n    pass",
        "functionName": "searchMatrix",
        "pythonFunctionName": "search_matrix",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                [
                  1,
                  4,
                  7,
                  11
                ],
                [
                  2,
                  5,
                  8,
                  12
                ],
                [
                  3,
                  6,
                  9,
                  16
                ],
                [
                  10,
                  13,
                  14,
                  17
                ]
              ],
              5
            ],
            "label": "sorted matrix, target=5",
            "expected": true
          },
          {
            "input": [
              [
                [
                  1,
                  4,
                  7,
                  11
                ],
                [
                  2,
                  5,
                  8,
                  12
                ],
                [
                  3,
                  6,
                  9,
                  16
                ],
                [
                  10,
                  13,
                  14,
                  17
                ]
              ],
              20
            ],
            "label": "sorted matrix, target=20",
            "expected": false
          },
          {
            "input": [
              [
                [
                  1
                ]
              ],
              1
            ],
            "label": "1x1 matrix, target=1",
            "expected": true
          },
          {
            "input": [
              [
                [
                  1
                ]
              ],
              2
            ],
            "label": "1x1 matrix, target=2",
            "expected": false
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                [
                  1,
                  3
                ],
                [
                  5,
                  7
                ]
              ],
              7
            ],
            "expected": true
          },
          {
            "input": [
              [
                [
                  -5,
                  -4,
                  -1
                ],
                [
                  0,
                  2,
                  3
                ]
              ],
              -4
            ],
            "expected": true
          },
          {
            "input": [
              [
                [
                  1,
                  2,
                  3,
                  4,
                  5
                ]
              ],
              5
            ],
            "expected": true
          }
        ],
        "explanation": "Start at the top-right corner. If the current value equals target, return true. If it is greater than target, move left (eliminate the column); if it is less, move down (eliminate the row). This \"staircase search\" runs in O(m + n) time, O(1) space."
      },
      {
        "id": "tm25",
        "type": "code",
        "title": "Group Anagrams by Size",
        "description": "Given an array of strings <code>strs</code>, group the strings that are anagrams of each other, then return the <strong>sizes of each group</strong> as an array sorted in ascending order.\n\nTwo strings are anagrams if one can be formed by rearranging the letters of the other.",
        "examples": [
          {
            "input": "strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]",
            "output": "[1,2,3]",
            "explanation": "Groups are {eat,tea,ate} (size 3), {tan,nat} (size 2), {bat} (size 1); sorted sizes are [1,2,3]."
          },
          {
            "input": "strs = [\"\"]",
            "output": "[1]"
          },
          {
            "input": "strs = [\"a\"]",
            "output": "[1]"
          }
        ],
        "constraints": [
          "1 ≤ strs.length ≤ 10⁴",
          "0 ≤ strs[i].length ≤ 100",
          "strs[i] consists of lowercase English letters"
        ],
        "starter": "function groupAnagramSizes(strs) {\n  \n}",
        "pythonStarter": "def group_anagram_sizes(strs):\n    pass",
        "functionName": "groupAnagramSizes",
        "pythonFunctionName": "group_anagram_sizes",
        "comparator": "sorted",
        "testCases": [
          {
            "input": [
              [
                "eat",
                "tea",
                "tan",
                "ate",
                "nat",
                "bat"
              ]
            ],
            "label": "strs=[eat,tea,tan,ate,nat,bat]",
            "expected": [
              1,
              2,
              3
            ]
          },
          {
            "input": [
              [
                ""
              ]
            ],
            "label": "strs=[\"\"]",
            "expected": [
              1
            ]
          },
          {
            "input": [
              [
                "a"
              ]
            ],
            "label": "strs=[\"a\"]",
            "expected": [
              1
            ]
          },
          {
            "input": [
              [
                "abc",
                "bca",
                "cab",
                "xyz"
              ]
            ],
            "label": "strs=[abc,bca,cab,xyz]",
            "expected": [
              1,
              3
            ]
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                "listen",
                "silent",
                "enlist",
                "google"
              ]
            ],
            "expected": [
              1,
              3
            ]
          },
          {
            "input": [
              [
                "ab",
                "ba",
                "ab"
              ]
            ],
            "expected": [
              3
            ]
          },
          {
            "input": [
              []
            ],
            "expected": []
          }
        ],
        "explanation": "For each string, compute a canonical key by sorting its characters. Strings with the same key are anagrams — group them using a hash map keyed by that sorted string, then collect group sizes. O(n * k log k) time where k is max string length."
      },
      {
        "id": "tm26",
        "type": "code",
        "title": "Longest Palindromic Substring",
        "description": "Given a string <code>s</code>, return the <strong>longest palindromic substring</strong> in <code>s</code>.\n\nIf there are multiple substrings of the same maximum length, return the one whose starting index appears first.",
        "examples": [
          {
            "input": "s = \"babad\"",
            "output": "\"bab\"",
            "explanation": "\"aba\" is also a valid answer, but since \"bab\" starts earlier, it is returned."
          },
          {
            "input": "s = \"cbbd\"",
            "output": "\"bb\""
          },
          {
            "input": "s = \"a\"",
            "output": "\"a\""
          }
        ],
        "constraints": [
          "1 ≤ s.length ≤ 1000",
          "s consists of digits and English letters"
        ],
        "starter": "function longestPalindrome(s) {\n  \n}",
        "pythonStarter": "def longest_palindrome(s):\n    pass",
        "functionName": "longestPalindrome",
        "pythonFunctionName": "longest_palindrome",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              "babad"
            ],
            "label": "s = \"babad\"",
            "expected": "bab"
          },
          {
            "input": [
              "cbbd"
            ],
            "label": "s = \"cbbd\"",
            "expected": "bb"
          },
          {
            "input": [
              "a"
            ],
            "label": "s = \"a\"",
            "expected": "a"
          },
          {
            "input": [
              "racecar"
            ],
            "label": "s = \"racecar\"",
            "expected": "racecar"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              ""
            ],
            "expected": ""
          },
          {
            "input": [
              "abb"
            ],
            "expected": "bb"
          },
          {
            "input": [
              "aaaa"
            ],
            "expected": "aaaa"
          }
        ],
        "explanation": "Expand around center: for every index (and every gap between two indices, to handle even-length palindromes), expand outward while characters match, tracking the longest span found. O(n²) time, O(1) space."
      },
      {
        "id": "tm27",
        "type": "code",
        "title": "Minimum Window Substring",
        "description": "Given two strings <code>s</code> and <code>t</code>, return the <strong>shortest substring</strong> of <code>s</code> that contains every character of <code>t</code> (including duplicates, matched by count).\n\nIf no such substring exists, return an empty string <code>\"\"</code>.",
        "examples": [
          {
            "input": "s = \"ADOBECODEBANC\", t = \"ABC\"",
            "output": "\"BANC\""
          },
          {
            "input": "s = \"a\", t = \"a\"",
            "output": "\"a\""
          },
          {
            "input": "s = \"a\", t = \"aa\"",
            "output": "\"\"",
            "explanation": "s only has one 'a', but t requires two."
          }
        ],
        "constraints": [
          "1 ≤ s.length, t.length ≤ 10⁵",
          "s and t consist of English letters"
        ],
        "starter": "function minWindow(s, t) {\n  \n}",
        "pythonStarter": "def min_window(s, t):\n    pass",
        "functionName": "minWindow",
        "pythonFunctionName": "min_window",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              "ADOBECODEBANC",
              "ABC"
            ],
            "label": "s = \"ADOBECODEBANC\", t = \"ABC\"",
            "expected": "BANC"
          },
          {
            "input": [
              "a",
              "a"
            ],
            "label": "s = \"a\", t = \"a\"",
            "expected": "a"
          },
          {
            "input": [
              "a",
              "aa"
            ],
            "label": "s = \"a\", t = \"aa\"",
            "expected": ""
          },
          {
            "input": [
              "ab",
              "b"
            ],
            "label": "s = \"ab\", t = \"b\"",
            "expected": "b"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              "",
              "a"
            ],
            "expected": ""
          },
          {
            "input": [
              "aa",
              "aa"
            ],
            "expected": "aa"
          },
          {
            "input": [
              "bba",
              "ab"
            ],
            "expected": "ba"
          }
        ],
        "explanation": "Sliding window with two frequency maps: one for the required characters of t, one for the current window. Expand the right edge until the window satisfies all required counts, then shrink from the left as much as possible while still satisfying them, recording the smallest valid window. O(|s| + |t|) time."
      },
      {
        "id": "tm28",
        "type": "code",
        "title": "Decode Nested String",
        "description": "Given an encoded string <code>s</code> using the pattern <code>k[substring]</code> (meaning the enclosed <code>substring</code> is repeated <code>k</code> times), return the fully <strong>decoded string</strong>.\n\nEncodings may be nested, e.g. <code>3[a2[c]]</code> decodes to \"accaccacc\". <code>k</code> is always a positive integer, and the input is always valid.",
        "examples": [
          {
            "input": "s = \"3[a]2[bc]\"",
            "output": "\"aaabcbc\""
          },
          {
            "input": "s = \"3[a2[c]]\"",
            "output": "\"accaccacc\""
          },
          {
            "input": "s = \"2[abc]3[cd]ef\"",
            "output": "\"abcabccdcdcdef\""
          }
        ],
        "constraints": [
          "1 ≤ s.length ≤ 30",
          "s consists of lowercase letters, digits, and square brackets",
          "The decoded output length fits in a 32-bit integer"
        ],
        "starter": "function decodeString(s) {\n  \n}",
        "pythonStarter": "def decode_string(s):\n    pass",
        "functionName": "decodeString",
        "pythonFunctionName": "decode_string",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              "3[a]2[bc]"
            ],
            "label": "s = \"3[a]2[bc]\"",
            "expected": "aaabcbc"
          },
          {
            "input": [
              "3[a2[c]]"
            ],
            "label": "s = \"3[a2[c]]\"",
            "expected": "accaccacc"
          },
          {
            "input": [
              "2[abc]3[cd]ef"
            ],
            "label": "s = \"2[abc]3[cd]ef\"",
            "expected": "abcabccdcdcdef"
          },
          {
            "input": [
              "abc"
            ],
            "label": "s = \"abc\"",
            "expected": "abc"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              "1[a]"
            ],
            "expected": "a"
          },
          {
            "input": [
              "10[a]"
            ],
            "expected": "aaaaaaaaaa"
          },
          {
            "input": [
              "2[2[a]b]"
            ],
            "expected": "aabaab"
          }
        ],
        "explanation": "Use two stacks (or one stack of pairs): when a digit is seen, accumulate it into a number; on '[', push the current number and the string built so far, then reset both; on ']', pop the repeat count and previous string, and append the repeated current segment to the previous string. O(n) time where n is the decoded length."
      },
      {
        "id": "tm29",
        "type": "code",
        "title": "House Robber",
        "description": "You are a robber planning to rob houses along a street, where <code>nums[i]</code> is the amount of money in house <code>i</code>. You cannot rob two <strong>adjacent</strong> houses (it triggers an alarm).\n\nReturn the <strong>maximum amount of money</strong> you can rob without robbing two adjacent houses.",
        "examples": [
          {
            "input": "nums = [1,2,3,1]",
            "output": "4",
            "explanation": "Rob house 0 (1) and house 2 (3): 1 + 3 = 4."
          },
          {
            "input": "nums = [2,7,9,3,1]",
            "output": "12",
            "explanation": "Rob houses 0, 2, and 4: 2 + 9 + 1 = 12."
          },
          {
            "input": "nums = [2,1,1,2]",
            "output": "4"
          }
        ],
        "constraints": [
          "0 ≤ nums.length ≤ 100",
          "0 ≤ nums[i] ≤ 400"
        ],
        "starter": "function rob(nums) {\n  \n}",
        "pythonStarter": "def rob(nums):\n    pass",
        "functionName": "rob",
        "pythonFunctionName": "rob",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                1,
                2,
                3,
                1
              ]
            ],
            "label": "nums=[1,2,3,1]",
            "expected": 4
          },
          {
            "input": [
              [
                2,
                7,
                9,
                3,
                1
              ]
            ],
            "label": "nums=[2,7,9,3,1]",
            "expected": 12
          },
          {
            "input": [
              [
                2,
                1,
                1,
                2
              ]
            ],
            "label": "nums=[2,1,1,2]",
            "expected": 4
          },
          {
            "input": [
              [
                5
              ]
            ],
            "label": "nums=[5]",
            "expected": 5
          }
        ],
        "hiddenCases": [
          {
            "input": [
              []
            ],
            "expected": 0
          },
          {
            "input": [
              [
                1,
                2
              ]
            ],
            "expected": 2
          },
          {
            "input": [
              [
                100,
                1,
                1,
                100
              ]
            ],
            "expected": 200
          }
        ],
        "explanation": "1D DP: for each house, the best amount is either \"skip this house\" (carry forward the previous best) or \"rob this house\" (this house's value plus the best up to two houses back). Track only the last two running totals. O(n) time, O(1) space."
      },
      {
        "id": "tm30",
        "type": "code",
        "title": "Coin Change — Fewest Coins",
        "description": "You are given an array of coin denominations <code>coins</code> and an integer <code>amount</code>. You have an unlimited supply of each coin type.\n\nReturn the <strong>fewest number of coins</strong> needed to make up exactly <code>amount</code>. If it is not possible, return <code>-1</code>.",
        "examples": [
          {
            "input": "coins = [1,2,5], amount = 11",
            "output": "3",
            "explanation": "11 = 5 + 5 + 1"
          },
          {
            "input": "coins = [2], amount = 3",
            "output": "-1"
          },
          {
            "input": "coins = [1], amount = 0",
            "output": "0"
          }
        ],
        "constraints": [
          "1 ≤ coins.length ≤ 12",
          "1 ≤ coins[i] ≤ 2³¹ - 1",
          "0 ≤ amount ≤ 10⁴"
        ],
        "starter": "function coinChange(coins, amount) {\n  \n}",
        "pythonStarter": "def coin_change(coins, amount):\n    pass",
        "functionName": "coinChange",
        "pythonFunctionName": "coin_change",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                1,
                2,
                5
              ],
              11
            ],
            "label": "coins=[1,2,5], amount=11",
            "expected": 3
          },
          {
            "input": [
              [
                2
              ],
              3
            ],
            "label": "coins=[2], amount=3",
            "expected": -1
          },
          {
            "input": [
              [
                1
              ],
              0
            ],
            "label": "coins=[1], amount=0",
            "expected": 0
          },
          {
            "input": [
              [
                1,
                3,
                4
              ],
              6
            ],
            "label": "coins=[1,3,4], amount=6",
            "expected": 2
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                186,
                419,
                83,
                408
              ],
              6249
            ],
            "expected": 20
          },
          {
            "input": [
              [
                5
              ],
              3
            ],
            "expected": -1
          },
          {
            "input": [
              [
                1,
                2,
                5
              ],
              100
            ],
            "expected": 20
          }
        ],
        "explanation": "Bottom-up 1D DP where dp[i] is the fewest coins to make amount i, initialized to Infinity except dp[0] = 0. For each amount from 1 to target, try every coin denomination that fits and take the minimum. O(amount * coins.length) time."
      },
      {
        "id": "tm31",
        "type": "code",
        "title": "Longest Increasing Subsequence",
        "description": "Given an integer array <code>nums</code>, return the <strong>length</strong> of the longest strictly increasing subsequence.\n\nA subsequence is derived by deleting some (or no) elements without changing the order of the remaining elements.",
        "examples": [
          {
            "input": "nums = [10,9,2,5,3,7,101,18]",
            "output": "4",
            "explanation": "The subsequence [2,3,7,101] (or [2,3,7,18]) has length 4."
          },
          {
            "input": "nums = [0,1,0,3,2,3]",
            "output": "4"
          },
          {
            "input": "nums = [7,7,7,7]",
            "output": "1"
          }
        ],
        "constraints": [
          "1 ≤ nums.length ≤ 2500",
          "-10⁴ ≤ nums[i] ≤ 10⁴"
        ],
        "starter": "function lengthOfLIS(nums) {\n  \n}",
        "pythonStarter": "def length_of_lis(nums):\n    pass",
        "functionName": "lengthOfLIS",
        "pythonFunctionName": "length_of_lis",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                10,
                9,
                2,
                5,
                3,
                7,
                101,
                18
              ]
            ],
            "label": "nums=[10,9,2,5,3,7,101,18]",
            "expected": 4
          },
          {
            "input": [
              [
                0,
                1,
                0,
                3,
                2,
                3
              ]
            ],
            "label": "nums=[0,1,0,3,2,3]",
            "expected": 4
          },
          {
            "input": [
              [
                7,
                7,
                7,
                7
              ]
            ],
            "label": "nums=[7,7,7,7]",
            "expected": 1
          },
          {
            "input": [
              [
                1,
                2,
                3,
                4,
                5
              ]
            ],
            "label": "nums=[1,2,3,4,5]",
            "expected": 5
          }
        ],
        "hiddenCases": [
          {
            "input": [
              []
            ],
            "expected": 0
          },
          {
            "input": [
              [
                5
              ]
            ],
            "expected": 1
          },
          {
            "input": [
              [
                5,
                4,
                3,
                2,
                1
              ]
            ],
            "expected": 1
          }
        ],
        "explanation": "1D DP where dp[i] is the length of the longest increasing subsequence ending exactly at index i. For each i, check all previous indices j < i with nums[j] < nums[i] and take the best dp[j] + 1. O(n²) time (an O(n log n) patience-sorting approach also exists)."
      },
      {
        "id": "tm32",
        "type": "code",
        "title": "Word Break",
        "description": "Given a string <code>s</code> and a dictionary of strings <code>wordDict</code>, return <code>true</code> if <code>s</code> can be segmented into a space-separated sequence of <strong>one or more</strong> dictionary words.\n\nThe same word may be reused multiple times.",
        "examples": [
          {
            "input": "s = \"leetcode\", wordDict = [\"leet\",\"code\"]",
            "output": "true",
            "explanation": "\"leetcode\" = \"leet\" + \"code\""
          },
          {
            "input": "s = \"applepenapple\", wordDict = [\"apple\",\"pen\"]",
            "output": "true"
          },
          {
            "input": "s = \"catsandog\", wordDict = [\"cats\",\"dog\",\"sand\",\"and\",\"cat\"]",
            "output": "false"
          }
        ],
        "constraints": [
          "1 ≤ s.length ≤ 300",
          "1 ≤ wordDict.length ≤ 1000",
          "All words in wordDict are unique and non-empty"
        ],
        "starter": "function wordBreak(s, wordDict) {\n  \n}",
        "pythonStarter": "def word_break(s, word_dict):\n    pass",
        "functionName": "wordBreak",
        "pythonFunctionName": "word_break",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              "leetcode",
              [
                "leet",
                "code"
              ]
            ],
            "label": "s=\"leetcode\", wordDict=[leet,code]",
            "expected": true
          },
          {
            "input": [
              "applepenapple",
              [
                "apple",
                "pen"
              ]
            ],
            "label": "s=\"applepenapple\", wordDict=[apple,pen]",
            "expected": true
          },
          {
            "input": [
              "catsandog",
              [
                "cats",
                "dog",
                "sand",
                "and",
                "cat"
              ]
            ],
            "label": "s=\"catsandog\", wordDict=[cats,dog,sand,and,cat]",
            "expected": false
          },
          {
            "input": [
              "a",
              [
                "a"
              ]
            ],
            "label": "s=\"a\", wordDict=[a]",
            "expected": true
          }
        ],
        "hiddenCases": [
          {
            "input": [
              "",
              [
                "a"
              ]
            ],
            "expected": true
          },
          {
            "input": [
              "abcd",
              [
                "a",
                "abc",
                "b",
                "cd"
              ]
            ],
            "expected": true
          },
          {
            "input": [
              "aaaaaaa",
              [
                "aaaa",
                "aaa"
              ]
            ],
            "expected": true
          }
        ],
        "explanation": "1D DP where dp[i] means \"the prefix s[0..i) can be segmented\". dp[0] = true. For each end position i, check every start j < i: if dp[j] is true and s[j..i) is a dictionary word, set dp[i] = true. Use a Set for O(1) dictionary lookups. O(n² ) time (ignoring substring hashing cost)."
      },
      {
        "id": "tm33",
        "type": "code",
        "title": "Unique Paths in a Grid",
        "description": "A robot starts at the top-left corner of an <code>m x n</code> grid. It can only move <strong>right</strong> or <strong>down</strong> at each step, and wants to reach the bottom-right corner.\n\nReturn the <strong>number of distinct paths</strong> the robot can take.",
        "examples": [
          {
            "input": "m = 3, n = 7",
            "output": "28"
          },
          {
            "input": "m = 3, n = 2",
            "output": "3",
            "explanation": "The 3 paths are: Right->Down->Down, Down->Down->Right, Down->Right->Down."
          },
          {
            "input": "m = 1, n = 1",
            "output": "1"
          }
        ],
        "constraints": [
          "1 ≤ m, n ≤ 100",
          "The answer is guaranteed to fit in a 32-bit integer"
        ],
        "starter": "function uniquePaths(m, n) {\n  \n}",
        "pythonStarter": "def unique_paths(m, n):\n    pass",
        "functionName": "uniquePaths",
        "pythonFunctionName": "unique_paths",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              3,
              7
            ],
            "label": "m=3, n=7",
            "expected": 28
          },
          {
            "input": [
              3,
              2
            ],
            "label": "m=3, n=2",
            "expected": 3
          },
          {
            "input": [
              1,
              1
            ],
            "label": "m=1, n=1",
            "expected": 1
          },
          {
            "input": [
              7,
              3
            ],
            "label": "m=7, n=3",
            "expected": 28
          }
        ],
        "hiddenCases": [
          {
            "input": [
              1,
              10
            ],
            "expected": 1
          },
          {
            "input": [
              10,
              1
            ],
            "expected": 1
          },
          {
            "input": [
              5,
              5
            ],
            "expected": 70
          }
        ],
        "explanation": "2D DP where dp[r][c] is the number of ways to reach cell (r,c): it equals dp[r-1][c] + dp[r][c-1] (arriving from above or from the left). The first row and first column are all 1 (only one way to travel along an edge). O(m*n) time, can be optimized to O(n) space with a rolling row."
      },
      {
        "id": "tm34",
        "type": "code",
        "title": "Top K Frequent Elements",
        "description": "Given an integer array <code>nums</code> and an integer <code>k</code>, return the <code>k</code> most frequent elements.\n\nReturn the result as an array sorted in <strong>ascending order</strong> by value (there is a unique answer set for all provided test cases).",
        "examples": [
          {
            "input": "nums = [1,1,1,2,2,3], k = 2",
            "output": "[1,2]",
            "explanation": "1 appears 3 times, 2 appears 2 times — these are the two most frequent."
          },
          {
            "input": "nums = [1], k = 1",
            "output": "[1]"
          },
          {
            "input": "nums = [4,1,-1,2,-1,2,3], k = 2",
            "output": "[-1,2]"
          }
        ],
        "constraints": [
          "1 ≤ nums.length ≤ 10⁵",
          "-10⁴ ≤ nums[i] ≤ 10⁴",
          "1 ≤ k ≤ number of distinct elements in nums"
        ],
        "starter": "function topKFrequent(nums, k) {\n  \n}",
        "pythonStarter": "def top_k_frequent(nums, k):\n    pass",
        "functionName": "topKFrequent",
        "pythonFunctionName": "top_k_frequent",
        "comparator": "sorted",
        "testCases": [
          {
            "input": [
              [
                1,
                1,
                1,
                2,
                2,
                3
              ],
              2
            ],
            "label": "nums=[1,1,1,2,2,3], k=2",
            "expected": [
              1,
              2
            ]
          },
          {
            "input": [
              [
                1
              ],
              1
            ],
            "label": "nums=[1], k=1",
            "expected": [
              1
            ]
          },
          {
            "input": [
              [
                4,
                1,
                -1,
                2,
                -1,
                2,
                3
              ],
              2
            ],
            "label": "nums=[4,1,-1,2,-1,2,3], k=2",
            "expected": [
              -1,
              2
            ]
          },
          {
            "input": [
              [
                5,
                5,
                5,
                6,
                6,
                7
              ],
              1
            ],
            "label": "nums=[5,5,5,6,6,7], k=1",
            "expected": [
              5
            ]
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                1,
                2,
                3,
                4
              ],
              4
            ],
            "expected": [
              1,
              2,
              3,
              4
            ]
          },
          {
            "input": [
              [
                -1,
                -1,
                -2,
                -2,
                -2
              ],
              1
            ],
            "expected": [
              -2
            ]
          },
          {
            "input": [
              [
                3,
                0,
                1,
                0
              ],
              2
            ],
            "expected": [
              0,
              3
            ]
          }
        ],
        "explanation": "Count frequencies with a hash map, then select the k entries with the highest counts (conceptually a max-heap of size k, though sorting all entries by frequency also works for reasonable input sizes) and return their values. O(n log n) time with a sort-based approach, O(n) with bucket sort."
      },
      {
        "id": "tm35",
        "type": "code",
        "title": "Jump Game — Can You Reach the End?",
        "description": "You are given an integer array <code>nums</code>. You start at index 0, and <code>nums[i]</code> represents the <strong>maximum</strong> number of steps you may jump forward from index <code>i</code> (you may jump any amount from 0 up to that value).\n\nReturn <code>true</code> if you can reach the last index, or <code>false</code> otherwise.",
        "examples": [
          {
            "input": "nums = [2,3,1,1,4]",
            "output": "true",
            "explanation": "Jump 1 step from index 0 to 1, then 3 steps to the last index."
          },
          {
            "input": "nums = [3,2,1,0,4]",
            "output": "false",
            "explanation": "You will always arrive at index 3 with a jump length of 0, so index 4 is unreachable."
          },
          {
            "input": "nums = [0]",
            "output": "true",
            "explanation": "You start at the last index already."
          }
        ],
        "constraints": [
          "1 ≤ nums.length ≤ 10⁴",
          "0 ≤ nums[i] ≤ 10⁵"
        ],
        "starter": "function canJump(nums) {\n  \n}",
        "pythonStarter": "def can_jump(nums):\n    pass",
        "functionName": "canJump",
        "pythonFunctionName": "can_jump",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                2,
                3,
                1,
                1,
                4
              ]
            ],
            "label": "nums=[2,3,1,1,4]",
            "expected": true
          },
          {
            "input": [
              [
                3,
                2,
                1,
                0,
                4
              ]
            ],
            "label": "nums=[3,2,1,0,4]",
            "expected": false
          },
          {
            "input": [
              [
                0
              ]
            ],
            "label": "nums=[0]",
            "expected": true
          },
          {
            "input": [
              [
                2,
                0,
                0
              ]
            ],
            "label": "nums=[2,0,0]",
            "expected": true
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                1,
                0,
                1,
                0
              ]
            ],
            "expected": false
          },
          {
            "input": [
              [
                5,
                0,
                0,
                0,
                0,
                0
              ]
            ],
            "expected": true
          },
          {
            "input": [
              [
                1,
                1,
                1,
                1
              ]
            ],
            "expected": true
          }
        ],
        "explanation": "Greedy: track the farthest index reachable so far. Walk through the array; if the current index ever exceeds the farthest reachable index, it is unreachable, so return false. Otherwise update farthest = max(farthest, i + nums[i]). O(n) time, O(1) space."
      },
      {
        "id": "tm36",
        "type": "code",
        "title": "Task Scheduler",
        "description": "You are given an array <code>tasks</code> of characters representing CPU tasks and a non-negative integer <code>n</code>, the required <strong>cooldown period</strong> between two occurrences of the <strong>same</strong> task.\n\nEach unit of time the CPU can complete one task or sit idle. Return the <strong>minimum total time units</strong> needed to finish all tasks while respecting the cooldown.",
        "examples": [
          {
            "input": "tasks = [\"A\",\"A\",\"A\",\"B\",\"B\",\"B\"], n = 2",
            "output": "8",
            "explanation": "One valid order: A -> B -> idle -> A -> B -> idle -> A -> B, taking 8 units."
          },
          {
            "input": "tasks = [\"A\",\"A\",\"A\",\"B\",\"B\",\"B\"], n = 0",
            "output": "6",
            "explanation": "No cooldown needed, so just run all 6 tasks back to back."
          },
          {
            "input": "tasks = [\"A\"], n = 5",
            "output": "1"
          }
        ],
        "constraints": [
          "1 ≤ tasks.length ≤ 10⁴",
          "tasks[i] is an uppercase English letter",
          "0 ≤ n ≤ 100"
        ],
        "starter": "function leastInterval(tasks, n) {\n  \n}",
        "pythonStarter": "def least_interval(tasks, n):\n    pass",
        "functionName": "leastInterval",
        "pythonFunctionName": "least_interval",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                "A",
                "A",
                "A",
                "B",
                "B",
                "B"
              ],
              2
            ],
            "label": "tasks=[A,A,A,B,B,B], n=2",
            "expected": 8
          },
          {
            "input": [
              [
                "A",
                "A",
                "A",
                "B",
                "B",
                "B"
              ],
              0
            ],
            "label": "tasks=[A,A,A,B,B,B], n=0",
            "expected": 6
          },
          {
            "input": [
              [
                "A",
                "A",
                "A",
                "A",
                "A",
                "A",
                "B",
                "C",
                "D",
                "E",
                "F",
                "G"
              ],
              2
            ],
            "label": "tasks=[A,A,A,A,A,A,B,C,D,E,F,G], n=2",
            "expected": 16
          },
          {
            "input": [
              [
                "A"
              ],
              5
            ],
            "label": "tasks=[A], n=5",
            "expected": 1
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                "A",
                "B",
                "A",
                "B"
              ],
              1
            ],
            "expected": 4
          },
          {
            "input": [
              [
                "A",
                "A",
                "A"
              ],
              3
            ],
            "expected": 9
          },
          {
            "input": [
              [
                "A",
                "B",
                "C",
                "D"
              ],
              2
            ],
            "expected": 4
          }
        ],
        "explanation": "Greedy: count the frequency of each task type. The task with the highest frequency (maxFreq) dictates (maxFreq - 1) \"blocks\" of size (n+1), with the last block only needing to fit the remaining most-frequent tasks. Compute idle slots as (maxFreq-1)*n minus whatever other tasks can fill those slots, then answer = tasks.length + remaining idle slots (never less than tasks.length). O(n) time."
      },
      {
        "id": "tm37",
        "type": "code",
        "title": "Gas Station Circuit",
        "description": "There are <code>n</code> gas stations arranged in a circle. You start with an empty tank at some station, and <code>gas[i]</code> is the amount of fuel available at station <code>i</code>, while <code>cost[i]</code> is the fuel needed to travel from station <code>i</code> to station <code>i+1</code>.\n\nReturn the <strong>starting station index</strong> from which you can complete the full circuit exactly once in the clockwise direction without running out of fuel. If no such station exists, return <code>-1</code> (the answer is guaranteed unique when it exists).",
        "examples": [
          {
            "input": "gas = [1,2,3,4,5], cost = [3,4,5,1,2]",
            "output": "3",
            "explanation": "Starting at station 3: tank=4-1=3, then +5-2=6, then +1-3=4, then +2-4=2, then +3-5=0. You complete the circuit."
          },
          {
            "input": "gas = [2,3,4], cost = [3,4,3]",
            "output": "-1"
          },
          {
            "input": "gas = [5,1,2,3,4], cost = [4,4,1,5,1]",
            "output": "4"
          }
        ],
        "constraints": [
          "n == gas.length == cost.length",
          "1 ≤ n ≤ 10⁵",
          "0 ≤ gas[i], cost[i] ≤ 10⁴"
        ],
        "starter": "function canCompleteCircuit(gas, cost) {\n  \n}",
        "pythonStarter": "def can_complete_circuit(gas, cost):\n    pass",
        "functionName": "canCompleteCircuit",
        "pythonFunctionName": "can_complete_circuit",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                1,
                2,
                3,
                4,
                5
              ],
              [
                3,
                4,
                5,
                1,
                2
              ]
            ],
            "label": "gas=[1,2,3,4,5], cost=[3,4,5,1,2]",
            "expected": 3
          },
          {
            "input": [
              [
                2,
                3,
                4
              ],
              [
                3,
                4,
                3
              ]
            ],
            "label": "gas=[2,3,4], cost=[3,4,3]",
            "expected": -1
          },
          {
            "input": [
              [
                5,
                1,
                2,
                3,
                4
              ],
              [
                4,
                4,
                1,
                5,
                1
              ]
            ],
            "label": "gas=[5,1,2,3,4], cost=[4,4,1,5,1]",
            "expected": 4
          },
          {
            "input": [
              [
                3,
                3,
                4
              ],
              [
                3,
                4,
                4
              ]
            ],
            "label": "gas=[3,3,4], cost=[3,4,4]",
            "expected": -1
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                1
              ],
              [
                1
              ]
            ],
            "expected": 0
          },
          {
            "input": [
              [
                1
              ],
              [
                2
              ]
            ],
            "expected": -1
          },
          {
            "input": [
              [
                4,
                5,
                2,
                6,
                5,
                3
              ],
              [
                3,
                2,
                7,
                3,
                2,
                9
              ]
            ],
            "expected": -1
          }
        ],
        "explanation": "Greedy one-pass: if the total gas is less than total cost, no solution exists. Otherwise, track a running tank total starting from candidate index 0; whenever the tank goes negative, none of the stations from the current start up to here could work, so reset the candidate start to the next station and reset the tank to 0. The final candidate start is the answer. O(n) time, O(1) space."
      },
      {
        "id": "tm38",
        "type": "code",
        "title": "Minimum Interval Removals",
        "description": "Given an array of intervals <code>intervals</code> where <code>intervals[i] = [start, end]</code>, return the <strong>minimum number of intervals</strong> you must remove so that the rest of the intervals do not overlap.\n\nIntervals that only touch at an endpoint (e.g. <code>[1,2]</code> and <code>[2,3]</code>) are <strong>not</strong> considered overlapping.",
        "examples": [
          {
            "input": "intervals = [[1,2],[2,3],[3,4],[1,3]]",
            "output": "1",
            "explanation": "Remove [1,3] and the rest do not overlap."
          },
          {
            "input": "intervals = [[1,2],[1,2],[1,2]]",
            "output": "2",
            "explanation": "Remove two of the three [1,2] intervals."
          },
          {
            "input": "intervals = [[1,2],[2,3]]",
            "output": "0",
            "explanation": "They only touch at the endpoint, which is allowed."
          }
        ],
        "constraints": [
          "1 ≤ intervals.length ≤ 10⁵",
          "intervals[i].length == 2",
          "-5 × 10⁴ ≤ start < end ≤ 5 × 10⁴"
        ],
        "starter": "function eraseOverlapIntervals(intervals) {\n  \n}",
        "pythonStarter": "def erase_overlap_intervals(intervals):\n    pass",
        "functionName": "eraseOverlapIntervals",
        "pythonFunctionName": "erase_overlap_intervals",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                [
                  1,
                  2
                ],
                [
                  2,
                  3
                ],
                [
                  3,
                  4
                ],
                [
                  1,
                  3
                ]
              ]
            ],
            "label": "intervals=[[1,2],[2,3],[3,4],[1,3]]",
            "expected": 1
          },
          {
            "input": [
              [
                [
                  1,
                  2
                ],
                [
                  1,
                  2
                ],
                [
                  1,
                  2
                ]
              ]
            ],
            "label": "intervals=[[1,2],[1,2],[1,2]]",
            "expected": 2
          },
          {
            "input": [
              [
                [
                  1,
                  2
                ],
                [
                  2,
                  3
                ]
              ]
            ],
            "label": "intervals=[[1,2],[2,3]]",
            "expected": 0
          },
          {
            "input": [
              [
                [
                  1,
                  100
                ],
                [
                  11,
                  22
                ],
                [
                  1,
                  11
                ],
                [
                  2,
                  12
                ]
              ]
            ],
            "label": "intervals=[[1,100],[11,22],[1,11],[2,12]]",
            "expected": 2
          }
        ],
        "hiddenCases": [
          {
            "input": [
              []
            ],
            "expected": 0
          },
          {
            "input": [
              [
                [
                  1,
                  2
                ]
              ]
            ],
            "expected": 0
          },
          {
            "input": [
              [
                [
                  0,
                  2
                ],
                [
                  1,
                  3
                ],
                [
                  2,
                  4
                ],
                [
                  3,
                  5
                ],
                [
                  4,
                  6
                ]
              ]
            ],
            "expected": 2
          }
        ],
        "explanation": "Greedy interval scheduling: sort intervals by end time. Keep track of the end of the last kept interval; whenever the next interval starts before that end, it must be removed (increment a counter), otherwise keep it and update the tracked end. This greedy strategy maximizes the number of non-overlapping intervals kept. O(n log n) time."
      },
    ],
    hard: [
      {
        id: 'th1', type: 'code',
        title: 'Jump Game',
        description: 'You are given an integer array <code>nums</code>. You are initially positioned at the first index. Each element represents your maximum jump length at that position.\n\nReturn <code>true</code> if you can reach the last index, or <code>false</code> otherwise.',
        examples: [
          { input: 'nums = [2, 3, 1, 1, 4]', output: 'true', explanation: 'Jump 1 to index 1, then 3 steps to the last index.' },
          { input: 'nums = [3, 2, 1, 0, 4]', output: 'false', explanation: 'You will always arrive at index 3 with 0 steps remaining.' },
        ],
        constraints: ['1 ≤ nums.length ≤ 10⁴', '0 ≤ nums[i] ≤ 10⁵'],
        starter: 'function canJump(nums) {\n  \n}',
        pythonStarter: 'def can_jump(nums):\n    pass',
        functionName: 'canJump',
        pythonFunctionName: 'can_jump',
        comparator: 'exact',
        testCases: [
          { input: [[2,3,1,1,4]], expected: true, label: '[2,3,1,1,4]' },
          { input: [[3,2,1,0,4]], expected: false, label: '[3,2,1,0,4]' },
          { input: [[0]], expected: true, label: '[0] (already at end)' },
          { input: [[2,0,0]], expected: true, label: '[2,0,0]' },
        ],
        hiddenCases: [
          { input: [[1,0,0]], expected: false },
          { input: [[1,1,0,1]], expected: false },
          { input: [[3,0,0,0]], expected: true },
        ],
        explanation: 'Greedy: track the farthest index reachable so far. At each index i, if i > maxReach, you\'re stuck — return false. Otherwise update maxReach = max(maxReach, i + nums[i]). O(n) time, O(1) space.',
      },
      {
        id: 'th2', type: 'code',
        title: 'Coin Change',
        description: 'You are given an integer array <code>coins</code> representing coins of different denominations and an integer <code>amount</code>.\n\nReturn the <strong>fewest number of coins</strong> needed to make up that amount. If that amount cannot be made up, return <code>-1</code>.\n\nYou may use an unlimited number of each coin.',
        examples: [
          { input: 'coins = [1,5,10,25], amount = 36', output: '3', explanation: '25 + 10 + 1 = 36' },
          { input: 'coins = [2], amount = 3', output: '-1' },
          { input: 'coins = [1], amount = 0', output: '0' },
        ],
        constraints: ['1 ≤ coins.length ≤ 12', '1 ≤ coins[i] ≤ 2³¹ - 1', '0 ≤ amount ≤ 10⁴'],
        starter: 'function coinChange(coins, amount) {\n  \n}',
        pythonStarter: 'def coin_change(coins, amount):\n    pass',
        functionName: 'coinChange',
        pythonFunctionName: 'coin_change',
        comparator: 'exact',
        testCases: [
          { input: [[1,5,10,25], 36], expected: 3, label: 'coins=[1,5,10,25], amount=36' },
          { input: [[2], 3], expected: -1, label: 'coins=[2], amount=3' },
          { input: [[1], 0], expected: 0, label: 'amount=0' },
          { input: [[1,2,5], 11], expected: 3, label: 'coins=[1,2,5], amount=11' },
        ],
        hiddenCases: [
          { input: [[186,419,83,408], 6249], expected: 20 },
          { input: [[1], 10000], expected: 10000 },
        ],
        explanation: 'Bottom-up DP: create dp[0..amount] where dp[i] = min coins to make amount i. Initialize with Infinity, dp[0]=0. For each amount, try each coin: dp[i] = min(dp[i], dp[i-coin]+1). O(amount × coins) time.',
      },
      {
        id: 'th3', type: 'code',
        title: 'Unique Paths',
        description: 'A robot starts at the top-left corner of an <code>m × n</code> grid and tries to reach the bottom-right corner. The robot can only move <strong>right or down</strong>.\n\nReturn the number of possible unique paths.',
        examples: [
          { input: 'm = 3, n = 7', output: '28' },
          { input: 'm = 3, n = 2', output: '3', explanation: '↓↓→, ↓→↓, →↓↓' },
        ],
        constraints: ['1 ≤ m, n ≤ 100'],
        starter: 'function uniquePaths(m, n) {\n  \n}',
        pythonStarter: 'def unique_paths(m, n):\n    pass',
        functionName: 'uniquePaths',
        pythonFunctionName: 'unique_paths',
        comparator: 'exact',
        testCases: [
          { input: [3, 7], expected: 28, label: 'm=3, n=7' },
          { input: [3, 2], expected: 3, label: 'm=3, n=2' },
          { input: [1, 1], expected: 1, label: 'm=1, n=1' },
          { input: [2, 2], expected: 2, label: 'm=2, n=2' },
        ],
        hiddenCases: [
          { input: [7, 3], expected: 28 },
          { input: [100, 1], expected: 1 },
        ],
        explanation: 'DP: paths(i,j) = paths(i-1,j) + paths(i,j-1). Every cell is reachable from above or from the left. First row and column are all 1s (only one way to reach them). O(m×n) time. Can also be solved with combinatorics: C(m+n-2, m-1).',
      },
      {
        "id": "th4",
        "type": "code",
        "title": "Edit Distance",
        "description": "Given two strings <code>word1</code> and <code>word2</code>, return the minimum number of operations required to convert <code>word1</code> into <code>word2</code>.\n\nYou have three operations permitted on a word: <strong>insert</strong> a character, <strong>delete</strong> a character, or <strong>replace</strong> a character.",
        "examples": [
          {
            "input": "word1 = \"horse\", word2 = \"ros\"",
            "output": "3",
            "explanation": "horse -> rorse (replace h with r) -> rose (remove r) -> ros (remove e)"
          },
          {
            "input": "word1 = \"intention\", word2 = \"execution\"",
            "output": "5"
          }
        ],
        "constraints": [
          "0 ≤ word1.length, word2.length ≤ 500",
          "word1 and word2 consist of lowercase English letters"
        ],
        "starter": "function minEditDistance(word1, word2) {\n  \n}",
        "pythonStarter": "def min_edit_distance(word1, word2):\n    pass",
        "functionName": "minEditDistance",
        "pythonFunctionName": "min_edit_distance",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              "horse",
              "ros"
            ],
            "expected": 3,
            "label": "horse -> ros"
          },
          {
            "input": [
              "intention",
              "execution"
            ],
            "expected": 5,
            "label": "intention -> execution"
          },
          {
            "input": [
              "",
              "abc"
            ],
            "expected": 3,
            "label": "empty word1"
          },
          {
            "input": [
              "abc",
              "abc"
            ],
            "expected": 0,
            "label": "identical strings"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              "algorithm",
              "algorithm"
            ],
            "expected": 0
          },
          {
            "input": [
              "",
              ""
            ],
            "expected": 0
          },
          {
            "input": [
              "a",
              ""
            ],
            "expected": 1
          }
        ],
        "explanation": "2D DP where dp[i][j] is the edit distance between word1[0..i) and word2[0..j). If the last characters match, dp[i][j] = dp[i-1][j-1]; otherwise dp[i][j] = 1 + min(replace, delete, insert). Base cases: dp[i][0] = i, dp[0][j] = j. O(m×n) time and space."
      },
      {
        "id": "th5",
        "type": "code",
        "title": "0/1 Knapsack",
        "description": "You are given arrays <code>weights</code> and <code>values</code> of the same length representing <code>n</code> items, and an integer <code>capacity</code>.\n\nEach item may be taken <strong>at most once</strong>. Return the maximum total value achievable without the total weight exceeding <code>capacity</code>.",
        "examples": [
          {
            "input": "weights = [1,3,4,5], values = [1,4,5,7], capacity = 7",
            "output": "9",
            "explanation": "Take items with weight 3 and 4 (values 4 + 5 = 9)."
          },
          {
            "input": "weights = [1,2], values = [10,20], capacity = 0",
            "output": "0"
          }
        ],
        "constraints": [
          "1 ≤ n ≤ 200",
          "1 ≤ weights[i], values[i] ≤ 1000",
          "0 ≤ capacity ≤ 1000"
        ],
        "starter": "function knapsackMaxValue(weights, values, capacity) {\n  \n}",
        "pythonStarter": "def knapsack_max_value(weights, values, capacity):\n    pass",
        "functionName": "knapsackMaxValue",
        "pythonFunctionName": "knapsack_max_value",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                1,
                3,
                4,
                5
              ],
              [
                1,
                4,
                5,
                7
              ],
              7
            ],
            "expected": 9,
            "label": "weights=[1,3,4,5], values=[1,4,5,7], cap=7"
          },
          {
            "input": [
              [
                1,
                2
              ],
              [
                10,
                20
              ],
              0
            ],
            "expected": 0,
            "label": "capacity=0"
          },
          {
            "input": [
              [
                1,
                1,
                1
              ],
              [
                10,
                10,
                10
              ],
              3
            ],
            "expected": 30,
            "label": "all items fit"
          },
          {
            "input": [
              [
                2,
                3,
                4,
                5
              ],
              [
                3,
                4,
                5,
                6
              ],
              5
            ],
            "expected": 7,
            "label": "weights=[2,3,4,5], values=[3,4,5,6], cap=5"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [],
              [],
              10
            ],
            "expected": 0
          },
          {
            "input": [
              [
                5
              ],
              [
                100
              ],
              4
            ],
            "expected": 0
          },
          {
            "input": [
              [
                1
              ],
              [
                50
              ],
              1000
            ],
            "expected": 50
          }
        ],
        "explanation": "Bottom-up DP over capacity. dp[w] = best value using capacity w. Iterate items one at a time, and for each item iterate w from capacity down to weights[i] (descending, to avoid reusing the same item twice), updating dp[w] = max(dp[w], dp[w-weight]+value). O(n × capacity) time, O(capacity) space."
      },
      {
        "id": "th6",
        "type": "code",
        "title": "Longest Common Subsequence",
        "description": "Given two strings <code>text1</code> and <code>text2</code>, return the length of their longest common subsequence.\n\nA subsequence is formed by deleting some (or no) characters from a string without changing the order of remaining characters. A common subsequence appears as a subsequence of both strings.",
        "examples": [
          {
            "input": "text1 = \"abcde\", text2 = \"ace\"",
            "output": "3",
            "explanation": "\"ace\" is the longest common subsequence."
          },
          {
            "input": "text1 = \"abc\", text2 = \"def\"",
            "output": "0"
          }
        ],
        "constraints": [
          "1 ≤ text1.length, text2.length ≤ 1000",
          "strings consist of lowercase English letters"
        ],
        "starter": "function longestCommonSubsequence(text1, text2) {\n  \n}",
        "pythonStarter": "def longest_common_subsequence(text1, text2):\n    pass",
        "functionName": "longestCommonSubsequence",
        "pythonFunctionName": "longest_common_subsequence",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              "abcde",
              "ace"
            ],
            "expected": 3,
            "label": "abcde vs ace"
          },
          {
            "input": [
              "abc",
              "abc"
            ],
            "expected": 3,
            "label": "identical strings"
          },
          {
            "input": [
              "abc",
              "def"
            ],
            "expected": 0,
            "label": "no common characters"
          },
          {
            "input": [
              "aaaa",
              "aa"
            ],
            "expected": 2,
            "label": "repeated characters"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              "",
              "abc"
            ],
            "expected": 0
          },
          {
            "input": [
              "a",
              "a"
            ],
            "expected": 1
          },
          {
            "input": [
              "abcdefghij",
              "jihgfedcba"
            ],
            "expected": 1
          }
        ],
        "explanation": "Classic 2D DP: dp[i][j] = LCS length of text1[0..i) and text2[0..j). If characters match, dp[i][j] = dp[i-1][j-1] + 1; otherwise dp[i][j] = max(dp[i-1][j], dp[i][j-1]). O(m×n) time and space."
      },
      {
        "id": "th7",
        "type": "code",
        "title": "Network Delay Time",
        "description": "A network has <code>n</code> nodes labeled <code>1</code> to <code>n</code>. You are given a list <code>times</code> where <code>times[i] = [u, v, w]</code> means a directed edge from node <code>u</code> to node <code>v</code> with travel time <code>w</code>. A signal starts at node <code>k</code>.\n\nReturn the minimum time for the signal to reach <strong>all</strong> nodes. If it is impossible for all nodes to receive the signal, return <code>-1</code>.",
        "examples": [
          {
            "input": "times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2",
            "output": "2",
            "explanation": "Node 2 reaches 1 and 3 in 1 unit, then 4 via 3 in a total of 2 units."
          },
          {
            "input": "times = [[1,2,1]], n = 2, k = 2",
            "output": "-1",
            "explanation": "Node 2 cannot reach node 1."
          }
        ],
        "constraints": [
          "1 ≤ n ≤ 100",
          "0 ≤ times.length ≤ n × (n-1)",
          "1 ≤ w ≤ 100"
        ],
        "starter": "function networkDelayTime(times, n, k) {\n  \n}",
        "pythonStarter": "def network_delay_time(times, n, k):\n    pass",
        "functionName": "networkDelayTime",
        "pythonFunctionName": "network_delay_time",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                [
                  2,
                  1,
                  1
                ],
                [
                  2,
                  3,
                  1
                ],
                [
                  3,
                  4,
                  1
                ]
              ],
              4,
              2
            ],
            "expected": 2,
            "label": "n=4, k=2"
          },
          {
            "input": [
              [
                [
                  1,
                  2,
                  1
                ]
              ],
              2,
              2
            ],
            "expected": -1,
            "label": "unreachable node"
          },
          {
            "input": [
              [],
              1,
              1
            ],
            "expected": 0,
            "label": "single node, no edges"
          },
          {
            "input": [
              [
                [
                  1,
                  2,
                  5
                ]
              ],
              2,
              1
            ],
            "expected": 5,
            "label": "direct edge"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                [
                  1,
                  2,
                  1
                ],
                [
                  2,
                  3,
                  2
                ]
              ],
              3,
              1
            ],
            "expected": 3
          },
          {
            "input": [
              [
                [
                  1,
                  2,
                  1
                ],
                [
                  2,
                  1,
                  3
                ]
              ],
              2,
              2
            ],
            "expected": 3
          },
          {
            "input": [
              [],
              3,
              1
            ],
            "expected": -1
          }
        ],
        "explanation": "Dijkstra's algorithm from source k using an array-based distance table (no priority queue needed at this scale): repeatedly pick the unvisited node with smallest tentative distance, relax its outgoing edges, and mark it visited. The answer is the maximum finite distance across all nodes, or -1 if any node remains unreached. O(n²) time with a simple array scan."
      },
      {
        "id": "th8",
        "type": "code",
        "title": "Course Schedule Feasibility",
        "description": "There are <code>numCourses</code> courses labeled <code>0</code> to <code>numCourses - 1</code>. You are given an array <code>prerequisites</code> where <code>prerequisites[i] = [a, b]</code> means you must take course <code>b</code> before course <code>a</code>.\n\nReturn <code>true</code> if it is possible to finish all courses, or <code>false</code> if there is a cycle making it impossible.",
        "examples": [
          {
            "input": "numCourses = 2, prerequisites = [[1,0]]",
            "output": "true",
            "explanation": "Take course 0, then course 1."
          },
          {
            "input": "numCourses = 2, prerequisites = [[1,0],[0,1]]",
            "output": "false",
            "explanation": "Course 0 depends on 1 and vice versa — a cycle."
          }
        ],
        "constraints": [
          "1 ≤ numCourses ≤ 2000",
          "0 ≤ prerequisites.length ≤ 5000"
        ],
        "starter": "function canFinishCourses(numCourses, prerequisites) {\n  \n}",
        "pythonStarter": "def can_finish_courses(num_courses, prerequisites):\n    pass",
        "functionName": "canFinishCourses",
        "pythonFunctionName": "can_finish_courses",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              2,
              [
                [
                  1,
                  0
                ]
              ]
            ],
            "expected": true,
            "label": "simple chain"
          },
          {
            "input": [
              2,
              [
                [
                  1,
                  0
                ],
                [
                  0,
                  1
                ]
              ]
            ],
            "expected": false,
            "label": "two-course cycle"
          },
          {
            "input": [
              3,
              []
            ],
            "expected": true,
            "label": "no prerequisites"
          },
          {
            "input": [
              4,
              [
                [
                  1,
                  0
                ],
                [
                  2,
                  0
                ],
                [
                  3,
                  1
                ],
                [
                  3,
                  2
                ]
              ]
            ],
            "expected": true,
            "label": "diamond dependency, no cycle"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              1,
              [
                [
                  0,
                  0
                ]
              ]
            ],
            "expected": false
          },
          {
            "input": [
              5,
              [
                [
                  1,
                  0
                ],
                [
                  2,
                  1
                ],
                [
                  3,
                  2
                ],
                [
                  4,
                  3
                ]
              ]
            ],
            "expected": true
          },
          {
            "input": [
              3,
              [
                [
                  0,
                  1
                ],
                [
                  1,
                  2
                ],
                [
                  2,
                  0
                ]
              ]
            ],
            "expected": false
          }
        ],
        "explanation": "Kahn's algorithm (BFS topological sort): compute in-degree for each course, seed a queue with all zero-in-degree courses, and repeatedly remove a course, decrementing its neighbors' in-degree, adding any that reach zero. If the number of processed courses equals numCourses, no cycle exists. O(V + E) time."
      },
      {
        "id": "th9",
        "type": "code",
        "title": "Directed Cycle Detection",
        "description": "You are given an integer <code>n</code> representing the number of nodes (labeled <code>0</code> to <code>n-1</code>) and a list <code>edges</code> where <code>edges[i] = [u, v]</code> represents a directed edge from <code>u</code> to <code>v</code>.\n\nReturn <code>true</code> if the graph contains a cycle, or <code>false</code> otherwise.",
        "examples": [
          {
            "input": "n = 3, edges = [[0,1],[1,2],[2,0]]",
            "output": "true",
            "explanation": "0 -> 1 -> 2 -> 0 is a cycle."
          },
          {
            "input": "n = 3, edges = [[0,1],[1,2]]",
            "output": "false"
          }
        ],
        "constraints": [
          "1 ≤ n ≤ 1000",
          "0 ≤ edges.length ≤ 5000"
        ],
        "starter": "function hasCycleDirected(n, edges) {\n  \n}",
        "pythonStarter": "def has_cycle_directed(n, edges):\n    pass",
        "functionName": "hasCycleDirected",
        "pythonFunctionName": "has_cycle_directed",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              3,
              [
                [
                  0,
                  1
                ],
                [
                  1,
                  2
                ],
                [
                  2,
                  0
                ]
              ]
            ],
            "expected": true,
            "label": "3-node cycle"
          },
          {
            "input": [
              3,
              [
                [
                  0,
                  1
                ],
                [
                  1,
                  2
                ]
              ]
            ],
            "expected": false,
            "label": "simple chain"
          },
          {
            "input": [
              2,
              [
                [
                  0,
                  0
                ]
              ]
            ],
            "expected": true,
            "label": "self loop"
          },
          {
            "input": [
              4,
              []
            ],
            "expected": false,
            "label": "no edges"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              5,
              [
                [
                  0,
                  1
                ],
                [
                  1,
                  2
                ],
                [
                  2,
                  3
                ],
                [
                  3,
                  4
                ]
              ]
            ],
            "expected": false
          },
          {
            "input": [
              1,
              []
            ],
            "expected": false
          },
          {
            "input": [
              4,
              [
                [
                  0,
                  1
                ],
                [
                  1,
                  2
                ],
                [
                  2,
                  3
                ],
                [
                  3,
                  1
                ]
              ]
            ],
            "expected": true
          }
        ],
        "explanation": "DFS with a three-color state array: 0 = unvisited, 1 = currently on the recursion stack, 2 = fully processed. If DFS reaches a node that is already on the current stack (state 1), a back edge exists, meaning a cycle. Run DFS from every unvisited node. O(V + E) time."
      },
      {
        "id": "th10",
        "type": "code",
        "title": "Number of Connected Provinces",
        "description": "There are <code>n</code> cities. You are given an <code>n × n</code> matrix <code>isConnected</code> where <code>isConnected[i][j] = 1</code> if city <code>i</code> and city <code>j</code> are directly connected, and <code>0</code> otherwise (the matrix is symmetric with <code>1</code>s on the diagonal).\n\nA <strong>province</strong> is a group of directly or indirectly connected cities. Return the total number of provinces.",
        "examples": [
          {
            "input": "isConnected = [[1,1,0],[1,1,0],[0,0,1]]",
            "output": "2",
            "explanation": "Cities 0 and 1 form one province; city 2 forms another."
          },
          {
            "input": "isConnected = [[1,0],[0,1]]",
            "output": "2"
          }
        ],
        "constraints": [
          "1 ≤ n ≤ 200",
          "isConnected[i][i] = 1",
          "isConnected[i][j] = isConnected[j][i]"
        ],
        "starter": "function countProvinces(isConnected) {\n  \n}",
        "pythonStarter": "def count_provinces(is_connected):\n    pass",
        "functionName": "countProvinces",
        "pythonFunctionName": "count_provinces",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                [
                  1,
                  1,
                  0
                ],
                [
                  1,
                  1,
                  0
                ],
                [
                  0,
                  0,
                  1
                ]
              ]
            ],
            "expected": 2,
            "label": "two provinces"
          },
          {
            "input": [
              [
                [
                  1,
                  0
                ],
                [
                  0,
                  1
                ]
              ]
            ],
            "expected": 2,
            "label": "fully disconnected"
          },
          {
            "input": [
              [
                [
                  1,
                  1,
                  1
                ],
                [
                  1,
                  1,
                  1
                ],
                [
                  1,
                  1,
                  1
                ]
              ]
            ],
            "expected": 1,
            "label": "fully connected"
          },
          {
            "input": [
              [
                [
                  1
                ]
              ]
            ],
            "expected": 1,
            "label": "single city"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                [
                  1,
                  0,
                  0
                ],
                [
                  0,
                  1,
                  0
                ],
                [
                  0,
                  0,
                  1
                ]
              ]
            ],
            "expected": 3
          },
          {
            "input": [
              [
                [
                  1,
                  1,
                  0,
                  0
                ],
                [
                  1,
                  1,
                  0,
                  0
                ],
                [
                  0,
                  0,
                  1,
                  1
                ],
                [
                  0,
                  0,
                  1,
                  1
                ]
              ]
            ],
            "expected": 2
          },
          {
            "input": [
              [
                [
                  1,
                  1
                ],
                [
                  1,
                  1
                ]
              ]
            ],
            "expected": 1
          }
        ],
        "explanation": "Union-Find (disjoint set union) represented as a plain parent array with path compression. For every pair (i, j) with isConnected[i][j] === 1, union their roots. The final answer is the number of distinct roots. O(n² α(n)) time, effectively O(n²)."
      },
      {
        "id": "th11",
        "type": "code",
        "title": "Find the Redundant Connection",
        "description": "A tree with <code>n</code> nodes originally had exactly <code>n-1</code> edges. One extra edge was added, creating exactly one cycle. You are given <code>edges</code>, a list of <code>[u, v]</code> pairs (1-indexed nodes) in the order they were added.\n\nReturn the edge that, when removed, restores the tree. If multiple edges could be removed, return the one that appears <strong>last</strong> in the input.",
        "examples": [
          {
            "input": "edges = [[1,2],[1,3],[2,3]]",
            "output": "[2,3]",
            "explanation": "Adding [2,3] creates a cycle between 1, 2, 3."
          },
          {
            "input": "edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]",
            "output": "[1,4]"
          }
        ],
        "constraints": [
          "3 ≤ n ≤ 1000",
          "edges.length === n",
          "nodes are labeled 1 to n"
        ],
        "starter": "function findRedundantEdge(edges) {\n  \n}",
        "pythonStarter": "def find_redundant_edge(edges):\n    pass",
        "functionName": "findRedundantEdge",
        "pythonFunctionName": "find_redundant_edge",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                [
                  1,
                  2
                ],
                [
                  1,
                  3
                ],
                [
                  2,
                  3
                ]
              ]
            ],
            "expected": [
              2,
              3
            ],
            "label": "triangle"
          },
          {
            "input": [
              [
                [
                  1,
                  2
                ],
                [
                  2,
                  3
                ],
                [
                  3,
                  4
                ],
                [
                  1,
                  4
                ],
                [
                  1,
                  5
                ]
              ]
            ],
            "expected": [
              1,
              4
            ],
            "label": "square plus tail"
          },
          {
            "input": [
              [
                [
                  1,
                  2
                ],
                [
                  2,
                  3
                ],
                [
                  1,
                  3
                ]
              ]
            ],
            "expected": [
              1,
              3
            ],
            "label": "redundant edge is last"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                [
                  1,
                  2
                ],
                [
                  1,
                  3
                ],
                [
                  1,
                  4
                ],
                [
                  1,
                  5
                ],
                [
                  3,
                  4
                ]
              ]
            ],
            "expected": [
              3,
              4
            ]
          },
          {
            "input": [
              [
                [
                  1,
                  2
                ],
                [
                  2,
                  3
                ],
                [
                  3,
                  1
                ]
              ]
            ],
            "expected": [
              3,
              1
            ]
          }
        ],
        "explanation": "Union-Find over an array-based parent structure. Process edges in order; for each [u,v], if u and v already share a root, that edge is redundant (return it immediately, since we process in input order the first such edge found is also the last such edge overall in a single-cycle graph). Otherwise union them. O(n α(n)) time."
      },
      {
        "id": "th12",
        "type": "code",
        "title": "Find All Pattern Occurrences",
        "description": "Given a string <code>text</code> and a non-empty string <code>pattern</code>, return an array of all starting indices where <code>pattern</code> occurs as a substring of <code>text</code> (occurrences may overlap), in ascending order.",
        "examples": [
          {
            "input": "text = \"ababcabab\", pattern = \"ab\"",
            "output": "[0, 2, 5, 7]"
          },
          {
            "input": "text = \"aaaa\", pattern = \"aa\"",
            "output": "[0, 1, 2]",
            "explanation": "Overlapping matches all count."
          }
        ],
        "constraints": [
          "1 ≤ text.length ≤ 10⁵",
          "1 ≤ pattern.length ≤ text.length"
        ],
        "starter": "function findAllOccurrences(text, pattern) {\n  \n}",
        "pythonStarter": "def find_all_occurrences(text, pattern):\n    pass",
        "functionName": "findAllOccurrences",
        "pythonFunctionName": "find_all_occurrences",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              "ababcabab",
              "ab"
            ],
            "expected": [
              0,
              2,
              5,
              7
            ],
            "label": "multiple non-overlapping-ish matches"
          },
          {
            "input": [
              "aaaa",
              "b"
            ],
            "expected": [],
            "label": "no matches"
          },
          {
            "input": [
              "aaaa",
              "aa"
            ],
            "expected": [
              0,
              1,
              2
            ],
            "label": "overlapping matches"
          },
          {
            "input": [
              "aaa",
              "aaa"
            ],
            "expected": [
              0
            ],
            "label": "full string match"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              "ab",
              "abc"
            ],
            "expected": []
          },
          {
            "input": [
              "abcabcabc",
              "abc"
            ],
            "expected": [
              0,
              3,
              6
            ]
          },
          {
            "input": [
              "a",
              "a"
            ],
            "expected": [
              0
            ]
          }
        ],
        "explanation": "Knuth-Morris-Pratt (KMP) algorithm. Precompute the longest-prefix-suffix (LPS) array for the pattern in O(m) time, then scan the text once, using the LPS array to avoid re-examining characters on a mismatch. O(n + m) time total, versus O(n×m) for naive search."
      },
      {
        "id": "th13",
        "type": "code",
        "title": "Longest Chained Word",
        "description": "Given an array of lowercase words, find the <strong>longest word</strong> that can be built entirely by concatenating <strong>two or more</strong> other words from the same array (words may be reused as building blocks).\n\nReturn the qualifying word. If there is a tie in length, return the lexicographically smallest one. If no word qualifies, return an empty string.",
        "examples": [
          {
            "input": "words = [\"cat\",\"dog\",\"catdog\"]",
            "output": "\"catdog\"",
            "explanation": "\"catdog\" is built from \"cat\" + \"dog\"."
          },
          {
            "input": "words = [\"cat\",\"dog\"]",
            "output": "\"\"",
            "explanation": "Neither word can be built from the others."
          }
        ],
        "constraints": [
          "1 ≤ words.length ≤ 1000",
          "1 ≤ words[i].length ≤ 30",
          "words consist of lowercase letters and contain no duplicates"
        ],
        "starter": "function longestChainedWord(words) {\n  \n}",
        "pythonStarter": "def longest_chained_word(words):\n    pass",
        "functionName": "longestChainedWord",
        "pythonFunctionName": "longest_chained_word",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                "cat",
                "cats",
                "catsdogcats",
                "dog",
                "dogcatsdog",
                "hippopotamuses",
                "rat",
                "ratcatdogcat"
              ]
            ],
            "expected": "ratcatdogcat",
            "label": "multi-level chaining"
          },
          {
            "input": [
              [
                "cat",
                "dog",
                "catdog"
              ]
            ],
            "expected": "catdog",
            "label": "simple two-word chain"
          },
          {
            "input": [
              [
                "cat",
                "dog"
              ]
            ],
            "expected": "",
            "label": "no chainable word"
          },
          {
            "input": [
              [
                "cat"
              ]
            ],
            "expected": "",
            "label": "single word, cannot chain"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              []
            ],
            "expected": ""
          },
          {
            "input": [
              [
                "a",
                "b",
                "ab",
                "abab"
              ]
            ],
            "expected": "abab"
          },
          {
            "input": [
              [
                "a",
                "aa",
                "aaa"
              ]
            ],
            "expected": "aaa"
          }
        ],
        "explanation": "For each word, treat the word list as a trie simulated via a Set for O(1) membership checks, then recursively (with memoization) check whether the word can be split into a prefix (present in the set) and a suffix that is itself either a set member or recursively buildable. Track the longest (then lexicographically smallest) qualifying word. O(L²) per word in the worst case where L is word length."
      },
      {
        "id": "th14",
        "type": "code",
        "title": "Count N-Queens Solutions",
        "description": "The <strong>n-queens</strong> puzzle asks you to place <code>n</code> queens on an <code>n × n</code> chessboard such that no two queens attack each other (no shared row, column, or diagonal).\n\nGiven an integer <code>n</code>, return the <strong>number</strong> of distinct solutions.",
        "examples": [
          {
            "input": "n = 4",
            "output": "2"
          },
          {
            "input": "n = 1",
            "output": "1"
          }
        ],
        "constraints": [
          "1 ≤ n ≤ 9"
        ],
        "starter": "function countNQueensSolutions(n) {\n  \n}",
        "pythonStarter": "def count_n_queens_solutions(n):\n    pass",
        "functionName": "countNQueensSolutions",
        "pythonFunctionName": "count_n_queens_solutions",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              4
            ],
            "expected": 2,
            "label": "n=4"
          },
          {
            "input": [
              1
            ],
            "expected": 1,
            "label": "n=1"
          },
          {
            "input": [
              2
            ],
            "expected": 0,
            "label": "n=2, no solution"
          },
          {
            "input": [
              8
            ],
            "expected": 92,
            "label": "n=8, classic case"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              3
            ],
            "expected": 0
          },
          {
            "input": [
              5
            ],
            "expected": 10
          }
        ],
        "explanation": "Backtracking with pruning: place one queen per row, tracking used columns and both diagonals (row-col and row+col) in sets. If a column or diagonal is already occupied, prune that branch immediately rather than placing the queen and checking later. O(n!) worst case but pruning makes it fast for n ≤ 9."
      },
      {
        "id": "th15",
        "type": "code",
        "title": "Count Combination Sums",
        "description": "Given an array of <strong>distinct</strong> positive integers <code>candidates</code> and a target integer <code>target</code>, return the number of unique combinations where the chosen numbers sum to <code>target</code>.\n\nThe same number may be chosen from <code>candidates</code> an <strong>unlimited number of times</strong>. Two combinations are unique if the sorted multiset of chosen numbers differs.",
        "examples": [
          {
            "input": "candidates = [2,3,6,7], target = 7",
            "output": "2",
            "explanation": "[7] and [2,2,3] both sum to 7."
          },
          {
            "input": "candidates = [2,3,5], target = 8",
            "output": "3",
            "explanation": "[2,2,2,2], [2,3,3], [3,5] all sum to 8."
          }
        ],
        "constraints": [
          "1 ≤ candidates.length ≤ 30",
          "1 ≤ candidates[i] ≤ 40",
          "1 ≤ target ≤ 100"
        ],
        "starter": "function countCombinationSum(candidates, target) {\n  \n}",
        "pythonStarter": "def count_combination_sum(candidates, target):\n    pass",
        "functionName": "countCombinationSum",
        "pythonFunctionName": "count_combination_sum",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                2,
                3,
                6,
                7
              ],
              7
            ],
            "expected": 2,
            "label": "candidates=[2,3,6,7], target=7"
          },
          {
            "input": [
              [
                2,
                3,
                5
              ],
              8
            ],
            "expected": 3,
            "label": "candidates=[2,3,5], target=8"
          },
          {
            "input": [
              [
                5
              ],
              5
            ],
            "expected": 1,
            "label": "single candidate equal to target"
          },
          {
            "input": [
              [
                5
              ],
              3
            ],
            "expected": 0,
            "label": "no valid combination"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                3,
                5,
                7
              ],
              1
            ],
            "expected": 0
          },
          {
            "input": [
              [
                1
              ],
              5
            ],
            "expected": 1
          },
          {
            "input": [
              [
                2,
                4
              ],
              8
            ],
            "expected": 3
          }
        ],
        "explanation": "Backtracking with pruning: sort candidates first, then explore sums by always picking indices at or after the current one (allowing reuse) so combinations aren't double-counted in different orders. Prune as soon as the running sum plus the next candidate would exceed the target (sorted order makes this a valid early break). O(candidates^(target/min)) worst case, pruned heavily in practice."
      },
      {
        "id": "th16",
        "type": "code",
        "title": "Count Unique Permutations",
        "description": "Given an array of integers <code>nums</code> that may contain duplicates, return the number of <strong>distinct</strong> permutations of the array.",
        "examples": [
          {
            "input": "nums = [1,1,2]",
            "output": "3",
            "explanation": "The distinct permutations are [1,1,2], [1,2,1], [2,1,1]."
          },
          {
            "input": "nums = [1,2,3]",
            "output": "6"
          }
        ],
        "constraints": [
          "1 ≤ nums.length ≤ 8",
          "-10 ≤ nums[i] ≤ 10"
        ],
        "starter": "function countUniquePermutations(nums) {\n  \n}",
        "pythonStarter": "def count_unique_permutations(nums):\n    pass",
        "functionName": "countUniquePermutations",
        "pythonFunctionName": "count_unique_permutations",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                1,
                1,
                2
              ]
            ],
            "expected": 3,
            "label": "one duplicate pair"
          },
          {
            "input": [
              [
                1,
                2,
                3
              ]
            ],
            "expected": 6,
            "label": "all distinct"
          },
          {
            "input": [
              [
                2,
                2,
                2
              ]
            ],
            "expected": 1,
            "label": "all identical"
          },
          {
            "input": [
              [
                1,
                2,
                3,
                4
              ]
            ],
            "expected": 24,
            "label": "four distinct elements"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                5
              ]
            ],
            "expected": 1
          },
          {
            "input": [
              [
                1,
                1,
                1,
                2
              ]
            ],
            "expected": 4
          },
          {
            "input": [
              [
                -1,
                -1,
                2
              ]
            ],
            "expected": 3
          }
        ],
        "explanation": "Sort the array first so duplicates sit next to each other. Backtrack building permutations with a used[] boolean array, and skip choosing nums[i] if it equals nums[i-1] and nums[i-1] hasn't been used yet in the current branch — this standard trick prevents counting the same permutation twice. O(n × n!) time."
      },
      {
        "id": "th17",
        "type": "code",
        "title": "Largest Rectangle in Histogram",
        "description": "Given an array <code>heights</code> representing the heights of bars in a histogram, where each bar has width 1, return the area of the <strong>largest rectangle</strong> that can be formed within the histogram.",
        "examples": [
          {
            "input": "heights = [2,1,5,6,2,3]",
            "output": "10",
            "explanation": "The largest rectangle has height 5 and width 2 (bars at indices 2-3), or height 2 width 4... actually the max is formed by heights [5,6] area 2*5=10."
          },
          {
            "input": "heights = [1,2,3,4,5]",
            "output": "9"
          }
        ],
        "constraints": [
          "1 ≤ heights.length ≤ 10⁵",
          "0 ≤ heights[i] ≤ 10⁴"
        ],
        "starter": "function largestRectangleArea(heights) {\n  \n}",
        "pythonStarter": "def largest_rectangle_area(heights):\n    pass",
        "functionName": "largestRectangleArea",
        "pythonFunctionName": "largest_rectangle_area",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                2,
                1,
                5,
                6,
                2,
                3
              ]
            ],
            "expected": 10,
            "label": "classic mixed heights"
          },
          {
            "input": [
              [
                5
              ]
            ],
            "expected": 5,
            "label": "single bar"
          },
          {
            "input": [
              [
                1,
                2,
                3,
                4,
                5
              ]
            ],
            "expected": 9,
            "label": "strictly increasing"
          },
          {
            "input": [
              [
                4,
                4
              ]
            ],
            "expected": 8,
            "label": "two equal bars"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                0,
                0,
                0
              ]
            ],
            "expected": 0
          },
          {
            "input": [
              [
                6,
                2,
                5,
                4,
                5,
                1,
                6
              ]
            ],
            "expected": 12
          },
          {
            "input": [
              [
                1
              ]
            ],
            "expected": 1
          }
        ],
        "explanation": "Monotonic increasing stack of indices. Iterate through the bars (plus a sentinel of height 0 at the end); whenever the current bar is shorter than the bar at the top of the stack, pop and compute the rectangle area using the popped height and a width determined by the new stack top and the current index. O(n) time since each index is pushed and popped once."
      },
      {
        "id": "th18",
        "type": "code",
        "title": "Sliding Window Maximum",
        "description": "Given an array <code>nums</code> and a window size <code>k</code>, return an array containing the maximum value in each contiguous window of size <code>k</code> as it slides from the left of the array to the right.",
        "examples": [
          {
            "input": "nums = [1,3,-1,-3,5,3,6,7], k = 3",
            "output": "[3,3,5,5,6,7]"
          },
          {
            "input": "nums = [4,3,2,1], k = 1",
            "output": "[4,3,2,1]"
          }
        ],
        "constraints": [
          "1 ≤ nums.length ≤ 10⁵",
          "1 ≤ k ≤ nums.length"
        ],
        "starter": "function slidingWindowMaximum(nums, k) {\n  \n}",
        "pythonStarter": "def sliding_window_maximum(nums, k):\n    pass",
        "functionName": "slidingWindowMaximum",
        "pythonFunctionName": "sliding_window_maximum",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                1,
                3,
                -1,
                -3,
                5,
                3,
                6,
                7
              ],
              3
            ],
            "expected": [
              3,
              3,
              5,
              5,
              6,
              7
            ],
            "label": "k=3 window"
          },
          {
            "input": [
              [
                4,
                3,
                2,
                1
              ],
              1
            ],
            "expected": [
              4,
              3,
              2,
              1
            ],
            "label": "k=1, identity"
          },
          {
            "input": [
              [
                1,
                2,
                3
              ],
              3
            ],
            "expected": [
              3
            ],
            "label": "k equals array length"
          },
          {
            "input": [
              [
                9,
                11
              ],
              2
            ],
            "expected": [
              11
            ],
            "label": "two elements"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                -7,
                -8,
                7,
                5,
                7,
                1,
                6,
                0
              ],
              4
            ],
            "expected": [
              7,
              7,
              7,
              7,
              7
            ]
          },
          {
            "input": [
              [
                1
              ],
              1
            ],
            "expected": [
              1
            ]
          },
          {
            "input": [
              [
                5,
                5,
                5,
                5
              ],
              2
            ],
            "expected": [
              5,
              5,
              5
            ]
          }
        ],
        "explanation": "Monotonic decreasing deque storing indices. For each new index, pop indices from the back whose values are smaller than the current value (they can never be the max again), then push the current index. Pop from the front if it has fallen outside the window. The front of the deque is always the max of the current window. O(n) amortized time."
      },
      {
        "id": "th19",
        "type": "code",
        "title": "Trapping Rain Water",
        "description": "Given an array <code>height</code> representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
        "examples": [
          {
            "input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
            "output": "6"
          },
          {
            "input": "height = [1,1,1]",
            "output": "0",
            "explanation": "Flat terrain traps no water."
          }
        ],
        "constraints": [
          "1 ≤ height.length ≤ 2×10⁴",
          "0 ≤ height[i] ≤ 10⁵"
        ],
        "starter": "function trapRainWater(height) {\n  \n}",
        "pythonStarter": "def trap_rain_water(height):\n    pass",
        "functionName": "trapRainWater",
        "pythonFunctionName": "trap_rain_water",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                0,
                1,
                0,
                2,
                1,
                0,
                1,
                3,
                2,
                1,
                2,
                1
              ]
            ],
            "expected": 6,
            "label": "classic terrain"
          },
          {
            "input": [
              [
                1,
                1,
                1
              ]
            ],
            "expected": 0,
            "label": "flat terrain"
          },
          {
            "input": [
              []
            ],
            "expected": 0,
            "label": "empty array"
          },
          {
            "input": [
              [
                1,
                2,
                3,
                4,
                5
              ]
            ],
            "expected": 0,
            "label": "strictly increasing, no basin"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                5,
                4,
                3,
                2,
                1
              ]
            ],
            "expected": 0
          },
          {
            "input": [
              [
                4,
                2,
                0,
                3,
                2,
                5
              ]
            ],
            "expected": 9
          },
          {
            "input": [
              [
                3,
                0,
                3
              ]
            ],
            "expected": 3
          }
        ],
        "explanation": "Two-pointer technique from both ends, tracking leftMax and rightMax. At each step, move the pointer on the side with the smaller max inward — the trapped water at that position is the running max on that side minus the current height, since the smaller-max side guarantees a bound. O(n) time, O(1) space."
      },
      {
        "id": "th20",
        "type": "code",
        "title": "Minimum Meeting Rooms",
        "description": "Given an array of meeting time <code>intervals</code> where <code>intervals[i] = [start, end]</code>, return the minimum number of conference rooms required to hold all the meetings without conflicts.",
        "examples": [
          {
            "input": "intervals = [[0,30],[5,10],[15,20]]",
            "output": "2",
            "explanation": "The meeting [0,30] overlaps with both others, but [5,10] and [15,20] never overlap each other."
          },
          {
            "input": "intervals = [[7,10],[2,4]]",
            "output": "1"
          }
        ],
        "constraints": [
          "0 ≤ intervals.length ≤ 10⁴",
          "0 ≤ start < end ≤ 10⁶"
        ],
        "starter": "function minMeetingRooms(intervals) {\n  \n}",
        "pythonStarter": "def min_meeting_rooms(intervals):\n    pass",
        "functionName": "minMeetingRooms",
        "pythonFunctionName": "min_meeting_rooms",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                [
                  0,
                  30
                ],
                [
                  5,
                  10
                ],
                [
                  15,
                  20
                ]
              ]
            ],
            "expected": 2,
            "label": "one overlapping pair at a time"
          },
          {
            "input": [
              [
                [
                  7,
                  10
                ],
                [
                  2,
                  4
                ]
              ]
            ],
            "expected": 1,
            "label": "non-overlapping meetings"
          },
          {
            "input": [
              []
            ],
            "expected": 0,
            "label": "no meetings"
          },
          {
            "input": [
              [
                [
                  1,
                  5
                ],
                [
                  1,
                  5
                ],
                [
                  1,
                  5
                ]
              ]
            ],
            "expected": 3,
            "label": "three identical overlapping meetings"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                [
                  1,
                  10
                ]
              ]
            ],
            "expected": 1
          },
          {
            "input": [
              [
                [
                  1,
                  2
                ],
                [
                  2,
                  3
                ],
                [
                  3,
                  4
                ]
              ]
            ],
            "expected": 1
          },
          {
            "input": [
              [
                [
                  1,
                  4
                ],
                [
                  2,
                  5
                ],
                [
                  3,
                  6
                ]
              ]
            ],
            "expected": 3
          }
        ],
        "explanation": "Separate start times and end times into two sorted arrays. Walk through them with two pointers: whenever the next start is before the next end, a new room is needed (increment and track the max); otherwise a room frees up (decrement). The peak concurrent count is the answer. O(n log n) time for sorting."
      },
      {
        "id": "th21",
        "type": "code",
        "title": "Maximum Profit Job Scheduling",
        "description": "You are given a list of jobs where each job is <code>[start, end, profit]</code>. You can only work on one job at a time, and a job occupies the half-open interval so a job starting exactly when another ends is allowed back-to-back.\n\nReturn the maximum total profit achievable by choosing a non-overlapping subset of jobs.",
        "examples": [
          {
            "input": "jobs = [[1,2,50],[3,5,20],[6,19,100],[2,100,200]]",
            "output": "250",
            "explanation": "Take [1,2,50] then [2,100,200] for a total of 250."
          },
          {
            "input": "jobs = [[1,3,5],[3,5,6],[1,2,3]]",
            "output": "11",
            "explanation": "Take [1,3,5] then [3,5,6] back-to-back for a total profit of 11."
          }
        ],
        "constraints": [
          "1 ≤ jobs.length ≤ 5×10⁴",
          "1 ≤ start < end ≤ 10⁹",
          "1 ≤ profit ≤ 10⁴"
        ],
        "starter": "function maxWeightedJobs(jobs) {\n  \n}",
        "pythonStarter": "def max_weighted_jobs(jobs):\n    pass",
        "functionName": "maxWeightedJobs",
        "pythonFunctionName": "max_weighted_jobs",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                [
                  1,
                  2,
                  50
                ],
                [
                  3,
                  5,
                  20
                ],
                [
                  6,
                  19,
                  100
                ],
                [
                  2,
                  100,
                  200
                ]
              ]
            ],
            "expected": 250,
            "label": "four candidate jobs"
          },
          {
            "input": [
              [
                [
                  1,
                  3,
                  5
                ],
                [
                  3,
                  5,
                  6
                ],
                [
                  1,
                  2,
                  3
                ]
              ]
            ],
            "expected": 11,
            "label": "back-to-back jobs"
          },
          {
            "input": [
              [
                [
                  1,
                  5,
                  10
                ]
              ]
            ],
            "expected": 10,
            "label": "single job"
          },
          {
            "input": [
              [
                [
                  1,
                  2,
                  5
                ],
                [
                  1,
                  2,
                  5
                ]
              ]
            ],
            "expected": 5,
            "label": "duplicate identical jobs"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                [
                  1,
                  2,
                  100
                ],
                [
                  2,
                  3,
                  100
                ],
                [
                  3,
                  4,
                  100
                ]
              ]
            ],
            "expected": 300
          },
          {
            "input": [
              [
                [
                  1,
                  10,
                  5
                ],
                [
                  2,
                  3,
                  100
                ]
              ]
            ],
            "expected": 100
          },
          {
            "input": [
              [
                [
                  1,
                  100,
                  1
                ],
                [
                  1,
                  2,
                  10
                ],
                [
                  2,
                  3,
                  10
                ],
                [
                  3,
                  4,
                  10
                ],
                [
                  4,
                  5,
                  10
                ]
              ]
            ],
            "expected": 40
          }
        ],
        "explanation": "Sort jobs by end time. dp[i] = max profit using the first i jobs (in sorted order). For job i, either skip it (dp[i-1]) or take it (profit[i] plus the best dp value among jobs whose end time is at or before job i's start, found via a linear/binary search). O(n²) with linear search (or O(n log n) with binary search on a sorted end-time array)."
      },
      {
        "id": "th22",
        "type": "code",
        "title": "Single Number Among Triples",
        "description": "Given an integer array <code>nums</code> where every element appears <strong>exactly three times</strong> except for one element which appears <strong>exactly once</strong>, find and return that single element.\n\nYour solution should ideally use only constant extra space (bit manipulation).",
        "examples": [
          {
            "input": "nums = [2,2,3,2]",
            "output": "3"
          },
          {
            "input": "nums = [0,1,0,1,0,1,99]",
            "output": "99"
          }
        ],
        "constraints": [
          "1 ≤ nums.length ≤ 3×10⁴",
          "-2³¹ ≤ nums[i] ≤ 2³¹ - 1"
        ],
        "starter": "function singleNumberTriple(nums) {\n  \n}",
        "pythonStarter": "def single_number_triple(nums):\n    pass",
        "functionName": "singleNumberTriple",
        "pythonFunctionName": "single_number_triple",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                2,
                2,
                3,
                2
              ]
            ],
            "expected": 3,
            "label": "small case"
          },
          {
            "input": [
              [
                0,
                1,
                0,
                1,
                0,
                1,
                99
              ]
            ],
            "expected": 99,
            "label": "unique large value"
          },
          {
            "input": [
              [
                -2,
                -2,
                -2,
                5
              ]
            ],
            "expected": 5,
            "label": "negative numbers"
          },
          {
            "input": [
              [
                1,
                1,
                1,
                42,
                2,
                2,
                2
              ]
            ],
            "expected": 42,
            "label": "unique value sandwiched between two triples"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                1
              ]
            ],
            "expected": 1
          },
          {
            "input": [
              [
                30,
                30,
                30,
                -100
              ]
            ],
            "expected": -100
          },
          {
            "input": [
              [
                5,
                5,
                5,
                -5,
                -5,
                -5,
                42
              ]
            ],
            "expected": 42
          }
        ],
        "explanation": "Bit manipulation using two accumulators \"ones\" and \"twos\" that track bits seen exactly once and exactly twice respectively, resetting to 0 once a bit is seen a third time (using AND with the complement). After processing all numbers, \"ones\" holds the number that appears exactly once. O(n) time, O(1) space."
      },
      {
        "id": "th23",
        "type": "code",
        "title": "Counting Bits Table",
        "description": "Given a non-negative integer <code>n</code>, return an array <code>ans</code> of length <code>n + 1</code> such that <code>ans[i]</code> is the number of <code>1</code>s (set bits) in the binary representation of <code>i</code>, for every <code>i</code> from <code>0</code> to <code>n</code>.\n\nYour solution should run in O(n) time using previously computed results (not counting bits from scratch for each number).",
        "examples": [
          {
            "input": "n = 5",
            "output": "[0,1,1,2,1,2]"
          },
          {
            "input": "n = 2",
            "output": "[0,1,1]"
          }
        ],
        "constraints": [
          "0 ≤ n ≤ 10⁵"
        ],
        "starter": "function countBitsRange(n) {\n  \n}",
        "pythonStarter": "def count_bits_range(n):\n    pass",
        "functionName": "countBitsRange",
        "pythonFunctionName": "count_bits_range",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              5
            ],
            "expected": [
              0,
              1,
              1,
              2,
              1,
              2
            ],
            "label": "n=5"
          },
          {
            "input": [
              0
            ],
            "expected": [
              0
            ],
            "label": "n=0"
          },
          {
            "input": [
              2
            ],
            "expected": [
              0,
              1,
              1
            ],
            "label": "n=2"
          },
          {
            "input": [
              15
            ],
            "expected": [
              0,
              1,
              1,
              2,
              1,
              2,
              2,
              3,
              1,
              2,
              2,
              3,
              2,
              3,
              3,
              4
            ],
            "label": "n=15, power-of-two boundary"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              1
            ],
            "expected": [
              0,
              1
            ]
          },
          {
            "input": [
              8
            ],
            "expected": [
              0,
              1,
              1,
              2,
              1,
              2,
              2,
              3,
              1
            ]
          }
        ],
        "explanation": "DP using the relation popcount(i) = popcount(i >> 1) + (i & 1) — the number of set bits in i equals the set bits in i with the last bit dropped, plus whether the last bit itself is set. Build the array bottom-up from 0 to n, reusing already-computed smaller values. O(n) time."
      },
      {
        "id": "th24",
        "type": "code",
        "title": "Gas Station Circuit",
        "description": "There are <code>n</code> gas stations arranged in a circle. You have arrays <code>gas</code> and <code>cost</code> where <code>gas[i]</code> is the fuel available at station <code>i</code>, and <code>cost[i]</code> is the fuel needed to travel from station <code>i</code> to station <code>i + 1</code> (wrapping around).\n\nReturn the index of the starting gas station from which you can complete the entire circuit (in either direction of increasing index, wrapping at the end) without running out of fuel. It is guaranteed the answer is unique if it exists; return <code>-1</code> if no valid starting station exists.",
        "examples": [
          {
            "input": "gas = [1,2,3,4,5], cost = [3,4,5,1,2]",
            "output": "3",
            "explanation": "Starting at station 3, you can complete the circuit."
          },
          {
            "input": "gas = [2,3,4], cost = [3,4,3]",
            "output": "-1",
            "explanation": "Total gas is less than total cost."
          }
        ],
        "constraints": [
          "1 ≤ gas.length === cost.length ≤ 10⁵",
          "0 ≤ gas[i], cost[i] ≤ 10⁴"
        ],
        "starter": "function gasStationStart(gas, cost) {\n  \n}",
        "pythonStarter": "def gas_station_start(gas, cost):\n    pass",
        "functionName": "gasStationStart",
        "pythonFunctionName": "gas_station_start",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                1,
                2,
                3,
                4,
                5
              ],
              [
                3,
                4,
                5,
                1,
                2
              ]
            ],
            "expected": 3,
            "label": "classic case"
          },
          {
            "input": [
              [
                2,
                3,
                4
              ],
              [
                3,
                4,
                3
              ]
            ],
            "expected": -1,
            "label": "insufficient total gas"
          },
          {
            "input": [
              [
                5,
                1,
                2,
                3,
                4
              ],
              [
                4,
                4,
                1,
                5,
                1
              ]
            ],
            "expected": 4,
            "label": "different arrangement"
          },
          {
            "input": [
              [
                0,
                0,
                0
              ],
              [
                0,
                0,
                0
              ]
            ],
            "expected": 0,
            "label": "all zeros, trivially works from index 0"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                5
              ],
              [
                4
              ]
            ],
            "expected": 0
          },
          {
            "input": [
              [
                3,
                3,
                4
              ],
              [
                3,
                4,
                4
              ]
            ],
            "expected": -1
          },
          {
            "input": [
              [
                1,
                2,
                3,
                4,
                5
              ],
              [
                1,
                2,
                3,
                4,
                5
              ]
            ],
            "expected": 0
          }
        ],
        "explanation": "Greedy one-pass: if total gas < total cost, no solution exists. Otherwise, track a running tank balance while scanning left to right; whenever the tank goes negative at station i, no station from the previous start through i could have worked, so reset the candidate start to i+1 and the tank to 0. The final candidate start is guaranteed valid when a solution exists. O(n) time — proof relies on the fact that if total gas ≥ total cost, some starting point must work, and the reset logic finds it."
      },
      {
        "id": "th25",
        "type": "code",
        "title": "Maximal Square Area",
        "description": "Given an <code>m × n</code> binary matrix filled with <code>0</code>s and <code>1</code>s, find the largest square containing only <code>1</code>s, and return its <strong>area</strong>.",
        "examples": [
          {
            "input": "matrix = [[1,0,1,0,0],[1,0,1,1,1],[1,1,1,1,1],[1,0,0,1,0]]",
            "output": "4",
            "explanation": "The largest all-1s square has side length 2."
          },
          {
            "input": "matrix = [[0]]",
            "output": "0"
          }
        ],
        "constraints": [
          "1 ≤ m, n ≤ 300",
          "matrix[i][j] is 0 or 1"
        ],
        "starter": "function maximalSquareArea(matrix) {\n  \n}",
        "pythonStarter": "def maximal_square_area(matrix):\n    pass",
        "functionName": "maximalSquareArea",
        "pythonFunctionName": "maximal_square_area",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                [
                  1,
                  0,
                  1,
                  0,
                  0
                ],
                [
                  1,
                  0,
                  1,
                  1,
                  1
                ],
                [
                  1,
                  1,
                  1,
                  1,
                  1
                ],
                [
                  1,
                  0,
                  0,
                  1,
                  0
                ]
              ]
            ],
            "expected": 4,
            "label": "classic mixed grid"
          },
          {
            "input": [
              [
                [
                  0
                ]
              ]
            ],
            "expected": 0,
            "label": "single zero cell"
          },
          {
            "input": [
              [
                [
                  1,
                  1
                ],
                [
                  1,
                  1
                ]
              ]
            ],
            "expected": 4,
            "label": "fully filled 2x2"
          },
          {
            "input": [
              [
                [
                  0,
                  1
                ],
                [
                  1,
                  0
                ]
              ]
            ],
            "expected": 1,
            "label": "checkerboard, best is 1x1"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                [
                  1
                ]
              ]
            ],
            "expected": 1
          },
          {
            "input": [
              [
                [
                  1,
                  1,
                  1
                ],
                [
                  1,
                  1,
                  1
                ],
                [
                  1,
                  1,
                  1
                ]
              ]
            ],
            "expected": 9
          },
          {
            "input": [
              [
                [
                  0,
                  0,
                  0
                ],
                [
                  0,
                  0,
                  0
                ]
              ]
            ],
            "expected": 0
          }
        ],
        "explanation": "2D DP where dp[i][j] represents the side length of the largest all-1s square ending at cell (i-1, j-1) as its bottom-right corner. If matrix[i-1][j-1] is 1, dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) — bounded by the tightest of the three neighboring squares. Track the max side length seen and square it for the area. O(m×n) time and space."
      },
      {
        "id": "th26",
        "type": "code",
        "title": "Shortest Path in Binary Grid",
        "description": "Given an <code>n × n</code> binary grid, a <strong>clear path</strong> from the top-left cell to the bottom-right cell consists of cells with value <code>0</code>, where consecutive cells in the path are 8-directionally adjacent (including diagonals).\n\nReturn the length of the shortest clear path (counting the number of cells visited, including start and end). Return <code>-1</code> if no such path exists.",
        "examples": [
          {
            "input": "grid = [[0,1],[1,0]]",
            "output": "2",
            "explanation": "Path goes diagonally from (0,0) to (1,1)."
          },
          {
            "input": "grid = [[0,0,0],[1,1,0],[1,1,0]]",
            "output": "4"
          }
        ],
        "constraints": [
          "1 ≤ n ≤ 100",
          "grid[i][j] is 0 or 1"
        ],
        "starter": "function shortestPathBinaryGrid(grid) {\n  \n}",
        "pythonStarter": "def shortest_path_binary_grid(grid):\n    pass",
        "functionName": "shortestPathBinaryGrid",
        "pythonFunctionName": "shortest_path_binary_grid",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                [
                  0,
                  1
                ],
                [
                  1,
                  0
                ]
              ]
            ],
            "expected": 2,
            "label": "2x2 diagonal path"
          },
          {
            "input": [
              [
                [
                  0,
                  0,
                  0
                ],
                [
                  1,
                  1,
                  0
                ],
                [
                  1,
                  1,
                  0
                ]
              ]
            ],
            "expected": 4,
            "label": "3x3 path around obstacles"
          },
          {
            "input": [
              [
                [
                  0
                ]
              ]
            ],
            "expected": 1,
            "label": "single open cell"
          },
          {
            "input": [
              [
                [
                  1
                ]
              ]
            ],
            "expected": -1,
            "label": "start cell blocked"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                [
                  0,
                  0,
                  0
                ],
                [
                  0,
                  0,
                  0
                ],
                [
                  0,
                  0,
                  0
                ]
              ]
            ],
            "expected": 3
          },
          {
            "input": [
              [
                [
                  0,
                  1
                ],
                [
                  1,
                  1
                ]
              ]
            ],
            "expected": -1
          },
          {
            "input": [
              [
                [
                  1,
                  0,
                  0
                ],
                [
                  1,
                  1,
                  0
                ],
                [
                  1,
                  1,
                  0
                ]
              ]
            ],
            "expected": -1
          }
        ],
        "explanation": "BFS from (0,0), expanding to all 8 neighboring cells at each step, tracking visited cells to avoid revisiting. Since all edge weights are equal (1 cell = 1 step), BFS guarantees the shortest path in terms of cell count. Return -1 if the destination is never reached or if the start/end cells themselves are blocked. O(n²) time."
      },
      {
        "id": "th27",
        "type": "code",
        "title": "Minimum Word Transformations",
        "description": "Given a <code>beginWord</code>, an <code>endWord</code>, and a <code>wordList</code>, find the minimum number of single-character transformations needed to change <code>beginWord</code> into <code>endWord</code>, such that every intermediate word (including <code>endWord</code>) must exist in <code>wordList</code>, and each transformation changes exactly one letter.\n\nReturn <code>0</code> if <code>beginWord</code> already equals <code>endWord</code>. Return <code>-1</code> if no such transformation sequence exists.",
        "examples": [
          {
            "input": "beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\",\"dot\",\"dog\",\"lot\",\"log\",\"cog\"]",
            "output": "4",
            "explanation": "hit -> hot -> dot -> dog -> cog (4 transformations)."
          },
          {
            "input": "beginWord = \"hit\", endWord = \"cog\", wordList = [\"hot\",\"dot\",\"dog\",\"lot\",\"log\"]",
            "output": "-1",
            "explanation": "endWord \"cog\" is not in wordList."
          }
        ],
        "constraints": [
          "1 ≤ beginWord.length ≤ 10",
          "all words have the same length",
          "1 ≤ wordList.length ≤ 5000",
          "words consist of lowercase English letters"
        ],
        "starter": "function minWordTransformations(beginWord, endWord, wordList) {\n  \n}",
        "pythonStarter": "def min_word_transformations(begin_word, end_word, word_list):\n    pass",
        "functionName": "minWordTransformations",
        "pythonFunctionName": "min_word_transformations",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              "hit",
              "cog",
              [
                "hot",
                "dot",
                "dog",
                "lot",
                "log",
                "cog"
              ]
            ],
            "expected": 4,
            "label": "classic ladder"
          },
          {
            "input": [
              "hit",
              "cog",
              [
                "hot",
                "dot",
                "dog",
                "lot",
                "log"
              ]
            ],
            "expected": -1,
            "label": "endWord missing from list"
          },
          {
            "input": [
              "hit",
              "hit",
              [
                "hit"
              ]
            ],
            "expected": 0,
            "label": "begin equals end"
          },
          {
            "input": [
              "a",
              "c",
              [
                "a",
                "b",
                "c"
              ]
            ],
            "expected": 1,
            "label": "single-letter direct transformation"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              "abc",
              "xyz",
              [
                "abc",
                "xyz"
              ]
            ],
            "expected": -1
          },
          {
            "input": [
              "red",
              "tax",
              [
                "ted",
                "tex",
                "red",
                "tax",
                "tad",
                "den",
                "rex",
                "pee"
              ]
            ],
            "expected": 3
          },
          {
            "input": [
              "hot",
              "dog",
              [
                "hot",
                "dog"
              ]
            ],
            "expected": -1
          }
        ],
        "explanation": "BFS layer by layer treating each word as a graph node, where an edge connects two words differing by exactly one character. Starting from beginWord, generate all one-letter variations at each step and check membership in the word set; the first time endWord is reached, the current BFS depth is the answer. O(L² × 26 × W) time where L is word length and W is word count."
      },
      {
        "id": "th28",
        "type": "code",
        "title": "Generate Valid Parentheses",
        "description": "Given an integer <code>n</code>, generate all combinations of <code>n</code> pairs of well-formed (balanced) parentheses.\n\nReturn the result as an array of strings sorted in <strong>lexicographical order</strong>.",
        "examples": [
          {
            "input": "n = 3",
            "output": "[\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]"
          },
          {
            "input": "n = 1",
            "output": "[\"()\"]"
          }
        ],
        "constraints": [
          "1 ≤ n ≤ 8"
        ],
        "starter": "function generateValidParentheses(n) {\n  \n}",
        "pythonStarter": "def generate_valid_parentheses(n):\n    pass",
        "functionName": "generateValidParentheses",
        "pythonFunctionName": "generate_valid_parentheses",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              3
            ],
            "expected": [
              "((()))",
              "(()())",
              "(())()",
              "()(())",
              "()()()"
            ],
            "label": "n=3"
          },
          {
            "input": [
              1
            ],
            "expected": [
              "()"
            ],
            "label": "n=1"
          },
          {
            "input": [
              2
            ],
            "expected": [
              "(())",
              "()()"
            ],
            "label": "n=2"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              0
            ],
            "expected": [
              ""
            ]
          },
          {
            "input": [
              4
            ],
            "expected": [
              "(((())))",
              "((()()))",
              "((())())",
              "((()))()",
              "(()(()))",
              "(()()())",
              "(()())()",
              "(())(())",
              "(())()()",
              "()((()))",
              "()(()())",
              "()(())()",
              "()()(())",
              "()()()()"
            ]
          }
        ],
        "explanation": "Backtracking, tracking counts of open and close parens used so far. Add \"(\" whenever open < n; add \")\" whenever close < open (guaranteeing well-formedness at every step, so no post-hoc validation is needed). Sorting the alphabet \"(\" before \")\" naturally produces lexicographic order when we always try \"(\" before \")\". O(4ⁿ / √n) Catalan-number growth."
      },
      {
        "id": "th29",
        "type": "code",
        "title": "Partition Into K Equal Subsets",
        "description": "Given an integer array <code>nums</code> and an integer <code>k</code>, return <code>true</code> if it is possible to divide this array into <code>k</code> non-empty subsets whose sums are all equal, or <code>false</code> otherwise. Every element must be used in exactly one subset.",
        "examples": [
          {
            "input": "nums = [4,3,2,3,5,2,1], k = 4",
            "output": "true",
            "explanation": "It can be divided into (5), (1,4), (2,3), (2,3), each summing to 5."
          },
          {
            "input": "nums = [1,2,3,4], k = 3",
            "output": "false"
          }
        ],
        "constraints": [
          "1 ≤ k ≤ nums.length ≤ 16",
          "1 ≤ nums[i] ≤ 10⁴"
        ],
        "starter": "function canPartitionKSubsets(nums, k) {\n  \n}",
        "pythonStarter": "def can_partition_k_subsets(nums, k):\n    pass",
        "functionName": "canPartitionKSubsets",
        "pythonFunctionName": "can_partition_k_subsets",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                4,
                3,
                2,
                3,
                5,
                2,
                1
              ],
              4
            ],
            "expected": true,
            "label": "classic k=4 case"
          },
          {
            "input": [
              [
                1,
                2,
                3,
                4
              ],
              3
            ],
            "expected": false,
            "label": "sum not divisible into equal subsets"
          },
          {
            "input": [
              [
                5,
                5,
                5
              ],
              1
            ],
            "expected": true,
            "label": "k=1, trivially the whole array"
          },
          {
            "input": [
              [
                2,
                2,
                2,
                2,
                3,
                4,
                5
              ],
              4
            ],
            "expected": false,
            "label": "sum divisible but arrangement impossible"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                1,
                1,
                1,
                1
              ],
              2
            ],
            "expected": true
          },
          {
            "input": [
              [
                10
              ],
              1
            ],
            "expected": true
          },
          {
            "input": [
              [
                1,
                1,
                1,
                1,
                2,
                2,
                2,
                2
              ],
              4
            ],
            "expected": true
          }
        ],
        "explanation": "Compute total sum; if not divisible by k, return false immediately. Otherwise target = total/k, and any element larger than target makes it impossible. Backtrack: try to fill one subset at a time up to the target, marking elements used, recursing to fill the next subset once one completes. Sorting descending first helps pruning by placing large elements early. Exponential worst case but pruning makes n ≤ 16 tractable."
      },
      {
        "id": "th30",
        "type": "code",
        "title": "Count Merged Accounts",
        "description": "You are given a list <code>accounts</code> where each element is an array of email addresses belonging to one account entry. Two account entries actually belong to the <strong>same person</strong> if they share at least one email address (transitively — if A shares an email with B, and B shares an email with C, then A, B, and C are all the same person).\n\nReturn the number of <strong>distinct people</strong> after merging all account entries that share emails.",
        "examples": [
          {
            "input": "accounts = [[\"a@x.com\",\"b@x.com\"],[\"b@x.com\",\"c@x.com\"],[\"d@x.com\"]]",
            "output": "2",
            "explanation": "The first two entries share \"b@x.com\" so they merge into one person; the third entry is a separate person."
          },
          {
            "input": "accounts = [[\"a@x.com\"],[\"b@x.com\"]]",
            "output": "2"
          }
        ],
        "constraints": [
          "1 ≤ accounts.length ≤ 1000",
          "1 ≤ accounts[i].length ≤ 10"
        ],
        "starter": "function countMergedAccounts(accounts) {\n  \n}",
        "pythonStarter": "def count_merged_accounts(accounts):\n    pass",
        "functionName": "countMergedAccounts",
        "pythonFunctionName": "count_merged_accounts",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                [
                  "a@x.com",
                  "b@x.com"
                ],
                [
                  "b@x.com",
                  "c@x.com"
                ],
                [
                  "d@x.com"
                ]
              ]
            ],
            "expected": 2,
            "label": "transitive merge plus one separate"
          },
          {
            "input": [
              [
                [
                  "a@x.com"
                ],
                [
                  "b@x.com"
                ]
              ]
            ],
            "expected": 2,
            "label": "no shared emails"
          },
          {
            "input": [
              [
                [
                  "a@x.com"
                ],
                [
                  "b@x.com"
                ],
                [
                  "c@x.com"
                ]
              ]
            ],
            "expected": 3,
            "label": "three fully separate entries"
          },
          {
            "input": [
              [
                [
                  "a@x.com",
                  "b@x.com"
                ],
                [
                  "c@x.com",
                  "b@x.com"
                ],
                [
                  "c@x.com",
                  "d@x.com"
                ]
              ]
            ],
            "expected": 1,
            "label": "chain merge of three entries"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                [
                  "a@x.com"
                ]
              ]
            ],
            "expected": 1
          },
          {
            "input": [
              [
                [
                  "a@x.com",
                  "b@x.com",
                  "c@x.com"
                ],
                [
                  "d@x.com",
                  "e@x.com",
                  "f@x.com"
                ]
              ]
            ],
            "expected": 2
          },
          {
            "input": [
              [
                [
                  "a@x.com",
                  "b@x.com"
                ],
                [
                  "b@x.com",
                  "a@x.com"
                ]
              ]
            ],
            "expected": 1
          }
        ],
        "explanation": "Union-Find over account indices (array-based parent structure). Maintain a map from each email to the first account index that owns it; when a later account shares that email, union the two account indices. After processing all accounts, count the number of distinct roots. O(n × k α(n)) time where k is average emails per account."
      },
      {
        "id": "th31",
        "type": "code",
        "title": "Minimum Window Substring",
        "description": "Given two strings <code>s</code> and <code>t</code>, return the <strong>smallest substring</strong> of <code>s</code> that contains every character of <code>t</code> (including duplicates — if <code>t</code> has two \"a\"s, the window must contain at least two \"a\"s).\n\nIf no such substring exists, return an empty string. If multiple windows have the same minimum length, return the one that starts first.",
        "examples": [
          {
            "input": "s = \"ADOBECODEBANC\", t = \"ABC\"",
            "output": "\"BANC\""
          },
          {
            "input": "s = \"a\", t = \"b\"",
            "output": "\"\""
          }
        ],
        "constraints": [
          "1 ≤ s.length, t.length ≤ 10⁵",
          "strings consist of uppercase and lowercase English letters"
        ],
        "starter": "function minWindowSubstring(s, t) {\n  \n}",
        "pythonStarter": "def min_window_substring(s, t):\n    pass",
        "functionName": "minWindowSubstring",
        "pythonFunctionName": "min_window_substring",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              "ADOBECODEBANC",
              "ABC"
            ],
            "expected": "BANC",
            "label": "classic case"
          },
          {
            "input": [
              "a",
              "b"
            ],
            "expected": "",
            "label": "no valid window"
          },
          {
            "input": [
              "a",
              "a"
            ],
            "expected": "a",
            "label": "exact single-char match"
          },
          {
            "input": [
              "a",
              "aa"
            ],
            "expected": "",
            "label": "t requires more of a char than s has"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              "aa",
              "aa"
            ],
            "expected": "aa"
          },
          {
            "input": [
              "bba",
              "ab"
            ],
            "expected": "ba"
          },
          {
            "input": [
              "abcabdebac",
              "cda"
            ],
            "expected": "cabd"
          }
        ],
        "explanation": "Sliding window with two pointers. Track character-frequency needs for t in a map, and expand the right pointer until the window satisfies all requirements (\"formed\" counter equals the number of distinct required characters). Then contract from the left as far as possible while still valid, recording the smallest valid window seen. O(|s| + |t|) time."
      },
      {
        "id": "th32",
        "type": "code",
        "title": "Bipartite Graph Check",
        "description": "You are given an integer <code>n</code> (number of nodes labeled <code>0</code> to <code>n-1</code>) and a list <code>edges</code> of undirected edges <code>[u, v]</code>. A graph is <strong>bipartite</strong> if its nodes can be split into two disjoint groups such that every edge connects a node in one group to a node in the other (no edge connects two nodes in the same group).\n\nReturn <code>true</code> if the graph is bipartite, or <code>false</code> otherwise. The graph may be disconnected.",
        "examples": [
          {
            "input": "n = 4, edges = [[0,1],[1,2],[2,3],[3,0]]",
            "output": "true",
            "explanation": "A 4-cycle is bipartite (even length)."
          },
          {
            "input": "n = 3, edges = [[0,1],[1,2],[2,0]]",
            "output": "false",
            "explanation": "A 3-cycle (odd length) cannot be 2-colored."
          }
        ],
        "constraints": [
          "1 ≤ n ≤ 1000",
          "0 ≤ edges.length ≤ 5000"
        ],
        "starter": "function isBipartiteGraph(n, edges) {\n  \n}",
        "pythonStarter": "def is_bipartite_graph(n, edges):\n    pass",
        "functionName": "isBipartiteGraph",
        "pythonFunctionName": "is_bipartite_graph",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              4,
              [
                [
                  0,
                  1
                ],
                [
                  1,
                  2
                ],
                [
                  2,
                  3
                ],
                [
                  3,
                  0
                ]
              ]
            ],
            "expected": true,
            "label": "4-cycle"
          },
          {
            "input": [
              3,
              [
                [
                  0,
                  1
                ],
                [
                  1,
                  2
                ],
                [
                  2,
                  0
                ]
              ]
            ],
            "expected": false,
            "label": "3-cycle (odd)"
          },
          {
            "input": [
              4,
              [
                [
                  0,
                  1
                ]
              ]
            ],
            "expected": true,
            "label": "disconnected graph, one edge"
          },
          {
            "input": [
              1,
              []
            ],
            "expected": true,
            "label": "single isolated node"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              5,
              []
            ],
            "expected": true
          },
          {
            "input": [
              6,
              [
                [
                  0,
                  1
                ],
                [
                  1,
                  2
                ],
                [
                  2,
                  3
                ],
                [
                  3,
                  4
                ],
                [
                  4,
                  5
                ],
                [
                  5,
                  0
                ]
              ]
            ],
            "expected": true
          },
          {
            "input": [
              5,
              [
                [
                  0,
                  1
                ],
                [
                  1,
                  2
                ],
                [
                  2,
                  3
                ],
                [
                  3,
                  4
                ],
                [
                  4,
                  0
                ]
              ]
            ],
            "expected": false
          }
        ],
        "explanation": "BFS 2-coloring: for every unvisited node, assign it color 0 and BFS outward, coloring each neighbor the opposite color. If a neighbor is already colored the same as the current node, the graph is not bipartite. Must restart BFS for every connected component since the graph may be disconnected. O(V + E) time."
      },
      {
        "id": "th33",
        "type": "code",
        "title": "Longest Arithmetic Subsequence",
        "description": "Given an array of integers <code>nums</code>, return the length of the longest subsequence such that the difference between consecutive elements is the same throughout (i.e. it forms an arithmetic progression).\n\nA subsequence need not be contiguous but must preserve relative order.",
        "examples": [
          {
            "input": "nums = [3,6,9,12]",
            "output": "4",
            "explanation": "The whole array is arithmetic with common difference 3."
          },
          {
            "input": "nums = [9,4,7,2,10]",
            "output": "3",
            "explanation": "[4,7,10] is arithmetic with common difference 3."
          }
        ],
        "constraints": [
          "2 ≤ nums.length ≤ 1000",
          "0 ≤ nums[i] ≤ 500"
        ],
        "starter": "function longestArithmeticSubsequence(nums) {\n  \n}",
        "pythonStarter": "def longest_arithmetic_subsequence(nums):\n    pass",
        "functionName": "longestArithmeticSubsequence",
        "pythonFunctionName": "longest_arithmetic_subsequence",
        "comparator": "exact",
        "testCases": [
          {
            "input": [
              [
                3,
                6,
                9,
                12
              ]
            ],
            "expected": 4,
            "label": "whole array arithmetic"
          },
          {
            "input": [
              [
                9,
                4,
                7,
                2,
                10
              ]
            ],
            "expected": 3,
            "label": "subsequence [4,7,10]"
          },
          {
            "input": [
              [
                20,
                1,
                15,
                3,
                10,
                5,
                8
              ]
            ],
            "expected": 4,
            "label": "harder mixed case"
          },
          {
            "input": [
              [
                5,
                10
              ]
            ],
            "expected": 2,
            "label": "two elements, trivially arithmetic"
          }
        ],
        "hiddenCases": [
          {
            "input": [
              [
                7,
                7,
                7,
                7
              ]
            ],
            "expected": 4
          },
          {
            "input": [
              [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9,
                10
              ]
            ],
            "expected": 10
          },
          {
            "input": [
              [
                0,
                500
              ]
            ],
            "expected": 2
          }
        ],
        "explanation": "DP where dp[i] is a map from \"common difference\" to the length of the longest arithmetic subsequence ending at index i with that difference. For each pair (j, i) with j < i, the difference d = nums[i]-nums[j] extends whatever sequence ended at j with difference d (defaulting to a length-1 sequence, i.e. just nums[j], if none existed). O(n²) time and space."
      },
    ],
  },

  quant: {
    easy: [
      {
        id: 'qe4', type: 'numeric',
        title: 'At Least One Head',
        description: 'You flip a fair coin <strong>twice</strong>.\n\nWhat is the probability of getting <strong>at least one head</strong>?\n\nEnter as a decimal rounded to 2 decimal places (e.g. <code>0.75</code>).',
        unit: '',
        answer: 0.75,
        tolerance: 0.005,
        steps: [
          { label: 'P(no heads at all)', value: 'P(TT) = (1/2)² = 0.25' },
          { label: 'Complement rule', value: 'P(at least one head) = 1 − P(no heads)' },
          { label: 'Result', value: '1 − 0.25 = 0.75' },
        ],
        explanation: 'Use the complement: P(≥1 head) = 1 − P(TT) = 1 − (1/2)² = 1 − 0.25 = 0.75. The complement approach avoids summing cases (HT, TH, HH).',
      },
      {
        id: 'qe5', type: 'numeric',
        title: 'Matching Dice',
        description: 'You roll two fair 6-sided dice simultaneously.\n\nWhat is the probability that <strong>both dice show the same number</strong>?\n\nEnter as a decimal rounded to 4 places (e.g. <code>0.1667</code>).',
        unit: '',
        answer: 0.1667,
        tolerance: 0.0005,
        steps: [
          { label: 'Condition on the first die', value: 'It shows any value — that\'s fine' },
          { label: 'Second die must match', value: 'P(match) = 1/6 ≈ 0.1667' },
        ],
        explanation: 'Regardless of what the first die shows, the second must match it: P = 1/6 ≈ 0.1667. Equivalently: 6 matching pairs out of 36 total outcomes.',
      },
      {
        id: 'qe6', type: 'numeric',
        title: 'Simple Return',
        description: 'A stock price rises from <strong>$80</strong> to <strong>$100</strong> over one year.\n\nWhat is the <strong>simple return</strong>?\n\nEnter as a percentage (e.g. <code>25.00</code> for 25%).',
        unit: '%',
        answer: 25,
        tolerance: 0.05,
        steps: [
          { label: 'Price gain', value: '$100 − $80 = $20' },
          { label: 'Return = gain / initial price', value: '$20 ÷ $80 × 100% = 25%' },
        ],
        explanation: 'Simple return = (P_T − P_0) / P_0 = (100 − 80) / 80 = 0.25 = 25%.',
      },
      {
        id: 'qe1', type: 'numeric',
        title: 'Expected Value of a Dice Game',
        description: 'You roll a single fair 6-sided die. You win <strong>$4</strong> if you roll a 6, and you lose <strong>$1</strong> for any other result.\n\nWhat is the <strong>expected value</strong> of this game in dollars?\n\nEnter your answer rounded to 2 decimal places (e.g. <code>-0.50</code>).',
        unit: '$',
        answer: -0.17,
        tolerance: 0.015,
        steps: [
          { label: 'P(rolling 6)', value: '1/6 ≈ 0.1667' },
          { label: 'P(not rolling 6)', value: '5/6 ≈ 0.8333' },
          { label: 'EV', value: '(1/6)×$4 + (5/6)×(−$1) = $0.667 − $0.833 = −$0.167 ≈ −$0.17' },
        ],
        explanation: 'EV = Σ P(outcome) × value = (1/6)(4) + (5/6)(−1) = 4/6 − 5/6 = −1/6 ≈ −$0.17. The house has an edge — you lose on average.',
      },
      {
        id: 'qe2', type: 'numeric',
        title: 'Probability: Red Face Card',
        description: 'You draw one card at random from a standard 52-card deck.\n\nWhat is the probability of drawing a <strong>red face card</strong> (Jack, Queen, or King of Hearts or Diamonds)?\n\nEnter your answer as a decimal rounded to 4 places (e.g. <code>0.1154</code>).',
        unit: '',
        answer: 0.1154,
        tolerance: 0.0005,
        steps: [
          { label: 'Red face cards', value: 'J♥, Q♥, K♥, J♦, Q♦, K♦ = 6 cards' },
          { label: 'Total cards', value: '52' },
          { label: 'Probability', value: '6/52 = 3/26 ≈ 0.1154' },
        ],
        explanation: 'P = favorable outcomes / total outcomes = 6/52 = 3/26 ≈ 0.1154.',
      },
      {
        id: 'qe3', type: 'numeric',
        title: 'Portfolio Expected Return',
        description: 'A portfolio is <strong>70% stocks</strong> (expected return <strong>9%</strong>) and <strong>30% bonds</strong> (expected return <strong>3%</strong>).\n\nWhat is the portfolio\'s expected annual return?\n\nEnter your answer as a percentage (e.g. <code>6.50</code> for 6.50%).',
        unit: '%',
        answer: 7.2,
        tolerance: 0.05,
        steps: [
          { label: 'Stock contribution', value: '0.70 × 9% = 6.3%' },
          { label: 'Bond contribution', value: '0.30 × 3% = 0.9%' },
          { label: 'Total', value: '6.3% + 0.9% = 7.2%' },
        ],
        explanation: 'E[R] = w₁×r₁ + w₂×r₂ = 0.70×9% + 0.30×3% = 6.3% + 0.9% = 7.2%.',
      },
      {
        id: 'qe31', type: 'numeric',
        title: 'P(Sum = 7 on Two Dice)',
        description: 'Roll two fair 6-sided dice. What is the probability the sum equals <strong>7</strong>?\n\nEnter as a decimal rounded to 4 places.',
        unit: '',
        answer: 0.1667,
        tolerance: 0.0005,
        steps: [
          { label: 'Ways to make 7', value: '(1,6),(2,5),(3,4),(4,3),(5,2),(6,1) → 6 ways' },
          { label: 'Total outcomes', value: '6 × 6 = 36' },
          { label: 'P(sum=7)', value: '6/36 = 1/6 ≈ 0.1667' },
        ],
        explanation: 'Seven is the most common sum on two dice — 6 out of 36 combinations make 7. Every number from 1 to 6 pairs with exactly one other number to sum to 7.',
      },
      {
        id: 'qe32', type: 'numeric',
        title: 'Expected Value of a Die Roll',
        description: 'Roll one fair <strong>6-sided</strong> die. What is the expected value of the outcome?',
        unit: '',
        answer: 3.5,
        tolerance: 0,
        steps: [
          { label: 'Sum of outcomes', value: '1 + 2 + 3 + 4 + 5 + 6 = 21' },
          { label: 'Number of outcomes', value: '6' },
          { label: 'E[X] = 21/6', value: '= 3.5' },
        ],
        explanation: 'E[X] = (1+2+3+4+5+6)/6 = 21/6 = 3.5. By symmetry, the expected value equals the midpoint (1+6)/2 = 3.5.',
      },
      {
        id: 'qe33', type: 'numeric',
        title: 'P(At Least One Head in 3 Flips)',
        description: 'Flip a fair coin <strong>3 times</strong>. What is the probability of getting at least one head?\n\nEnter as a decimal rounded to 4 places.',
        unit: '',
        answer: 0.875,
        tolerance: 0.0005,
        steps: [
          { label: 'P(no heads) = P(all tails)', value: '(1/2)³ = 1/8 = 0.125' },
          { label: 'Complement rule', value: 'P(at least one head) = 1 − 0.125' },
          { label: 'P(at least one head)', value: '7/8 = 0.875' },
        ],
        explanation: 'Use the complement: P(at least one head) = 1 − P(all tails) = 1 − (1/2)³ = 7/8 = 0.875.',
      },
      {
        id: 'qe34', type: 'numeric',
        title: 'Compound Interest (3 Years)',
        description: 'You invest <strong>$1,000</strong> at an annual interest rate of <strong>5%</strong>, compounded annually for <strong>3 years</strong>. What is the value at the end?',
        unit: '$',
        answer: 1157.63,
        tolerance: 0.01,
        steps: [
          { label: 'Compound interest formula', value: 'FV = PV × (1 + r)^n = 1000 × (1.05)³' },
          { label: 'Compute (1.05)³', value: '1.1025 × 1.05 = 1.157625' },
          { label: 'FV', value: '1000 × 1.157625 = $1,157.63' },
        ],
        explanation: 'Compound interest applies to both principal and accumulated interest. After 3 years at 5%, $1,000 grows to $1,157.63 (vs. $1,150 with simple interest).',
      },
      {
        id: 'qe35', type: 'numeric',
        title: 'Combinations: Choose 3 from 8',
        description: 'How many ways can you choose <strong>3 items</strong> from a group of <strong>8</strong> when order does not matter?',
        unit: '',
        answer: 56,
        tolerance: 0,
        steps: [
          { label: 'Combination formula', value: 'C(8,3) = 8! / (3! × 5!)' },
          { label: 'Simplify numerator', value: '8 × 7 × 6 = 336' },
          { label: 'C(8,3)', value: '336 / (3×2×1) = 336/6 = 56' },
        ],
        explanation: 'C(n,k) = n!/(k!(n−k)!) counts unordered selections. C(8,3) = (8×7×6)/(3×2×1) = 336/6 = 56.',
      },
      {
        id: 'qe36', type: 'numeric',
        title: 'P(Drawing an Ace)',
        description: 'Draw one card from a standard <strong>52-card deck</strong>. What is the probability of drawing an ace?\n\nEnter as a decimal rounded to 4 places.',
        unit: '',
        answer: 0.0769,
        tolerance: 0.0005,
        steps: [
          { label: 'Number of aces', value: '4 (one per suit)' },
          { label: 'Total cards', value: '52' },
          { label: 'P(ace)', value: '4/52 = 1/13 ≈ 0.0769' },
        ],
        explanation: 'P(ace) = 4/52 = 1/13 ≈ 7.69%. There are 4 aces in a 52-card deck, one of each suit.',
      },
      {
        id: 'qe37', type: 'numeric',
        title: 'Mean of a Dataset',
        description: 'Find the mean of: <strong>4, 7, 13, 2, 9</strong>.',
        unit: '',
        answer: 7,
        tolerance: 0,
        steps: [
          { label: 'Sum', value: '4 + 7 + 13 + 2 + 9 = 35' },
          { label: 'Count', value: '5 values' },
          { label: 'Mean', value: '35 / 5 = 7' },
        ],
        explanation: 'The arithmetic mean is the sum divided by the count: 35/5 = 7.',
      },
      {
        id: 'qe38', type: 'numeric',
        title: 'Population Variance',
        description: 'Compute the <strong>population variance</strong> of: <strong>2, 4, 4, 4, 5, 5, 7, 9</strong>.',
        unit: '',
        answer: 4,
        tolerance: 0,
        steps: [
          { label: 'Mean', value: '(2+4+4+4+5+5+7+9)/8 = 40/8 = 5' },
          { label: 'Sum of squared deviations', value: '9+1+1+1+0+0+4+16 = 32' },
          { label: 'Variance', value: '32/8 = 4' },
        ],
        explanation: 'Population variance = Σ(xᵢ−μ)²/n. With mean 5, the squared deviations sum to 32, giving variance 4 (std dev = 2).',
      },
      {
        id: 'qe39', type: 'numeric',
        title: 'Simple Stock Return',
        description: 'A stock bought at <strong>$80</strong> is sold at <strong>$92</strong> after one year with no dividends. What is the simple annual return?',
        unit: '%',
        answer: 15,
        tolerance: 0.01,
        steps: [
          { label: 'Price gain', value: '$92 − $80 = $12' },
          { label: 'Return', value: '12/80 = 0.15 = 15%' },
        ],
        explanation: 'Simple return = (P₁ − P₀)/P₀ = 12/80 = 15%.',
      },
      {
        id: 'qe40', type: 'numeric',
        title: 'Normal Distribution: 68% Rule',
        description: 'Stock annual returns: mean <strong>10%</strong>, std dev <strong>20%</strong>. Using the empirical rule, what is the <strong>upper bound</strong> of the range that contains ~68% of outcomes?',
        unit: '%',
        answer: 30,
        tolerance: 0.01,
        steps: [
          { label: '68% rule: μ ± 1σ', value: 'Contains ~68% of data' },
          { label: 'Upper bound', value: 'μ + σ = 10% + 20% = 30%' },
        ],
        explanation: 'By the 68-95-99.7 rule, about 68% of outcomes fall in [μ−σ, μ+σ] = [−10%, 30%]. The upper bound is 30%.',
      },
      {
        id: 'qe41', type: 'numeric',
        title: 'P(Both Cards Are Red)',
        description: 'Draw two cards without replacement from a standard <strong>52-card deck</strong>. What is the probability both are red?\n\nEnter as a decimal rounded to 4 places.',
        unit: '',
        answer: 0.2451,
        tolerance: 0.0005,
        steps: [
          { label: 'P(1st red)', value: '26/52 = 1/2' },
          { label: 'P(2nd red | 1st red)', value: '25/51' },
          { label: 'P(both red)', value: '(26/52) × (25/51) = 650/2652 ≈ 0.2451' },
        ],
        explanation: 'P = (26×25)/(52×51) = 650/2652 ≈ 24.51%. After drawing one red, 25 of the remaining 51 cards are red.',
      },
      {
        id: 'qe42', type: 'numeric',
        title: 'Expected Profit: Lottery Ticket',
        description: 'A lottery ticket costs <strong>$2</strong>. You win <strong>$10</strong> with probability <strong>0.05</strong>, else nothing. What is the expected profit per ticket?',
        unit: '$',
        answer: -1.5,
        tolerance: 0.01,
        steps: [
          { label: 'Expected winnings', value: '0.05 × $10 = $0.50' },
          { label: 'Cost', value: '$2.00' },
          { label: 'Expected profit', value: '$0.50 − $2.00 = −$1.50' },
        ],
        explanation: 'Expected profit = gross payout − cost = $0.50 − $2.00 = −$1.50. Lotteries are negative EV — the house always profits in expectation.',
      },
      {
        id: 'qe43', type: 'numeric',
        title: 'Permutations: 4 Books',
        description: 'In how many ways can you arrange <strong>4 distinct books</strong> on a shelf?',
        unit: '',
        answer: 24,
        tolerance: 0,
        steps: [
          { label: 'Number of permutations', value: '4! = 4 × 3 × 2 × 1' },
          { label: '4!', value: '= 24' },
        ],
        explanation: 'Arrangements of n distinct objects = n! = 4! = 24. Four choices for position 1, three for position 2, etc.',
      },
      {
        id: 'qe44', type: 'numeric',
        title: 'Zero-Coupon Bond Price',
        description: 'A zero-coupon bond pays <strong>$1,000</strong> at maturity in <strong>2 years</strong>. Annual discount rate = <strong>6%</strong>. What is the price today?',
        unit: '$',
        answer: 889.00,
        tolerance: 0.5,
        steps: [
          { label: 'PV formula', value: 'PV = FV / (1+r)^n = 1000 / (1.06)²' },
          { label: '(1.06)² = 1.1236', value: '' },
          { label: 'Price', value: '1000 / 1.1236 ≈ $889.00' },
        ],
        explanation: 'Zero-coupon bond price = FV/(1+r)ⁿ = 1000/1.1236 ≈ $889.00. The discount reflects time value of money.',
      },
      {
        id: 'qe45', type: 'numeric',
        title: 'P(Sum > 9 on Two Dice)',
        description: 'Roll two fair dice. What is the probability the sum is <strong>greater than 9</strong>?\n\nEnter as a decimal rounded to 4 places.',
        unit: '',
        answer: 0.1667,
        tolerance: 0.0005,
        steps: [
          { label: 'Sums > 9: 10, 11, 12', value: 'Ways: 3 + 2 + 1 = 6' },
          { label: 'Total outcomes', value: '36' },
          { label: 'P(sum > 9)', value: '6/36 = 1/6 ≈ 0.1667' },
        ],
        explanation: 'P(sum > 9) = P(10)+P(11)+P(12) = 3/36+2/36+1/36 = 6/36 = 1/6 ≈ 16.67%.',
      },
      {
        id: 'qe46', type: 'numeric',
        title: 'Continuously Compounded Return',
        description: 'A stock rises from <strong>$50</strong> to <strong>$60</strong> over one year. What is the continuously compounded (log) return in percent?',
        unit: '%',
        answer: 18.23,
        tolerance: 0.05,
        steps: [
          { label: 'Log return', value: 'r = ln(S₁/S₀) = ln(60/50) = ln(1.2)' },
          { label: 'ln(1.2)', value: '≈ 0.18232' },
          { label: 'Log return', value: '18.23%' },
        ],
        explanation: 'Log return = ln(S₁/S₀) = ln(1.2) ≈ 18.23%. Slightly less than the simple 20% return. Log returns are additive over time.',
      },
      {
        id: 'qe47', type: 'numeric',
        title: 'EV: Biased Coin Game',
        description: 'A biased coin shows heads with probability <strong>0.6</strong>. You win <strong>$3</strong> on heads, lose <strong>$2</strong> on tails. What is the expected value per flip?',
        unit: '$',
        answer: 1.00,
        tolerance: 0.01,
        steps: [
          { label: 'E[win on heads]', value: '0.6 × $3 = $1.80' },
          { label: 'E[loss on tails]', value: '0.4 × (−$2) = −$0.80' },
          { label: 'E[X]', value: '$1.80 − $0.80 = $1.00' },
        ],
        explanation: 'EV = P(H)×win + P(T)×loss = 0.6×3 + 0.4×(−2) = 1.80 − 0.80 = $1.00 per flip.',
      },
      {
        id: 'qe48', type: 'numeric',
        title: 'P(Matching Birthdays: 2 People)',
        description: 'In a group of <strong>2 people</strong>, what is the probability they share the same birthday? (Assume 365 equally likely days.)\n\nEnter as a decimal rounded to 4 places.',
        unit: '',
        answer: 0.0027,
        tolerance: 0.0005,
        steps: [
          { label: 'P(person 2 matches person 1)', value: '1/365 ≈ 0.0027' },
        ],
        explanation: 'P(shared birthday) = 1/365 ≈ 0.27% for 2 people. This small number makes the birthday paradox (50% chance with just 23 people) counterintuitive.',
      },
      {
        id: 'qe49', type: 'numeric',
        title: 'Simple Interest Earned',
        description: 'You deposit <strong>$5,000</strong> at <strong>4% simple annual interest</strong>. How much interest do you earn after <strong>3 years</strong>?',
        unit: '$',
        answer: 600,
        tolerance: 0.01,
        steps: [
          { label: 'Simple interest formula', value: 'I = P × r × t = 5000 × 0.04 × 3' },
          { label: 'I', value: '= $600' },
        ],
        explanation: 'Simple interest: I = Prt = 5000 × 0.04 × 3 = $600. Only the original principal earns interest (unlike compound interest).',
      },
      {
        id: 'qe50', type: 'numeric',
        title: 'Variance of Bernoulli Variable',
        description: 'X is a Bernoulli random variable with P(X=1) = <strong>0.4</strong>. What is the variance of X?',
        unit: '',
        answer: 0.24,
        tolerance: 0.001,
        steps: [
          { label: 'Bernoulli variance', value: 'Var(X) = p(1−p)' },
          { label: 'Var(X)', value: '0.4 × 0.6 = 0.24' },
        ],
        explanation: 'For Bernoulli(p): Var(X) = p(1−p) = 0.4 × 0.6 = 0.24. Variance is maximized at p=0.5.',
      },
      {
        id: 'qe51', type: 'numeric',
        title: 'P(At Least One 6 in 2 Rolls)',
        description: 'Roll a fair die <strong>twice</strong>. What is the probability of at least one <strong>6</strong>?\n\nEnter as a decimal rounded to 4 places.',
        unit: '',
        answer: 0.3056,
        tolerance: 0.0005,
        steps: [
          { label: 'P(no 6 in two rolls)', value: '(5/6)² = 25/36' },
          { label: 'Complement', value: 'P(at least one 6) = 1 − 25/36 = 11/36 ≈ 0.3056' },
        ],
        explanation: 'P(≥1 six) = 1 − (5/6)² = 11/36 ≈ 30.56%. Use the complement to avoid counting overlapping cases.',
      },
      {
        id: 'qe52', type: 'numeric',
        title: 'Annuity Future Value',
        description: 'You invest <strong>$100</strong> at the end of each year for <strong>3 years</strong> at <strong>5% annual interest</strong>. What is the total future value at the end of year 3?',
        unit: '$',
        answer: 315.25,
        tolerance: 0.01,
        steps: [
          { label: 'Year 1 deposit grows 2 years', value: '100 × (1.05)² = $110.25' },
          { label: 'Year 2 deposit grows 1 year', value: '100 × 1.05 = $105.00' },
          { label: 'Year 3 deposit grows 0 years', value: '100' },
          { label: 'Total FV', value: '$110.25 + $105.00 + $100.00 = $315.25' },
        ],
        explanation: 'Each payment compounds from when it is made. The year-1 payment earns interest for 2 years, year-2 for 1 year, year-3 for 0 years. FV = $315.25.',
      },
      {
        id: 'qe53', type: 'numeric',
        title: '5-Card Poker Hands',
        description: 'How many distinct <strong>5-card hands</strong> can be dealt from a standard 52-card deck?',
        unit: '',
        answer: 2598960,
        tolerance: 0,
        steps: [
          { label: 'C(52, 5)', value: '52! / (5! × 47!)' },
          { label: 'Numerator', value: '52 × 51 × 50 × 49 × 48 = 311,875,200' },
          { label: 'C(52,5)', value: '311,875,200 / 120 = 2,598,960' },
        ],
        explanation: 'C(52,5) = 2,598,960 total 5-card hands. This is the denominator for all poker probability calculations.',
      },
      {
        id: 'qe54', type: 'numeric',
        title: 'Perpetuity Present Value',
        description: 'A perpetuity pays <strong>$50</strong> per year forever. The discount rate is <strong>5%</strong>. What is the present value?',
        unit: '$',
        answer: 1000,
        tolerance: 0.01,
        steps: [
          { label: 'PV of perpetuity', value: 'PV = C / r' },
          { label: 'PV', value: '$50 / 0.05 = $1,000' },
        ],
        explanation: 'Perpetuity PV = C/r. Derived from summing the geometric series C/(1+r) + C/(1+r)² + … = C/r. $50 per year discounted at 5% = $1,000.',
      },
      {
        id: 'qe55', type: 'numeric',
        title: 'Normal Distribution: 95% Rule',
        description: 'Monthly portfolio returns: mean <strong>1%</strong>, std dev <strong>3%</strong>. Using the empirical rule, what fraction of months have returns between <strong>−5%</strong> and <strong>7%</strong>?',
        unit: '%',
        answer: 95,
        tolerance: 0.5,
        steps: [
          { label: 'Check bounds', value: '−5% = 1% − 2×3%; 7% = 1% + 2×3%' },
          { label: '95% rule: μ ± 2σ', value: 'Contains ~95% of observations' },
          { label: 'Answer', value: '≈ 95%' },
        ],
        explanation: 'The range [−5%, 7%] = [μ−2σ, μ+2σ]. By the 68-95-99.7 rule, approximately 95% of normally distributed values fall within 2 standard deviations.',
      },
      {
        id: 'qe56', type: 'numeric',
        title: 'Forward Price (Continuous Compounding)',
        description: 'A stock trades at <strong>$100</strong>. The risk-free rate is <strong>8%</strong> continuously compounded. What is the <strong>6-month forward price</strong>?',
        unit: '$',
        answer: 104.08,
        tolerance: 0.05,
        steps: [
          { label: 'Forward price formula', value: 'F = S × e^(rT)' },
          { label: 'F = 100 × e^(0.08 × 0.5)', value: '= 100 × e^0.04 = 100 × 1.04081' },
          { label: 'F', value: '≈ $104.08' },
        ],
        explanation: 'F = S₀ × e^(rT) = 100 × e^0.04 ≈ $104.08. Any other forward price would create an arbitrage opportunity.',
      },
      {
        id: 'qe57', type: 'numeric',
        title: 'Standard Deviation from Variance',
        description: 'A random variable has variance <strong>49</strong>. What is its standard deviation?',
        unit: '',
        answer: 7,
        tolerance: 0,
        steps: [
          { label: 'σ = √Variance', value: 'σ = √49' },
          { label: 'σ', value: '= 7' },
        ],
        explanation: 'Standard deviation is the square root of variance: σ = √49 = 7. Standard deviation has the same units as the original variable.',
      },
      {
        id: 'qe58', type: 'numeric',
        title: 'Covariance from Correlation',
        description: 'Two stocks have correlation <strong>0.6</strong>, with standard deviations <strong>10%</strong> and <strong>15%</strong>. What is their covariance (in %²)?',
        unit: '',
        answer: 90,
        tolerance: 0.01,
        steps: [
          { label: 'Cov = ρ × σ_X × σ_Y', value: '= 0.6 × 10 × 15' },
          { label: 'Cov', value: '= 90 %²' },
        ],
        explanation: 'Cov(X,Y) = ρ·σ_X·σ_Y = 0.6 × 10 × 15 = 90. Covariance = correlation × product of standard deviations.',
      },
      {
        id: 'qe59', type: 'numeric',
        title: 'Binomial Probability: 2 Successes in 5 Trials',
        description: 'In <strong>5 independent trials</strong> each with success probability <strong>0.3</strong>, what is P(exactly 2 successes)?\n\nRound to 4 decimal places.',
        unit: '',
        answer: 0.3087,
        tolerance: 0.0005,
        steps: [
          { label: 'Binomial formula', value: 'P(X=2) = C(5,2) × 0.3² × 0.7³' },
          { label: 'C(5,2) = 10', value: '10 × 0.09 × 0.343 = 10 × 0.03087' },
          { label: 'P(X=2)', value: '= 0.3087' },
        ],
        explanation: 'P(X=k) = C(n,k)pᵏ(1−p)^(n−k). Here C(5,2)=10, 0.3²=0.09, 0.7³=0.343 → P = 0.3087.',
      },
      {
        id: 'qe60', type: 'numeric',
        title: 'P(Two Aces in a Row)',
        description: 'Draw two cards without replacement from a standard deck. What is the probability that <strong>both are aces</strong>?\n\nRound to 4 decimal places.',
        unit: '',
        answer: 0.0045,
        tolerance: 0.0005,
        steps: [
          { label: 'P(1st is ace)', value: '4/52' },
          { label: 'P(2nd is ace | 1st was ace)', value: '3/51' },
          { label: 'P(both aces)', value: '(4/52) × (3/51) = 12/2652 ≈ 0.0045' },
        ],
        explanation: 'P = (4×3)/(52×51) = 12/2652 ≈ 0.45%. A rare event — about 1 in 221 hands.',
      },
      {
        id: 'qe61', type: 'numeric',
        title: 'Call Option Intrinsic Value',
        description: 'A call option has strike <strong>$55</strong>. The underlying stock is at <strong>$62</strong>. What is the intrinsic value?',
        unit: '$',
        answer: 7,
        tolerance: 0,
        steps: [
          { label: 'Intrinsic value = max(S − K, 0)', value: '' },
          { label: 'max(62 − 55, 0)', value: '= max(7, 0) = $7' },
        ],
        explanation: 'Intrinsic value = max(S − K, 0) = max($62 − $55, 0) = $7. The option is in-the-money by $7.',
      },
      {
        id: 'qe62', type: 'numeric',
        title: 'Median of a Dataset',
        description: 'Find the median of: <strong>3, 8, 1, 15, 7, 4, 11</strong>.',
        unit: '',
        answer: 7,
        tolerance: 0,
        steps: [
          { label: 'Sort the data', value: '1, 3, 4, 7, 8, 11, 15' },
          { label: 'Middle value (4th of 7)', value: '7' },
        ],
        explanation: 'Median = middle value after sorting. With 7 values, the median is the 4th: {1,3,4,<strong>7</strong>,8,11,15} → 7.',
      },
      {
        id: 'qe63', type: 'numeric',
        title: 'Variance of Two Independent Variables',
        description: 'X and Y are independent. <strong>Var[X] = 9</strong>, <strong>Var[Y] = 16</strong>. What is <strong>Var[X + Y]</strong>?',
        unit: '',
        answer: 25,
        tolerance: 0,
        steps: [
          { label: 'For independent variables', value: 'Var[X+Y] = Var[X] + Var[Y]' },
          { label: 'Var[X+Y]', value: '9 + 16 = 25' },
        ],
        explanation: 'For independent random variables, Var[X+Y] = Var[X] + Var[Y] = 9 + 16 = 25. (Cross terms cancel because Cov = 0.)',
      },
      {
        id: 'qe64', type: 'numeric',
        title: 'Portfolio Expected Return (60/40)',
        description: 'A portfolio: <strong>60%</strong> in Stock A (expected return <strong>12%</strong>), <strong>40%</strong> in Stock B (expected return <strong>6%</strong>). What is the portfolio expected return?',
        unit: '%',
        answer: 9.6,
        tolerance: 0.01,
        steps: [
          { label: 'E[Rp] = w_A × r_A + w_B × r_B', value: '' },
          { label: '= 0.60 × 12% + 0.40 × 6%', value: '= 7.2% + 2.4%' },
          { label: 'E[Rp]', value: '= 9.6%' },
        ],
        explanation: 'Portfolio expected return = weighted average of component returns = 0.60×12% + 0.40×6% = 9.6%.',
      },
      {
        id: 'qe65', type: 'numeric',
        title: 'P(Rolling at Least 4)',
        description: 'You roll one fair 6-sided die. What is the probability of rolling <strong>4 or higher</strong>?',
        unit: '',
        answer: 0.5,
        tolerance: 0.005,
        steps: [
          { label: 'Favorable outcomes', value: '4, 5, 6 → 3 outcomes' },
          { label: 'P(≥ 4)', value: '3/6 = 0.5' },
        ],
        explanation: 'P(X ≥ 4) = 3/6 = 1/2. Exactly half of the faces show 4, 5, or 6.',
      },
    ],
    medium: [
      {
        id: 'qm4', type: 'numeric',
        title: "Bayes' Theorem: Medical Test",
        description: 'A disease affects <strong>10%</strong> of a population.\n\nA diagnostic test has:\n• <strong>90% sensitivity</strong> (correctly detects disease)\n• <strong>80% specificity</strong> (correctly identifies healthy people)\n\nA patient tests positive. What is the probability they actually have the disease?\n\nEnter as a decimal rounded to 3 places (e.g. <code>0.333</code>).',
        unit: '',
        answer: 0.333,
        tolerance: 0.002,
        steps: [
          { label: 'P(positive | disease)', value: '90% sensitivity → 0.9' },
          { label: 'P(positive | healthy)', value: '1 − 80% specificity = 20% false positive rate → 0.2' },
          { label: 'P(positive overall)', value: '0.9×0.1 + 0.2×0.9 = 0.09 + 0.18 = 0.27' },
          { label: 'P(disease | positive)', value: '0.09 ÷ 0.27 = 1/3 ≈ 0.333' },
        ],
        explanation: "Bayes': P(D|+) = P(+|D)×P(D) / P(+) = 0.9×0.1 / 0.27 = 1/3 ≈ 0.333. Even with a 90% sensitive test, only 1 in 3 positives actually has the disease when prevalence is just 10%. This is why screening rare diseases needs very high specificity.",
      },
      {
        id: 'qm5', type: 'numeric',
        title: 'CAPM Expected Return',
        description: 'Using the <strong>Capital Asset Pricing Model (CAPM)</strong>:\n\n• Risk-free rate: <strong>3%</strong>\n• Expected market return: <strong>10%</strong>\n• Asset beta (β): <strong>1.5</strong>\n\nWhat is the <strong>expected return</strong> of the asset?\n\nEnter as a percentage (e.g. <code>13.50</code>).',
        unit: '%',
        answer: 13.5,
        tolerance: 0.05,
        steps: [
          { label: 'Market risk premium', value: 'E[Rm] − rf = 10% − 3% = 7%' },
          { label: 'Beta contribution', value: 'β × 7% = 1.5 × 7% = 10.5%' },
          { label: 'E[R] = rf + β × (E[Rm] − rf)', value: '3% + 10.5% = 13.5%' },
        ],
        explanation: 'CAPM: E[R] = rf + β(E[Rm]−rf) = 3% + 1.5×7% = 13.5%. A beta of 1.5 means 50% more market exposure than the average asset. The extra return comes from bearing extra systematic risk.',
      },
      {
        id: 'qm6', type: 'numeric',
        title: 'Standard Deviation of Returns',
        description: 'A stock has the following annual return distribution:\n• <strong>+20%</strong> with probability 0.5\n• <strong>−10%</strong> with probability 0.3\n• <strong>0%</strong> with probability 0.2\n\nWhat is the <strong>standard deviation</strong> of returns?\n\nEnter as a percentage rounded to 2 decimal places.',
        unit: '%',
        answer: 13.45,
        tolerance: 0.05,
        steps: [
          { label: 'E[R]', value: '0.5×20 + 0.3×(−10) + 0.2×0 = 10 − 3 = 7%' },
          { label: 'Variance = Σ pᵢ×(rᵢ−E[R])²', value: '0.5×(13)² + 0.3×(17)² + 0.2×(7)² = 84.5 + 86.7 + 9.8 = 181' },
          { label: 'σ = √Variance', value: '√181 ≈ 13.45%' },
        ],
        explanation: 'E[R] = 7%. Variance = Σpᵢ(rᵢ−μ)² = 0.5×169 + 0.3×289 + 0.2×49 = 84.5 + 86.7 + 9.8 = 181. σ = √181 ≈ 13.45%.',
      },
      {
        id: 'qm1', type: 'numeric',
        title: 'Returns Are Not Symmetric',
        description: 'A stock rises <strong>50%</strong> in January, then falls <strong>50%</strong> in February.\n\nStarting from $100, what is the stock price at the end of February?\n\nEnter the price in dollars (e.g. <code>75.00</code>).',
        unit: '$',
        answer: 75,
        tolerance: 0.01,
        steps: [
          { label: 'After +50%', value: '$100 × 1.50 = $150' },
          { label: 'After −50%', value: '$150 × 0.50 = $75' },
        ],
        explanation: 'Percentage gains and losses are NOT symmetric. A 50% gain followed by a 50% loss = $100 × 1.5 × 0.5 = $75. Net return = −25%. This is why geometric returns are used for multi-period analysis.',
      },
      {
        id: 'qm2', type: 'numeric',
        title: 'Monty Hall Problem',
        description: 'You\'re on a game show. There are <strong>3 doors</strong>: one has a car, two have goats. You pick Door 1. The host (who always knows where the car is) opens Door 3, revealing a goat.\n\nYou switch to Door 2. What is the probability you win the car?\n\nEnter as a fraction in decimal form (e.g. <code>0.333</code> for 1/3).',
        unit: '',
        answer: 0.6667,
        tolerance: 0.001,
        steps: [
          { label: 'P(car behind Door 1) initially', value: '1/3' },
          { label: 'P(car NOT behind Door 1)', value: '2/3 (split across Doors 2 and 3)' },
          { label: 'Host reveals a goat behind Door 3', value: 'Your original pick stays at 1/3 — the remaining 2/3 consolidates onto Door 2' },
          { label: 'P(win by switching)', value: '2/3 ≈ 0.6667' },
        ],
        explanation: 'Switching gives you 2/3 probability of winning. Your initial pick had a 1/3 chance. The remaining 2/3 probability was split between doors 2 and 3 — when the host eliminates one, all 2/3 collapses onto the remaining door. Always switch.',
      },
      {
        id: 'qm3', type: 'numeric',
        title: 'Geometric Distribution',
        description: 'You roll a fair 6-sided die repeatedly until you roll a <strong>6</strong>.\n\nWhat is the <strong>expected number of rolls</strong>?\n\nEnter an exact integer.',
        unit: 'rolls',
        answer: 6,
        tolerance: 0,
        steps: [
          { label: 'Distribution', value: 'Geometric with p = 1/6' },
          { label: 'E[X]', value: '1/p = 1/(1/6) = 6' },
        ],
        explanation: 'For a geometric distribution with success probability p, E[X] = 1/p. Here p = 1/6, so you expect to roll 6 times on average.',
      },
      {
        id: 'qm37', type: 'numeric',
        title: "Bayes' Theorem: Disease Testing",
        description: 'A disease affects <strong>1%</strong> of the population. A test has <strong>95% sensitivity</strong> (true positive rate) and <strong>90% specificity</strong> (true negative rate). If you test positive, what is the probability you have the disease?\n\nRound to 4 decimal places.',
        unit: '',
        answer: 0.0876,
        tolerance: 0.0005,
        steps: [
          { label: 'P(+|D)=0.95, P(+|no D)=0.10, P(D)=0.01', value: '' },
          { label: 'P(+) = 0.95×0.01 + 0.10×0.99', value: '= 0.0095 + 0.099 = 0.1085' },
          { label: "P(D|+) = P(+|D)×P(D) / P(+)", value: '= 0.0095 / 0.1085 ≈ 0.0876' },
        ],
        explanation: "Bayes': P(D|+) = P(+|D)P(D)/P(+) = 0.0095/0.1085 ≈ 8.76%. Even with a 95% sensitive test, most positives are false alarms when the disease affects only 1% of people.",
      },
      {
        id: 'qm38', type: 'numeric',
        title: 'Geometric Distribution: Expected Rolls',
        description: 'You roll a fair die repeatedly until you get a <strong>6</strong>. What is the expected number of rolls?',
        unit: 'rolls',
        answer: 6,
        tolerance: 0,
        steps: [
          { label: 'X ~ Geometric(p = 1/6)', value: '' },
          { label: 'E[X] = 1/p', value: '= 1/(1/6) = 6 rolls' },
        ],
        explanation: 'For Geometric(p): E[X] = 1/p = 6. On average you need 6 rolls to get one six.',
      },
      {
        id: 'qm39', type: 'numeric',
        title: 'Portfolio Variance with Correlation',
        description: 'Portfolio: <strong>50%</strong> in Asset A (σ = <strong>20%</strong>), <strong>50%</strong> in Asset B (σ = <strong>30%</strong>), correlation = <strong>0.4</strong>. What is the portfolio standard deviation?',
        unit: '%',
        answer: 21.10,
        tolerance: 0.1,
        steps: [
          { label: 'σ²_p = w²_A σ²_A + w²_B σ²_B + 2w_A w_B ρ σ_A σ_B', value: '' },
          { label: '= 0.25×400 + 0.25×900 + 2×0.5×0.5×0.4×20×30', value: '= 100 + 225 + 120 = 445' },
          { label: 'σ_p = √445', value: '≈ 21.10%' },
        ],
        explanation: 'Var_p = 100 + 225 + 2(0.25)(0.4)(600) = 100+225+120 = 445. σ_p = √445 ≈ 21.10%.',
      },
      {
        id: 'qm40', type: 'numeric',
        title: 'Sharpe Ratio',
        description: 'Portfolio: expected return <strong>12%</strong>, volatility <strong>18%</strong>, risk-free rate <strong>3%</strong>. What is the Sharpe ratio?',
        unit: '',
        answer: 0.5,
        tolerance: 0.01,
        steps: [
          { label: 'Sharpe = (E[R] − Rf) / σ', value: '' },
          { label: '= (12% − 3%) / 18%', value: '= 9% / 18%' },
          { label: 'Sharpe ratio', value: '= 0.5' },
        ],
        explanation: 'Sharpe ratio = excess return / volatility = 9%/18% = 0.5. Measures risk-adjusted return; above 1.0 is generally considered strong.',
      },
      {
        id: 'qm41', type: 'numeric',
        title: 'Put-Call Parity',
        description: 'A European call option is worth <strong>$8</strong>. Strike = <strong>$100</strong>, stock price = <strong>$100</strong>, risk-free rate = <strong>5%</strong>, T = <strong>1 year</strong> (continuous). What is the put price?\n\nRound to 2 decimal places.',
        unit: '$',
        answer: 3.12,
        tolerance: 0.05,
        steps: [
          { label: 'Put-call parity: C − P = S − K×e^(−rT)', value: '' },
          { label: 'PV of strike = 100×e^(−0.05)', value: '= 100×0.9512 = 95.12' },
          { label: 'P = C − S + PV(K) = 8 − 100 + 95.12', value: '= $3.12' },
        ],
        explanation: 'Put-call parity: C − P = S − Ke^(−rT). Rearranging: P = C + Ke^(−rT) − S = 8 + 95.12 − 100 = $3.12.',
      },
      {
        id: 'qm42', type: 'numeric',
        title: 'Poisson: P(X = 3)',
        description: 'Customers arrive at rate <strong>λ = 4</strong> per hour (Poisson). What is the probability that exactly <strong>3</strong> arrive in one hour?\n\nRound to 4 decimal places.',
        unit: '',
        answer: 0.1954,
        tolerance: 0.0005,
        steps: [
          { label: 'P(X=k) = e^(−λ) × λᵏ / k!', value: '' },
          { label: 'P(X=3) = e^(−4) × 4³ / 3!', value: '= e^(−4) × 64 / 6' },
          { label: 'P(X=3)', value: '= 0.01832 × 64 / 6 ≈ 0.1954' },
        ],
        explanation: 'P(X=3) = e^(−4) × 4³/3! = e^(−4) × 64/6 ≈ 0.1954.',
      },
      {
        id: 'qm43', type: 'numeric',
        title: 'CAPM Expected Return',
        description: 'CAPM: risk-free rate = <strong>3%</strong>, market return = <strong>10%</strong>, beta = <strong>1.5</strong>. What is the expected return?',
        unit: '%',
        answer: 13.5,
        tolerance: 0.01,
        steps: [
          { label: 'E[R] = Rf + β × (E[Rm] − Rf)', value: '' },
          { label: 'Market risk premium', value: '10% − 3% = 7%' },
          { label: 'E[R]', value: '3% + 1.5 × 7% = 3% + 10.5% = 13.5%' },
        ],
        explanation: 'CAPM: E[R] = 3% + 1.5×7% = 13.5%. Beta of 1.5 means 50% more market exposure → 50% higher risk premium.',
      },
      {
        id: 'qm44', type: 'numeric',
        title: 'Conditional Probability: Face Card',
        description: 'A card is drawn from a standard deck and it is a <strong>face card</strong> (J, Q, K). What is the probability it is also a <strong>heart</strong>?',
        unit: '',
        answer: 0.25,
        tolerance: 0.0005,
        steps: [
          { label: 'Total face cards', value: '12 (J, Q, K in 4 suits)' },
          { label: 'Face cards that are hearts', value: '3 (J♥, Q♥, K♥)' },
          { label: 'P(heart | face card)', value: '3/12 = 0.25' },
        ],
        explanation: 'P(heart | face) = 3/12 = 1/4. Among the 12 face cards (J, Q, K × 4 suits), exactly 3 are hearts.',
      },
      {
        id: 'qm45', type: 'numeric',
        title: "Gambler's Ruin: P(Win)",
        description: 'A gambler starts with <strong>$3</strong> and plays a fair game. The game ends when they reach <strong>$0</strong> (ruin) or <strong>$10</strong> (win). What is the probability the gambler wins?',
        unit: '',
        answer: 0.3,
        tolerance: 0.005,
        steps: [
          { label: "Gambler's ruin (fair game)", value: 'P(win) = k / N' },
          { label: 'k = 3, N = 10', value: 'P(win) = 3/10' },
          { label: 'P(win)', value: '= 0.30' },
        ],
        explanation: 'For a symmetric random walk absorbed at 0 or N: P(reach N | start at k) = k/N = 3/10 = 30%.',
      },
      {
        id: 'qm46', type: 'numeric',
        title: 'Macaulay Duration',
        description: 'A bond: <strong>$100 face</strong>, <strong>6% annual coupon</strong>, <strong>2 years to maturity</strong>, YTM = <strong>6%</strong>. What is the Macaulay Duration?',
        unit: 'years',
        answer: 1.9434,
        tolerance: 0.005,
        steps: [
          { label: 'PV(CF₁) = 6/1.06 = 5.660; PV(CF₂) = 106/1.06² = 94.340', value: '' },
          { label: 'Price = 5.660 + 94.340 = 100', value: '' },
          { label: 'D = (1×5.660 + 2×94.340)/100', value: '= 194.34/100 = 1.9434 years' },
        ],
        explanation: 'Macaulay Duration = PV-weighted average maturity. At par (coupon=YTM), D = (1×5.66 + 2×94.34)/100 ≈ 1.943 years.',
      },
      {
        id: 'qm47', type: 'numeric',
        title: 'Kelly Criterion (2:1 Odds)',
        description: 'A bet pays <strong>$2 profit per $1 risked</strong> with probability <strong>0.55</strong>, or loses the $1 with probability 0.45. What fraction of bankroll should you bet (Kelly criterion)?',
        unit: '',
        answer: 0.325,
        tolerance: 0.005,
        steps: [
          { label: 'Kelly: f* = (bp − q) / b', value: 'b=2, p=0.55, q=0.45' },
          { label: 'Numerator: 2×0.55 − 0.45', value: '= 1.10 − 0.45 = 0.65' },
          { label: 'f* = 0.65 / 2', value: '= 0.325 = 32.5%' },
        ],
        explanation: 'Kelly f* = (bp−q)/b = (2×0.55−0.45)/2 = 0.65/2 = 32.5%. This maximizes long-run geometric growth rate.',
      },
      {
        id: 'qm48', type: 'numeric',
        title: 'Law of Total Expectation',
        description: 'A fair coin is flipped. If heads, X is uniform on {1, 2, 3}. If tails, X is uniform on {4, 5}. What is <strong>E[X]</strong>?',
        unit: '',
        answer: 3.25,
        tolerance: 0.01,
        steps: [
          { label: 'E[X | heads] = (1+2+3)/3', value: '= 2' },
          { label: 'E[X | tails] = (4+5)/2', value: '= 4.5' },
          { label: 'E[X] = 0.5×2 + 0.5×4.5', value: '= 1 + 2.25 = 3.25' },
        ],
        explanation: 'E[X] = P(H)·E[X|H] + P(T)·E[X|T] = 0.5×2 + 0.5×4.5 = 3.25.',
      },
      {
        id: 'qm49', type: 'numeric',
        title: 'Markov Chain Steady State',
        description: 'A two-state Markov chain: from state A, go to B with prob <strong>0.3</strong>; from state B, go to A with prob <strong>0.4</strong>. What is the <strong>steady-state probability of A</strong>?',
        unit: '',
        answer: 0.5714,
        tolerance: 0.0005,
        steps: [
          { label: 'Balance: π_A × 0.3 = π_B × 0.4', value: '' },
          { label: 'Plus π_A + π_B = 1', value: 'Solve: π_A = 4/7' },
          { label: 'π_A', value: '= 4/7 ≈ 0.5714' },
        ],
        explanation: 'Steady-state: flow from A to B equals flow from B to A. π_A(0.3) = π_B(0.4), so π_A/π_B = 4/3. With normalization: π_A = 4/7 ≈ 0.5714.',
      },
      {
        id: 'qm50', type: 'numeric',
        title: 'Negative Binomial: Expected Trials',
        description: 'You need <strong>3 successes</strong> in Bernoulli trials with p = <strong>0.25</strong>. What is the expected number of trials?',
        unit: 'trials',
        answer: 12,
        tolerance: 0,
        steps: [
          { label: 'Negative binomial: E[X] = r/p', value: 'r = 3, p = 0.25' },
          { label: 'E[X]', value: '= 3 / 0.25 = 12 trials' },
        ],
        explanation: 'Negative Binomial: expected trials for r successes = r/p = 3/0.25 = 12.',
      },
      {
        id: 'qm51', type: 'numeric',
        title: 'Option Time Value',
        description: 'A call with strike <strong>$50</strong> on a stock at <strong>$54</strong> is priced at <strong>$6.50</strong>. What is the time value of this option?',
        unit: '$',
        answer: 2.5,
        tolerance: 0.01,
        steps: [
          { label: 'Intrinsic value = max(54−50, 0)', value: '= $4.00' },
          { label: 'Time value = price − intrinsic', value: '= $6.50 − $4.00' },
          { label: 'Time value', value: '= $2.50' },
        ],
        explanation: 'Option price = intrinsic value + time value. Intrinsic = max(S−K,0) = $4. Time value = $6.50 − $4 = $2.50 (value of optionality before expiry).',
      },
      {
        id: 'qm52', type: 'numeric',
        title: 'Law of Total Variance',
        description: 'A fair die is rolled. If ≤ 3, X ~ Uniform{1,2,3} (mean=2, var=2/3). If > 3, X ~ Uniform{4,5,6} (mean=5, var=2/3). Find <strong>Var(X)</strong>.',
        unit: '',
        answer: 2.9167,
        tolerance: 0.005,
        steps: [
          { label: 'E[Var(X|Y)] = 0.5×(2/3)+0.5×(2/3)', value: '= 2/3 ≈ 0.667' },
          { label: 'Var(E[X|Y]): E[X]=3.5; Var = 0.5(2−3.5)²+0.5(5−3.5)²', value: '= 0.5×2.25+0.5×2.25 = 2.25' },
          { label: 'Var(X) = 2/3 + 2.25', value: '≈ 2.917' },
        ],
        explanation: 'Law of total variance: Var(X) = E[Var(X|Y)] + Var(E[X|Y]) = 2/3 + 2.25 ≈ 2.917.',
      },
      {
        id: 'qm53', type: 'numeric',
        title: 'Forward Price with Dividend',
        description: 'Stock = <strong>$120</strong>, pays dividend <strong>$2</strong> in 6 months. Risk-free rate = <strong>6%</strong> continuously compounded. What is the <strong>1-year forward price</strong>?',
        unit: '$',
        answer: 125.38,
        tolerance: 0.1,
        steps: [
          { label: 'PV(dividend) = 2×e^(−0.06×0.5)', value: '= 2×e^(−0.03) = 2×0.9704 = 1.941' },
          { label: 'Adjusted spot: S* = 120 − 1.941', value: '= 118.059' },
          { label: 'F = 118.059 × e^(0.06)', value: '= 118.059 × 1.0618 ≈ $125.38' },
        ],
        explanation: 'F = (S − PV(D)) × e^(rT). Dividend paid at 6 months has PV = 2e^(−0.03) ≈ $1.94. Adjusted spot = $118.06. F = 118.06 × e^0.06 ≈ $125.38.',
      },
      {
        id: 'qm54', type: 'numeric',
        title: 'Poisson: Expected Interarrival Time',
        description: 'Trades arrive via a Poisson process at rate <strong>λ = 3</strong> per minute. What is the expected time between consecutive trades?',
        unit: 'minutes',
        answer: 0.3333,
        tolerance: 0.0005,
        steps: [
          { label: 'Interarrival times are Exponential(λ)', value: '' },
          { label: 'E[T] = 1/λ', value: '= 1/3 ≈ 0.3333 minutes' },
        ],
        explanation: 'For a Poisson(λ) process, interarrival times ~ Exponential(λ) with mean 1/λ = 1/3 ≈ 20 seconds.',
      },
      {
        id: 'qm55', type: 'numeric',
        title: 'Risk-Neutral Probability (Binomial)',
        description: 'Stock = <strong>$100</strong>, up to <strong>$110</strong> (u=1.1) or down to <strong>$90</strong> (d=0.9). Risk-free rate = <strong>5%</strong> per period (continuous). Find the risk-neutral probability of an up move.',
        unit: '',
        answer: 0.7564,
        tolerance: 0.0005,
        steps: [
          { label: 'q = (e^r − d) / (u − d)', value: '' },
          { label: 'q = (e^0.05 − 0.9) / (1.1 − 0.9)', value: '= (1.05127 − 0.9) / 0.2' },
          { label: 'q', value: '= 0.15127 / 0.2 ≈ 0.7564' },
        ],
        explanation: 'Risk-neutral q = (e^r − d)/(u − d) = (1.05127 − 0.9)/0.2 ≈ 0.7564.',
      },
      {
        id: 'qm56', type: 'numeric',
        title: 'Correlation for Half Variance',
        description: 'Two assets each have σ = <strong>20%</strong>. You hold equal weights. At what correlation does portfolio variance equal <strong>half</strong> the variance of one asset?',
        unit: '',
        answer: 0,
        tolerance: 0.01,
        steps: [
          { label: 'σ²_p = 0.5σ²(1+ρ)', value: 'For equal-weight 2-asset portfolio' },
          { label: 'Set = 0.5σ²', value: '0.5σ²(1+ρ) = 0.5σ² → ρ = 0' },
          { label: 'ρ', value: '= 0' },
        ],
        explanation: 'Portfolio variance = 0.5σ²(1+ρ). For this to equal 0.5σ², we need ρ = 0. Zero correlation exactly halves the variance of an equal-weighted portfolio.',
      },
      {
        id: 'qm57', type: 'numeric',
        title: 'Conditional Expected Sum (Dice)',
        description: 'Roll two fair dice. Given the sum is <strong>at least 10</strong>, what is the expected value of the sum?\n\nRound to 2 decimal places.',
        unit: '',
        answer: 10.67,
        tolerance: 0.02,
        steps: [
          { label: 'Outcomes with sum ≥ 10', value: 'Sum=10: 3 ways, Sum=11: 2 ways, Sum=12: 1 way → 6 total' },
          { label: 'Weighted sum', value: '(10×3 + 11×2 + 12×1) / 6 = (30+22+12)/6' },
          { label: 'E[sum | sum≥10]', value: '= 64/6 ≈ 10.67' },
        ],
        explanation: 'E[sum | sum≥10] = (10×3 + 11×2 + 12×1)/6 = 64/6 ≈ 10.67.',
      },
      {
        id: 'qm58', type: 'numeric',
        title: 'Bond Yield to Maturity',
        description: 'A 1-year bond costs <strong>$980</strong> and pays <strong>$50 coupon</strong> + <strong>$1,000 face</strong> at maturity. What is the yield to maturity?',
        unit: '%',
        answer: 7.14,
        tolerance: 0.05,
        steps: [
          { label: 'YTM equation: 980 = 1050 / (1+y)', value: '' },
          { label: '1+y = 1050/980 = 1.07143', value: '' },
          { label: 'y', value: '= 7.14%' },
        ],
        explanation: 'For a 1-year bond: YTM = (Total CF / Price) − 1 = (1050/980) − 1 = 7.14%.',
      },
      {
        id: 'qm59', type: 'numeric',
        title: 'Expected Maximum of 3 Uniforms',
        description: 'Draw <strong>3 numbers</strong> independently from Uniform[0, 1]. What is the expected value of the <strong>maximum</strong>?',
        unit: '',
        answer: 0.75,
        tolerance: 0.005,
        steps: [
          { label: 'Order statistic formula', value: 'E[X_(k)] = k / (n+1) for Uniform[0,1]' },
          { label: 'Maximum: k=n=3', value: 'E[max] = 3/4 = 0.75' },
        ],
        explanation: 'For n i.i.d. Uniform[0,1], E[kth order statistic] = k/(n+1). Maximum (k=n=3): E[max] = 3/4 = 0.75.',
      },
      {
        id: 'qm60', type: 'numeric',
        title: 'GBM Expected Price',
        description: 'A stock follows GBM with S₀ = <strong>$100</strong>, μ = <strong>0.12</strong>, σ = <strong>0.25</strong>. What is the expected stock price after <strong>2 years</strong>?',
        unit: '$',
        answer: 127.12,
        tolerance: 0.5,
        steps: [
          { label: 'E[S_T] = S₀ × e^(μT)', value: '' },
          { label: 'E[S₂] = 100 × e^(0.12×2)', value: '= 100 × e^0.24 = 100 × 1.2712' },
          { label: 'E[S₂]', value: '≈ $127.12' },
        ],
        explanation: 'Under GBM, E[S_T] = S₀ e^(μT). Note μ is the arithmetic drift. With μ=0.12, T=2: E[S₂] = 100e^0.24 ≈ $127.12.',
      },
      {
        id: 'qm61', type: 'numeric',
        title: 'Poisson: P(Zero Events)',
        description: 'A server crashes at rate <strong>λ = 0.5</strong> per day. What is the probability of <strong>no crashes</strong> in a day?\n\nRound to 4 decimal places.',
        unit: '',
        answer: 0.6065,
        tolerance: 0.0005,
        steps: [
          { label: 'P(X=0) = e^(−λ)', value: '' },
          { label: 'P(X=0) = e^(−0.5)', value: '≈ 0.6065' },
        ],
        explanation: 'P(X=0) = e^(−λ) = e^(−0.5) ≈ 60.65%. P(at least one crash) ≈ 39.35%.',
      },
      {
        id: 'qm62', type: 'numeric',
        title: 'Modified Duration',
        description: 'A bond has Macaulay duration <strong>4.5 years</strong> and YTM <strong>8%</strong> annual. What is the Modified Duration?',
        unit: 'years',
        answer: 4.1667,
        tolerance: 0.005,
        steps: [
          { label: 'D_mod = D_mac / (1 + y)', value: '' },
          { label: 'D_mod = 4.5 / (1.08)', value: '= 4.1667 years' },
        ],
        explanation: 'Modified duration = Macaulay duration / (1+y) = 4.5/1.08 ≈ 4.167. A 1% yield rise → price falls by ~4.17%.',
      },
      {
        id: 'qm63', type: 'numeric',
        title: 'Minimum Variance Portfolio',
        description: 'Asset A: σ_A = <strong>15%</strong>. Asset B: σ_B = <strong>25%</strong>. Correlation ρ = <strong>0.2</strong>. What <strong>weight in Asset A</strong> minimizes portfolio variance?\n\nRound to 4 decimal places.',
        unit: '',
        answer: 0.7857,
        tolerance: 0.005,
        steps: [
          { label: 'w_A = (σ²_B − ρσ_Aσ_B) / (σ²_A + σ²_B − 2ρσ_Aσ_B)', value: '' },
          { label: 'Num: 625 − 0.2×15×25 = 625 − 75 = 550', value: 'Den: 225+625−2×75 = 700' },
          { label: 'w_A = 550/700', value: '≈ 0.7857' },
        ],
        explanation: 'Minimum variance weight: w_A = (σ²_B − ρσ_Aσ_B)/(σ²_A + σ²_B − 2ρσ_Aσ_B) = 550/700 ≈ 0.7857. More weight on the lower-volatility asset.',
      },
      {
        id: 'qm64', type: 'numeric',
        title: 'Conditional Variance (Poisson-Binomial)',
        description: 'X|N ~ Binomial(N, 0.5) and N ~ Poisson(λ=<strong>6</strong>). What is <strong>Var(X)</strong>?\n\nHint: Use the law of total variance.',
        unit: '',
        answer: 3,
        tolerance: 0.01,
        steps: [
          { label: 'E[Var(X|N)] = E[N/4] = λ/4', value: '= 6/4 = 1.5' },
          { label: 'Var(E[X|N]) = Var(N/2) = Var(N)/4 = λ/4', value: '= 1.5' },
          { label: 'Var(X) = 1.5 + 1.5', value: '= 3' },
        ],
        explanation: 'Law of total variance: E[Var(X|N)] + Var(E[X|N]) = λ/4 + λ/4 = 1.5+1.5 = 3.',
      },
      {
        id: 'qm65', type: 'numeric',
        title: "Gambler's Ruin: Unfair Game",
        description: 'A gambler with <strong>$2</strong> plays against a house with <strong>$8</strong> (total $10). Win prob p = <strong>0.4</strong>, lose prob q = <strong>0.6</strong>. What is the probability the gambler wins all $10?\n\nRound to 4 decimal places.',
        unit: '',
        answer: 0.0221,
        tolerance: 0.001,
        steps: [
          { label: 'r = q/p = 0.6/0.4 = 1.5', value: 'Unfair formula: P(win) = (1−rᵏ)/(1−r^N)' },
          { label: 'k=2, N=10: (1−1.5²)/(1−1.5^10)', value: '= (1−2.25)/(1−57.665) = −1.25/−56.665' },
          { label: 'P(win)', value: '= 1.25/56.665 ≈ 0.0221' },
        ],
        explanation: "Unfair gambler's ruin: P = (1−r^k)/(1−r^N) where r=q/p=1.5. With k=2, N=10: P = (1−2.25)/(1−57.665) ≈ 2.21%. The unfavorable odds dramatically reduce win probability.",
      },
    ],
    hard: [
      {
        id: 'qh4', type: 'numeric',
        title: 'Risk-Neutral Probability',
        description: 'In a one-period <strong>binomial options model</strong>:\n• Current stock price: <strong>$100</strong>\n• Up move to: <strong>$110</strong>\n• Down move to: <strong>$90</strong>\n• Risk-free rate: <strong>5%</strong> per period\n\nWhat is the <strong>risk-neutral probability</strong> of an up move?\n\nEnter as a decimal rounded to 4 places (e.g. <code>0.7500</code>).',
        unit: '',
        answer: 0.75,
        tolerance: 0.005,
        steps: [
          { label: 'Risk-neutral condition', value: 'p×S_u + (1−p)×S_d = S×(1+r)' },
          { label: 'Substituting values', value: 'p×110 + (1−p)×90 = 100×1.05 = 105' },
          { label: 'Simplify', value: '90 + 20p = 105 → 20p = 15 → p = 0.75' },
        ],
        explanation: 'The risk-neutral probability satisfies: p = (S(1+r) − S_d) / (S_u − S_d) = (105−90)/(110−90) = 15/20 = 0.75. Note: this is NOT the real probability of an up move — it\'s a mathematical construct used to price derivatives by discounting at the risk-free rate.',
      },
      {
        id: 'qh5', type: 'numeric',
        title: 'Continuously Compounded Return',
        description: 'A stock price doubles from <strong>$50</strong> to <strong>$100</strong> in exactly one year.\n\nWhat is the <strong>continuously compounded (log) return</strong>?\n\nUse ln(2) ≈ 0.6931. Enter as a percentage rounded to 2 decimal places.',
        unit: '%',
        answer: 69.31,
        tolerance: 0.1,
        steps: [
          { label: 'Log return formula', value: 'r_c = ln(P_T / P_0) = ln(100/50)' },
          { label: 'Evaluate', value: '= ln(2) ≈ 0.6931 = 69.31%' },
        ],
        explanation: 'Continuously compounded return = ln(P_T/P_0) = ln(2) ≈ 69.31%. Compare to the simple return of 100%. Log returns are additive over time and normally distributed under GBM, making them essential in quantitative finance.',
      },
      {
        id: 'qh6', type: 'numeric',
        title: 'Sharpe Ratio Comparison',
        description: 'Two portfolios, risk-free rate = 2%:\n\n• Portfolio A: expected return <strong>15%</strong>, volatility <strong>18%</strong>\n• Portfolio B: expected return <strong>9%</strong>, volatility <strong>6%</strong>\n\nWhat is <strong>Portfolio B\'s Sharpe ratio</strong>? Round to 2 decimal places.',
        unit: '',
        answer: 1.17,
        tolerance: 0.01,
        steps: [
          { label: "Portfolio B excess return", value: '9% − 2% = 7%' },
          { label: 'Sharpe(B) = excess return ÷ σ', value: '7% ÷ 6% ≈ 1.17' },
        ],
        explanation: 'Sharpe(B) = (9%−2%)/6% = 1.17. Sharpe(A) = (15%−2%)/18% = 0.72. Despite lower absolute return, B is more efficient per unit of risk — a critical insight for risk-adjusted portfolio evaluation.',
      },
      {
        id: 'qh1', type: 'numeric',
        title: 'Portfolio Volatility',
        description: 'A portfolio: <strong>60% stocks</strong> (σ = 20%) and <strong>40% bonds</strong> (σ = 5%).\nThe correlation between them is <strong>zero</strong>.\n\nWhat is the portfolio standard deviation (σ)?\n\nEnter as a percentage rounded to 2 decimal places (e.g. <code>12.17</code>).',
        unit: '%',
        answer: 12.17,
        tolerance: 0.05,
        steps: [
          { label: 'Variance formula (ρ=0)', value: 'Var = w₁²σ₁² + w₂²σ₂²' },
          { label: 'Substitute', value: 'Var = (0.6)²(0.20)² + (0.4)²(0.05)²' },
          { label: 'Calculate', value: '= 0.36×0.04 + 0.16×0.0025 = 0.0144 + 0.0004 = 0.0148' },
          { label: 'σ', value: '√0.0148 ≈ 0.1217 = 12.17%' },
        ],
        explanation: 'With zero correlation, portfolio variance = w₁²σ₁² + w₂²σ₂². Cross terms drop out. Diversification reduces portfolio volatility below the weighted average (which would be 14%).',
      },
      {
        id: 'qh2', type: 'numeric',
        title: 'Expected Value: Roll Until 6',
        description: 'You roll a fair die until you see a 6. Your payout is <strong>$2ⁿ</strong> where n is the total number of rolls.\n\nWhat is the <strong>expected payout</strong>?\n\nHint: This is a famous paradox. Enter your answer (integer or "inf" not accepted — compute the finite closed form for finite n).\n\nFor n capped at 20 rolls max, what is the expected payout in dollars? Round to nearest dollar.',
        unit: '$',
        answer: 21,
        tolerance: 1,
        steps: [
          { label: 'P(stop at roll n)', value: '(5/6)^(n-1) × (1/6)' },
          { label: 'Payout at roll n', value: '2ⁿ' },
          { label: 'EV (capped at 20)', value: 'Σ(n=1 to 20) (5/6)^(n-1)×(1/6)×2ⁿ ≈ $21' },
        ],
        explanation: 'Each term: (1/6)×(5/6)^(n-1)×2ⁿ = (1/6)(10/6)^(n-1)×2 → each term ≈ (5/3)^(n-1)/3. Sum of first 20 terms ≈ $21. The uncapped version diverges (St. Petersburg paradox).',
      },
      {
        id: 'qh3', type: 'numeric',
        title: 'Options Delta Hedging P&L',
        description: 'You hold a delta-neutral portfolio: <strong>long 100 call options</strong> (delta = 0.5 each), <strong>short 50 shares</strong>.\n\nThe stock moves from <strong>$100 to $105</strong> (a +5% move).\n\nApproximately, what is your P&L from this position in dollars? (Use delta approximation only — ignore gamma.)',
        unit: '$',
        answer: 0,
        tolerance: 5,
        steps: [
          { label: 'Call P&L', value: '100 options × 0.5 delta × $5 move = +$250' },
          { label: 'Stock P&L', value: '−50 shares × $5 move = −$250' },
          { label: 'Net P&L', value: '$250 − $250 = $0 (delta neutral)' },
        ],
        explanation: 'Delta-neutral means the portfolio is hedged against small moves. Long calls gain as stock rises, but short stock position loses by the same amount. Net P&L ≈ $0 (delta approximation). In reality, gamma creates positive convexity that generates small profit.',
      },
      {
        id: 'qh37', type: 'numeric',
        title: "Itô's Lemma: Drift of ln(S)",
        description: 'Under GBM: dS = μS dt + σS dW with μ = <strong>0.10</strong> and σ = <strong>0.30</strong>.\n\nWhat is the <strong>drift of ln(S)</strong> (the dt coefficient in d(ln S))?',
        unit: '',
        answer: 0.055,
        tolerance: 0.001,
        steps: [
          { label: "Itô's lemma: d(ln S) = (μ − σ²/2) dt + σ dW", value: '' },
          { label: 'Itô correction: σ²/2 = 0.09/2 = 0.045', value: '' },
          { label: 'Drift', value: '= 0.10 − 0.045 = 0.055' },
        ],
        explanation: "Itô's lemma for f=ln(S) gives drift = μ − σ²/2. The −σ²/2 is the Itô correction from the second-order term. Log-drift (0.055) < arithmetic drift (0.10).",
      },
      {
        id: 'qh38', type: 'numeric',
        title: 'Brownian Motion: E[W_t²]',
        description: 'Let W_t be a standard Brownian motion. What is <strong>E[W_t²]</strong> at time t = <strong>4</strong>?',
        unit: '',
        answer: 4,
        tolerance: 0,
        steps: [
          { label: 'W_t ~ N(0, t) for all t ≥ 0', value: '' },
          { label: 'E[W_t²] = Var(W_t) + (E[W_t])²', value: '= t + 0 = t' },
          { label: 'E[W_4²]', value: '= 4' },
        ],
        explanation: 'W_t ~ N(0,t), so E[W_t²] = Var(W_t) = t. At t=4: E[W_4²] = 4. Note that W_t² − t is a martingale.',
      },
      {
        id: 'qh39', type: 'numeric',
        title: 'GBM Variance at T=1',
        description: 'Under GBM with S₀ = <strong>$1</strong>, μ = <strong>0.08</strong>, σ = <strong>0.20</strong>, what is <strong>Var(S_T)</strong> at T = <strong>1</strong>?\n\nRound to 4 decimal places.',
        unit: '',
        answer: 0.0479,
        tolerance: 0.001,
        steps: [
          { label: 'Var(S_T) = S₀² × e^(2μT) × (e^(σ²T) − 1)', value: '' },
          { label: 'e^(2×0.08) × (e^(0.04) − 1)', value: '= 1.1735 × 0.04081 = 0.04789' },
          { label: 'Var(S₁)', value: '≈ 0.0479' },
        ],
        explanation: 'Var(S_T) = S₀²e^(2μT)(e^(σ²T)−1). With μ=0.08, σ=0.20, T=1: e^0.16≈1.1735; e^0.04−1≈0.04081. Var ≈ 0.0479.',
      },
      {
        id: 'qh40', type: 'numeric',
        title: 'Binomial Option Pricing: Call',
        description: 'Stock = <strong>$100</strong>, up to <strong>$120</strong> or down to <strong>$80</strong> in one year. Risk-free = <strong>5%</strong> (continuous). Price a European call with strike <strong>$105</strong>.',
        unit: '$',
        answer: 8.97,
        tolerance: 0.1,
        steps: [
          { label: 'q = (e^0.05 − 0.8)/(1.2−0.8)', value: '= (1.05127−0.8)/0.4 ≈ 0.6282' },
          { label: 'C_u = max(120−105,0)=15; C_d = max(80−105,0)=0', value: '' },
          { label: 'C = e^(−0.05) × (0.6282×15 + 0.3718×0)', value: '= 0.9512 × 9.423 ≈ $8.97' },
        ],
        explanation: 'Risk-neutral q = (e^r−d)/(u−d) ≈ 0.6282. Call price = e^(−0.05)×(0.6282×15) = 0.9512×9.423 ≈ $8.97.',
      },
      {
        id: 'qh41', type: 'numeric',
        title: "Itô's Lemma: Drift of S²",
        description: 'Let dS = 0.05S dt + 0.20S dW. What is the <strong>drift coefficient</strong> (the dt term divided by S²) of the process Y = S²?',
        unit: '',
        answer: 0.14,
        tolerance: 0.001,
        steps: [
          { label: "d(S²) = 2S dS + (dS)²", value: '' },
          { label: 'Drift: 2S(0.05S) + σ²S²', value: '= 0.10S² + 0.04S² = 0.14S²' },
          { label: 'Coefficient', value: '= 2μ + σ² = 0.10 + 0.04 = 0.14' },
        ],
        explanation: "d(S²) = (2μ+σ²)S² dt + 2σS² dW. Drift coefficient = 2(0.05)+0.04 = 0.14.",
      },
      {
        id: 'qh42', type: 'numeric',
        title: 'Covariance of BM at Two Times',
        description: 'Let W_t be standard Brownian motion. Compute <strong>Cov(W_3, W_7)</strong>.',
        unit: '',
        answer: 3,
        tolerance: 0,
        steps: [
          { label: 'BM covariance: Cov(W_s, W_t) = min(s, t)', value: '' },
          { label: 'Cov(W_3, W_7) = min(3, 7)', value: '= 3' },
        ],
        explanation: 'Cov(W_s, W_t) = min(s,t) for standard BM. This follows from independence of increments: W_t = W_s + (W_t−W_s), and Cov(W_s, W_t−W_s)=0.',
      },
      {
        id: 'qh43', type: 'numeric',
        title: 'Black-Scholes Delta',
        description: "A call option has d₁ = <strong>0.50</strong>. What is the option's <strong>delta</strong>?\n\nUse N(0.50) ≈ 0.6915.",
        unit: '',
        answer: 0.6915,
        tolerance: 0.0005,
        steps: [
          { label: 'Delta of call = N(d₁)', value: '' },
          { label: 'N(0.50)', value: '≈ 0.6915' },
          { label: 'Δ', value: '= 0.6915' },
        ],
        explanation: "Black-Scholes call delta = N(d₁) ≈ 0.6915. Delta = shares needed to hedge one option. Changes from ~0 (deep OTM) to ~1 (deep ITM).",
      },
      {
        id: 'qh44', type: 'numeric',
        title: 'Random Walk Absorption Time',
        description: 'A symmetric random walk on {0, 1, 2, 3} is absorbed at 0 and 3. Starting at state <strong>1</strong>, what is the expected time to absorption?',
        unit: 'steps',
        answer: 2,
        tolerance: 0,
        steps: [
          { label: 't_k = 1 + 0.5t_{k−1} + 0.5t_{k+1}; t_0=t_3=0', value: '' },
          { label: 'By symmetry t_1=t_2; t_1 = 1+0.5t_2', value: 'Substitute t_2=t_1: t_1=1+0.5t_1 → t_1=2' },
          { label: 'E[T|start=1]', value: '= 2 steps' },
        ],
        explanation: 'Setting up equations: t_1 = 1+0.5×0+0.5×t_2, t_2 = 1+0.5×t_1+0.5×0. By symmetry t_1=t_2, so t_1=1+0.5t_1 → t_1=2. Alternatively: E[T|k] = k(N−k) for N=3, k=1 → 1×2=2.',
      },
      {
        id: 'qh45', type: 'numeric',
        title: 'Variance of Linear Combination',
        description: 'X and Y: Var(X) = <strong>9</strong>, Var(Y) = <strong>16</strong>, Cov(X,Y) = <strong>4</strong>. Find <strong>Var(2X − 3Y)</strong>.',
        unit: '',
        answer: 132,
        tolerance: 0,
        steps: [
          { label: 'Var(aX+bY) = a²Var(X) + b²Var(Y) + 2ab·Cov(X,Y)', value: '' },
          { label: 'a=2, b=−3: 4×9 + 9×16 + 2(2)(−3)(4)', value: '= 36 + 144 − 48' },
          { label: 'Var(2X−3Y)', value: '= 132' },
        ],
        explanation: 'Var(2X−3Y) = 4Var(X)+9Var(Y)+2(2)(−3)Cov(X,Y) = 36+144−48 = 132.',
      },
      {
        id: 'qh46', type: 'numeric',
        title: 'Reflection Principle: BM Maximum',
        description: 'For standard BM, what is P(max_{0≤s≤1} W_s ≥ <strong>1.5</strong>)?\n\nUse 1−N(1.5) ≈ 0.0668.',
        unit: '',
        answer: 0.1336,
        tolerance: 0.001,
        steps: [
          { label: 'Reflection principle: P(max≥a) = 2P(W_T≥a) for a>0', value: '' },
          { label: 'P(W_1 ≥ 1.5) = 1−N(1.5)', value: '≈ 0.0668' },
          { label: 'P(max ≥ 1.5) = 2×0.0668', value: '= 0.1336' },
        ],
        explanation: 'The reflection principle: P(max_{0≤s≤T} W_s ≥ a) = 2P(W_T ≥ a). With T=1, a=1.5: 2×(1−N(1.5)) = 2×0.0668 = 0.1336.',
      },
      {
        id: 'qh47', type: 'numeric',
        title: 'MGF: Identify Variance',
        description: 'The MGF of X is M(t) = e^(2t + 8t²). What is <strong>Var(X)</strong>?',
        unit: '',
        answer: 16,
        tolerance: 0,
        steps: [
          { label: 'Normal MGF: M(t) = e^(μt + σ²t²/2)', value: '' },
          { label: 'Match: μ=2, σ²/2=8', value: 'So σ²=16' },
          { label: 'Var(X)', value: '= 16' },
        ],
        explanation: "Normal MGF is e^(μt+σ²t²/2). Matching e^(2t+8t²): μ=2, σ²/2=8 → σ²=16. So X ~ N(2,16).",
      },
      {
        id: 'qh48', type: 'numeric',
        title: "Markov's Inequality",
        description: 'X ≥ 0 with E[X] = <strong>5</strong>. What is the upper bound on P(X ≥ <strong>20</strong>) from Markov\'s inequality?',
        unit: '',
        answer: 0.25,
        tolerance: 0.001,
        steps: [
          { label: "Markov's: P(X≥a) ≤ E[X]/a", value: '' },
          { label: 'P(X≥20) ≤ 5/20', value: '= 1/4' },
          { label: 'Upper bound', value: '= 0.25' },
        ],
        explanation: "Markov's inequality: P(X≥a) ≤ E[X]/a = 5/20 = 0.25. This distribution-free bound holds for any non-negative X.",
      },
      {
        id: 'qh49', type: 'numeric',
        title: "Chebyshev's Inequality",
        description: 'X has mean <strong>50</strong> and variance <strong>25</strong>. Upper bound on P(|X − 50| ≥ <strong>15</strong>) from Chebyshev?',
        unit: '',
        answer: 0.1111,
        tolerance: 0.001,
        steps: [
          { label: "Chebyshev: P(|X−μ|≥k) ≤ Var(X)/k²", value: '' },
          { label: 'P(|X−50|≥15) ≤ 25/225', value: '= 1/9' },
          { label: 'Upper bound', value: '≈ 0.1111' },
        ],
        explanation: "Chebyshev: P(|X−μ|≥k) ≤ σ²/k² = 25/225 = 1/9 ≈ 11.11%.",
      },
      {
        id: 'qh50', type: 'numeric',
        title: 'GBM Log Return Std Dev',
        description: 'Stock follows GBM with μ = <strong>0.15</strong>, σ = <strong>0.25</strong>. Over T = <strong>4</strong> years, what is the <strong>standard deviation</strong> of the log return ln(S_T/S_0)?',
        unit: '',
        answer: 0.5,
        tolerance: 0.001,
        steps: [
          { label: 'ln(S_T/S_0) ~ N((μ−σ²/2)T, σ²T)', value: '' },
          { label: 'Std dev = σ√T = 0.25 × √4', value: '= 0.25 × 2' },
          { label: 'Std dev', value: '= 0.50' },
        ],
        explanation: 'Under GBM, log returns are N((μ−σ²/2)T, σ²T). Std dev = σ√T. With σ=0.25, T=4: 0.25×2 = 0.50.',
      },
      {
        id: 'qh51', type: 'numeric',
        title: 'Order Statistics: Expected Minimum',
        description: 'Draw <strong>4 observations</strong> from Uniform[0, 10]. What is the expected value of the <strong>minimum</strong>?',
        unit: '',
        answer: 2,
        tolerance: 0.01,
        steps: [
          { label: 'E[X_(1:n)] = a + (b−a)/(n+1) for Uniform[a,b]', value: '' },
          { label: 'n=4, Uniform[0,10]', value: 'E[min] = 0 + 10/(4+1)' },
          { label: 'E[min]', value: '= 10/5 = 2' },
        ],
        explanation: 'For n i.i.d. Uniform[a,b], E[minimum] = a+(b−a)/(n+1) = 10/5 = 2. The 5 expected segments divide [0,10] equally.',
      },
      {
        id: 'qh52', type: 'numeric',
        title: 'Delta-Gamma Approximation',
        description: 'An option has delta = <strong>0.60</strong> and gamma = <strong>0.04</strong>. The stock moves by <strong>$3</strong>. What is the approximate change in option value (delta-gamma approximation)?',
        unit: '$',
        answer: 1.98,
        tolerance: 0.01,
        steps: [
          { label: 'ΔC ≈ Δ×ΔS + (1/2)×Γ×(ΔS)²', value: '' },
          { label: '= 0.60×3 + 0.5×0.04×9', value: '= 1.80 + 0.18' },
          { label: 'ΔC', value: '≈ $1.98' },
        ],
        explanation: 'Delta-gamma approximation: ΔC ≈ Δ·ΔS + (1/2)Γ·(ΔS)² = 0.6(3) + 0.02(9) = 1.80 + 0.18 = $1.98.',
      },
      {
        id: 'qh53', type: 'numeric',
        title: 'Variance of a Product',
        description: 'X and Y are independent. E[X]=2, Var(X)=1, E[Y]=3, Var(Y)=4. What is <strong>Var(XY)</strong>?',
        unit: '',
        answer: 29,
        tolerance: 0,
        steps: [
          { label: 'Var(XY) = E[X²]E[Y²] − (E[X])²(E[Y])²', value: '' },
          { label: 'E[X²] = 1+4=5; E[Y²] = 4+9=13', value: '' },
          { label: 'Var(XY) = 5×13 − 4×9', value: '= 65 − 36 = 29' },
        ],
        explanation: 'For independent X,Y: E[X²Y²]=E[X²]E[Y²]=5×13=65; (E[XY])²=(2×3)²=36. Var(XY)=65−36=29.',
      },
      {
        id: 'qh54', type: 'numeric',
        title: 'Stopping Time: E[W_τ²]',
        description: 'Standard BM W_t is stopped at τ = inf{t : W_t = 3 or W_t = −2}. What is <strong>E[W_τ²]</strong>?\n\nHint: W_t² − t is a martingale.',
        unit: '',
        answer: 6,
        tolerance: 0.01,
        steps: [
          { label: "Gambler's ruin: P(hit +3) = 2/(2+3) = 2/5", value: '' },
          { label: 'E[W_τ²] = 9×(2/5) + 4×(3/5)', value: '= 18/5 + 12/5 = 30/5' },
          { label: 'E[W_τ²]', value: '= 6' },
        ],
        explanation: 'P(hit+3) = 2/5 (gambler\'s ruin starting 2 steps from −2, total span 5). E[W_τ²] = 3²×(2/5)+(−2)²×(3/5) = 18/5+12/5 = 6. Also E[τ]=6 since W_t²−t is a martingale.',
      },
      {
        id: 'qh55', type: 'numeric',
        title: 'MGF of Exponential Distribution',
        description: 'X ~ Exponential(λ=2). What is the MGF M(t) at t = <strong>1</strong>?',
        unit: '',
        answer: 2,
        tolerance: 0.001,
        steps: [
          { label: 'MGF of Exp(λ): M(t) = λ/(λ−t) for t < λ', value: '' },
          { label: 'M(1) = 2/(2−1)', value: '= 2/1 = 2' },
        ],
        explanation: 'M(t) = λ/(λ−t) for t<λ. At t=1, λ=2: M(1) = 2/1 = 2. The MGF diverges as t→λ, reflecting the exponential\'s heavy tail.',
      },
      {
        id: 'qh56', type: 'numeric',
        title: 'Digital Option Pricing',
        description: 'Stock = <strong>$50</strong>, up to <strong>$65</strong> or down to <strong>$40</strong>. Risk-free = <strong>0%</strong>. Price a digital call paying <strong>$1</strong> if S > $55, else $0.',
        unit: '$',
        answer: 0.4,
        tolerance: 0.005,
        steps: [
          { label: 'q = (S−dS)/(uS−dS) = (50−40)/(65−40)', value: '= 10/25 = 0.4' },
          { label: 'Payoff: $1 in up state (65>55), $0 in down state', value: '' },
          { label: 'Price = e^0 × (0.4×1 + 0.6×0)', value: '= $0.40' },
        ],
        explanation: 'With r=0, risk-neutral q=(50−40)/(65−40)=0.4. Digital pays $1 only in up state. Price = 0.4×1+0.6×0 = $0.40.',
      },
      {
        id: 'qh57', type: 'numeric',
        title: 'Quadratic Variation of BM',
        description: 'What is the quadratic variation [W, W]_t of standard Brownian motion over [0, <strong>5</strong>]?',
        unit: '',
        answer: 5,
        tolerance: 0,
        steps: [
          { label: '[W, W]_t = t (a.s.)', value: 'Fundamental property of BM' },
          { label: '[W, W]_5', value: '= 5' },
        ],
        explanation: 'BM has quadratic variation [W,W]_t = t a.s. This is why (dW)² = dt in Itô calculus. Unlike smooth functions (QV=0), BM is rough enough to have non-zero QV.',
      },
      {
        id: 'qh58', type: 'numeric',
        title: 'Black-Scholes Vega',
        description: 'Vega = S√T × φ(d₁). With S = <strong>$100</strong>, T = <strong>0.25</strong>, d₁ = <strong>0.20</strong>.\n\nUse φ(0.20) ≈ 0.3910. What is vega?',
        unit: '$',
        answer: 19.55,
        tolerance: 0.05,
        steps: [
          { label: 'ν = S × √T × φ(d₁)', value: '' },
          { label: '√T = √0.25 = 0.5', value: '' },
          { label: 'ν = 100 × 0.5 × 0.3910', value: '= $19.55' },
        ],
        explanation: 'Vega = S√T·φ(d₁) = 100×0.5×0.391 = $19.55. A 1% vol increase (Δσ=0.01) raises the call by ~$0.1955.',
      },
      {
        id: 'qh59', type: 'numeric',
        title: 'Brownian Bridge Expectation',
        description: 'Standard BM with W_0=0, W_4 = <strong>2</strong>. What is <strong>E[W_1 | W_4=2]</strong>?',
        unit: '',
        answer: 0.5,
        tolerance: 0.01,
        steps: [
          { label: 'Brownian bridge: E[W_t | W_T=b] = (t/T)×b', value: '' },
          { label: 't=1, T=4, b=2', value: 'E[W_1 | W_4=2] = (1/4)×2' },
          { label: 'E[W_1 | W_4=2]', value: '= 0.5' },
        ],
        explanation: 'For a Brownian bridge (BM conditioned on endpoint): E[W_t|W_T=b] = (t/T)b. At t=1, T=4, b=2: E = 0.5.',
      },
      {
        id: 'qh60', type: 'numeric',
        title: "Jensen's Inequality: E[X²] Bound",
        description: 'X is a random variable with <strong>E[X] = 4</strong>. What is the lower bound on <strong>E[X²]</strong> from Jensen\'s inequality?',
        unit: '',
        answer: 16,
        tolerance: 0,
        steps: [
          { label: "Jensen's (convex f): E[f(X)] ≥ f(E[X])", value: '' },
          { label: 'f(x) = x² is convex', value: 'E[X²] ≥ (E[X])²' },
          { label: 'Lower bound', value: '= 4² = 16' },
        ],
        explanation: "Jensen's: E[X²] ≥ (E[X])² = 16. The gap is Var(X) ≥ 0.",
      },
      {
        id: 'qh61', type: 'numeric',
        title: 'Itô Integral Expectation',
        description: 'For standard BM W_t, what is <strong>E[∫₀ᵀ W_t dW_t]</strong>?',
        unit: '',
        answer: 0,
        tolerance: 0,
        steps: [
          { label: 'Itô integrals are martingales starting at 0', value: '' },
          { label: 'E[∫₀ᵀ W_t dW_t]', value: '= 0' },
        ],
        explanation: 'Itô integral ∫φ dW is a martingale → expectation 0. Alternatively: ∫₀ᵀ W_t dW_t = (W_T²−T)/2, so E = (T−T)/2 = 0.',
      },
      {
        id: 'qh62', type: 'numeric',
        title: 'Antithetic Variates Variance Reduction',
        description: "X has Var(X) = <strong>100</strong>. Its antithetic twin X' has Corr(X, X') = <strong>−0.6</strong> and Var(X') = 100. What is <strong>Var((X + X')/2)</strong>?",
        unit: '',
        answer: 20,
        tolerance: 0.01,
        steps: [
          { label: "Var((X+X')/2) = (1/4)(Var(X)+Var(X')+2Cov(X,X'))", value: '' },
          { label: 'Cov = ρ×σ×σ = −0.6×100 = −60', value: '' },
          { label: '(1/4)(100+100−120)', value: '= 80/4 = 20' },
        ],
        explanation: 'Antithetic variates reduce variance via negative correlation. Var = (100+100+2(−60))/4 = 80/4 = 20. Reduction factor of 5×.',
      },
      {
        id: 'qh63', type: 'numeric',
        title: 'Log Return Variance Under GBM',
        description: 'Under GBM with σ = <strong>0.20</strong>, what is the <strong>variance</strong> of ln(S_T/S_t) over an interval of length <strong>0.25</strong> years?',
        unit: '',
        answer: 0.01,
        tolerance: 0.0001,
        steps: [
          { label: 'Var(ln S_T − ln S_t) = σ²×(T−t)', value: '' },
          { label: '= (0.20)² × 0.25', value: '= 0.04 × 0.25' },
          { label: 'Variance', value: '= 0.01' },
        ],
        explanation: 'Under GBM, log returns ~ N((μ−σ²/2)Δt, σ²Δt). Variance = σ²Δt = 0.04×0.25 = 0.01. Std dev = 0.10 = 10%.',
      },
      {
        id: 'qh64', type: 'numeric',
        title: 'Two-Period Binomial Put',
        description: 'Stock = <strong>$100</strong>, u = <strong>1.1</strong>, d = <strong>0.9</strong>, r = <strong>2%</strong> per period (continuous). Price a European put with strike <strong>$100</strong> over <strong>2 periods</strong>.',
        unit: '$',
        answer: 3.37,
        tolerance: 0.15,
        steps: [
          { label: 'q = (e^0.02−0.9)/(1.1−0.9) = (1.0202−0.9)/0.2', value: '≈ 0.601' },
          { label: 'Payoffs: P_uu=0, P_ud=1, P_dd=19', value: '' },
          { label: 'P = e^(−0.04)[2(0.601)(0.399)×1+(0.399)²×19]', value: '≈ 0.9608×3.506 ≈ $3.37' },
        ],
        explanation: 'q≈0.601, 1−q≈0.399. P = e^(−2×0.02)[2q(1−q)×1+(1−q)²×19] = e^(−0.04)[0.480+3.027] ≈ 0.9608×3.507 ≈ $3.37.',
      },
      {
        id: 'qh65', type: 'numeric',
        title: 'Variance of Sum of Correlated Variables',
        description: 'X and Y with Var(X)=Var(Y)=<strong>100</strong> and Cov(X,Y)=<strong>30</strong>. What is <strong>Var(X+Y)</strong>?',
        unit: '',
        answer: 260,
        tolerance: 0,
        steps: [
          { label: 'Var(X+Y) = Var(X)+Var(Y)+2Cov(X,Y)', value: '' },
          { label: '= 100+100+2(30)', value: '= 200+60' },
          { label: 'Var(X+Y)', value: '= 260' },
        ],
        explanation: 'Var(X+Y) = Var(X)+Var(Y)+2Cov(X,Y) = 100+100+60 = 260. Without correlation: Var = 200. Positive correlation increases portfolio variance.',
      },
    ],
  },

  ib: {
    easy: [
      {
        id: 'ibe1', type: 'numeric',
        title: 'Equity Value Bridge',
        description: 'A company has:\n• EBITDA of <strong>$100M</strong>\n• Trades at <strong>8.0x EV/EBITDA</strong>\n• <strong>$300M</strong> in total debt\n• <strong>$50M</strong> in cash\n\nWhat is the <strong>equity value</strong> in millions of dollars?',
        unit: '$M',
        answer: 550,
        tolerance: 1,
        steps: [
          { label: 'Enterprise Value', value: '$100M × 8.0x = $800M' },
          { label: 'Net Debt', value: '$300M debt − $50M cash = $250M' },
          { label: 'Equity Value', value: 'EV − Net Debt = $800M − $250M = $550M' },
        ],
        explanation: 'Equity Value = EV − Net Debt. EV = EBITDA × multiple = $800M. Net Debt = Debt − Cash = $250M. Equity Value = $550M.',
      },
      {
        id: 'ibe2', type: 'numeric',
        title: 'Year 1 Interest Expense',
        description: 'A private equity firm acquires a company for <strong>$500M enterprise value</strong>.\n\nThe deal is financed with <strong>60% debt</strong> at an interest rate of <strong>8%</strong>.\n\nWhat is the Year 1 interest expense in millions of dollars?',
        unit: '$M',
        answer: 24,
        tolerance: 0.1,
        steps: [
          { label: 'Debt amount', value: '60% × $500M = $300M' },
          { label: 'Interest expense', value: '$300M × 8% = $24M' },
        ],
        explanation: 'Debt = 60% × $500M = $300M. Interest = $300M × 8% = $24M per year.',
      },
      {
        id: 'ibe3', type: 'numeric',
        title: 'Operating Cash Flow',
        description: 'A company reports:\n• Net Income: <strong>$80M</strong>\n• Depreciation & Amortization: <strong>$20M</strong>\n• Increase in Working Capital: <strong>$10M</strong>\n• Capital Expenditures: <strong>$15M</strong>\n\nWhat is <strong>Free Cash Flow</strong> in millions of dollars?',
        unit: '$M',
        answer: 75,
        tolerance: 0.5,
        steps: [
          { label: 'Start with Net Income', value: '$80M' },
          { label: '+ D&A (non-cash)', value: '+$20M' },
          { label: '− Increase in Working Capital', value: '−$10M (cash used)' },
          { label: '− Capex', value: '−$15M' },
          { label: 'Free Cash Flow', value: '$80M + $20M − $10M − $15M = $75M' },
        ],
        explanation: 'FCF = Net Income + D&A − ΔWorking Capital − Capex. D&A is added back (non-cash charge). Working capital increase uses cash. Capex is an investment outflow.',
      },
    ],
    medium: [
      {
        id: 'ibm1', type: 'numeric',
        title: 'WACC Calculation',
        description: 'Calculate the Weighted Average Cost of Capital (WACC):\n\n• Capital structure: <strong>40% equity</strong>, <strong>60% debt</strong>\n• Cost of equity: <strong>12%</strong>\n• Pre-tax cost of debt: <strong>6%</strong>\n• Tax rate: <strong>30%</strong>\n\nEnter WACC as a percentage (e.g. <code>8.52</code>).',
        unit: '%',
        answer: 7.32,
        tolerance: 0.05,
        steps: [
          { label: 'Cost of Equity component', value: '40% × 12% = 4.80%' },
          { label: 'After-tax Cost of Debt', value: '6% × (1 − 30%) = 4.20%' },
          { label: 'Debt component', value: '60% × 4.20% = 2.52%' },
          { label: 'WACC', value: '4.80% + 2.52% = 7.32%' },
        ],
        explanation: 'WACC = Ke×(E/V) + Kd×(1−t)×(D/V). Debt has a tax shield because interest is deductible. The after-tax cost of debt = 6%×(1−0.30) = 4.2%. WACC = 0.40×12% + 0.60×4.2% = 7.32%.',
      },
      {
        id: 'ibm2', type: 'numeric',
        title: 'Cash Conversion Cycle',
        description: 'Calculate the Cash Conversion Cycle (CCC):\n\n• Days Sales Outstanding (DSO): <strong>45 days</strong>\n• Days Inventory Outstanding (DIO): <strong>60 days</strong>\n• Days Payable Outstanding (DPO): <strong>30 days</strong>\n\nWhat is the CCC in days?',
        unit: 'days',
        answer: 75,
        tolerance: 0,
        steps: [
          { label: 'Formula', value: 'CCC = DSO + DIO − DPO' },
          { label: 'Substitute', value: '45 + 60 − 30 = 75 days' },
        ],
        explanation: 'CCC = DSO + DIO − DPO = 45 + 60 − 30 = 75 days. This means the company has cash tied up in operations for 75 days. Lower CCC = more efficient working capital management.',
      },
      {
        id: 'ibm3', type: 'numeric',
        title: 'LBO Equity Return (MOIC)',
        description: 'A PE firm:\n• Buys a company for <strong>$1,000M</strong> EV at entry\n• Uses <strong>60% debt</strong> ($600M), <strong>40% equity</strong> ($400M)\n• Grows EBITDA from $100M to <strong>$150M</strong> over 5 years\n• Exits at the same <strong>10x EV/EBITDA</strong> multiple\n• Assume all debt is repaid by exit\n\nWhat is the <strong>Money-on-Money Multiple (MOIC)</strong>? Enter to 2 decimal places.',
        unit: 'x',
        answer: 3.75,
        tolerance: 0.05,
        steps: [
          { label: 'Exit EV', value: '$150M × 10x = $1,500M' },
          { label: 'Exit Equity (debt repaid)', value: '$1,500M − $0 = $1,500M' },
          { label: 'MOIC', value: '$1,500M ÷ $400M = 3.75x' },
        ],
        explanation: 'Exit EV = $150M × 10x = $1,500M. With all debt repaid, exit equity = $1,500M. MOIC = $1,500M / $400M entry equity = 3.75x. This drives ~30% IRR over 5 years.',
      },
    ],
    hard: [
      {
        id: 'ibh1', type: 'numeric',
        title: 'DCF Terminal Value',
        description: 'You are building a DCF model:\n• Year 5 Free Cash Flow: <strong>$50M</strong>\n• Terminal growth rate: <strong>3%</strong>\n• WACC: <strong>9%</strong>\n\nUsing the <strong>Gordon Growth Model</strong>, what is the terminal value (at end of Year 5) in millions of dollars?\n\nRound to 1 decimal place.',
        unit: '$M',
        answer: 858.3,
        tolerance: 1,
        steps: [
          { label: 'Formula', value: 'TV = FCF₅ × (1+g) / (WACC − g)' },
          { label: 'Numerator', value: '$50M × 1.03 = $51.5M' },
          { label: 'Denominator', value: '9% − 3% = 6%' },
          { label: 'Terminal Value', value: '$51.5M / 0.06 = $858.3M' },
        ],
        explanation: 'TV = FCF₅ × (1+g) / (WACC−g) = $50M × 1.03 / 0.06 = $51.5M / 0.06 = $858.3M. TV typically represents 60–80% of DCF value — the terminal growth rate assumption is therefore critical.',
      },
      {
        id: 'ibh2', type: 'numeric',
        title: 'Levered Beta',
        description: 'Re-lever a comparable company\'s beta to your target:\n\n• Unlevered beta (βᵤ) of comparable: <strong>0.90</strong>\n• Your target company: D/E ratio = <strong>0.75</strong>, tax rate = <strong>25%</strong>\n\nWhat is the <strong>levered beta (βₗ)</strong>? Round to 2 decimal places.',
        unit: '',
        answer: 1.41,
        tolerance: 0.02,
        steps: [
          { label: 'Formula', value: 'βₗ = βᵤ × [1 + (1−t) × D/E]' },
          { label: 'Substitute', value: 'βₗ = 0.90 × [1 + (1−0.25) × 0.75]' },
          { label: 'Bracket', value: '[1 + 0.75 × 0.75] = [1 + 0.5625] = 1.5625' },
          { label: 'βₗ', value: '0.90 × 1.5625 = 1.41' },
        ],
        explanation: 'Hamada equation: βₗ = βᵤ × [1 + (1−t) × D/E]. Leverage amplifies equity risk. An unlevered beta of 0.90 becomes 1.41 with 75% debt-to-equity — more financial risk means more equity volatility relative to the market.',
      },
      {
        id: 'ibh3', type: 'numeric',
        title: 'Accretion/Dilution: EPS Impact',
        description: 'Acquirer details:\n• Net Income: <strong>$200M</strong>, shares outstanding: <strong>100M</strong>\n• Acquirer EPS: $2.00, stock price: $40 (P/E = 20x)\n\nTarget details:\n• Purchase price: <strong>$500M</strong>, all-stock deal\n• Target Net Income: <strong>$30M</strong>\n• Assume no synergies\n\nWhat is the acquirer\'s <strong>new EPS</strong> post-acquisition? Round to 2 decimal places.',
        unit: '$',
        answer: 2.04,
        tolerance: 0.02,
        steps: [
          { label: 'New shares issued', value: '$500M ÷ $40/share = 12.5M shares' },
          { label: 'Total shares post-deal', value: '100M + 12.5M = 112.5M shares' },
          { label: 'Combined Net Income', value: '$200M + $30M = $230M' },
          { label: 'New EPS', value: '$230M ÷ 112.5M ≈ $2.04' },
        ],
        explanation: 'New shares = $500M / $40 = 12.5M. Total = 112.5M. Combined NI = $230M. New EPS = $230/112.5 ≈ $2.04. The deal is accretive (+$0.04/share) because the acquirer P/E (20x) exceeds the implied acquisition P/E ($500M / $30M NI ≈ 16.7x). Accretion occurs when acquirer P/E > deal P/E.',
      },
    ],
  },
};

function getRandomQuestion(category, difficulty) {
  const pool = QUESTIONS[category]?.[difficulty];
  if (!pool?.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getRandomQuestions(category, difficulty, n) {
  const pool = (QUESTIONS[category]?.[difficulty] || []).slice();
  const result = [];
  while (result.length < n && pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(i, 1)[0]);
  }
  return result;
}

module.exports = { QUESTIONS, getRandomQuestion, getRandomQuestions };
