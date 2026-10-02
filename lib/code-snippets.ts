export const CODE_SNIPPETS: { language: string; code: string }[] = [
  {
    language: "TypeScript / React",
    code: "const [state, setState] = useState<number>(0);\nconst handleClick = () => setState(prev => prev + 1);",
  },
  {
    language: "JavaScript Async",
    code: "async function fetchData(url) {\n  const res = await fetch(url);\n  const data = await res.json();\n  return data;\n}",
  },
  {
    language: "Python Data Structure",
    code: "def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1",
  },
  {
    language: "CSS Flexbox & Grid",
    code: ".container {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  border-radius: 8px;\n}",
  },
  {
    language: "HTML5 Semantic",
    code: "<header className=\"flex items-center justify-between p-4\">\n  <h1 className=\"text-2xl font-bold\">Keynote Pro</h1>\n</header>",
  },
];

export function getRandomCodeSnippet(): { language: string; words: string[] } {
  const item = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
  // split by whitespace while preserving code symbols
  const words = item.code.replace(/\n/g, " ").split(/\s+/).filter(Boolean);
  return { language: item.language, words };
}
