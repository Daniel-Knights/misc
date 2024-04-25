import fs from "fs";

function getMatchingPrefix(str1: string, str2: string) {
  if (str1 === str2) return str1;

  let sliceIndex = 0;

  for (let i = 0; i < str1.length; i += 1) {
    if (str1[i] !== str2[i]) break;

    sliceIndex = i + 1;
  }

  return str1.slice(0, sliceIndex);
}

class RadixTreeNode {
  children = new Map<string, RadixTreeNode>();

  get isEnd() {
    return this.children.size === 0;
  }

  constructor(children?: Map<string, RadixTreeNode>) {
    if (children) {
      this.children = children;
    }
  }

  addChild(value: string, node: RadixTreeNode) {
    if (!value) return;

    this.children.set(value, node);
  }

  clone() {
    return new RadixTreeNode(new Map([...this.children]));
  }

  toObject(): object {
    const childEntries = [...this.children.entries()].map(([key, nd]) => {
      return [key, nd.toObject()];
    });

    return Object.fromEntries(childEntries);
  }
}

class RadixTree {
  root = new RadixTreeNode();

  constructor(words: string[]) {
    this.insert(words);
  }

  #insert(word: string, curr = this.root.children) {
    if (word === "" || curr.get(word)) return;

    if (curr.size === 0) {
      curr.set(word, new RadixTreeNode());

      return;
    }

    for (const [key, nd] of curr.entries()) {
      const matchingPrefix = getMatchingPrefix(key, word);
      if (matchingPrefix.length === 0) continue; // Not a match

      if (key === matchingPrefix) {
        // Add `word` tail as child node
        this.#insert(word.replace(matchingPrefix, ""), nd.children);

        return;
      }

      if (key.length > matchingPrefix.length) {
        // Create new node for `matchingPrefix` and set `key` and `word` tails as children
        const newNode = new RadixTreeNode();

        newNode.addChild(key.replace(matchingPrefix, ""), nd.clone());
        newNode.addChild(word.replace(matchingPrefix, ""), new RadixTreeNode());

        curr.set(matchingPrefix, newNode);
        curr.delete(key);

        return;
      }
    }

    // No match - set word as new child of current node
    curr.set(word, new RadixTreeNode());
  }

  insert(words: string[]) {
    words.forEach((word) => {
      this.#insert(word);
    });
  }

  #findNode(
    word: string,
    curr = this.root.children
  ): [string, RadixTreeNode] | undefined {
    if (curr.has(word)) return [word, curr.get(word)!];

    for (const [key, nd] of curr.entries()) {
      const matchingPrefix = getMatchingPrefix(key, word);
      if (matchingPrefix.length === 0) continue;

      if (matchingPrefix.length >= word.length) {
        return [key, nd];
      }

      if (matchingPrefix.length < word.length) {
        return this.#findNode(word.replace(matchingPrefix, ""), nd.children);
      }
    }

    return;
  }

  findNode(word: string) {
    return this.#findNode(word);
  }

  #deleteNode(word: string, curr = this.root.children): boolean {
    function del(foundNode: RadixTreeNode) {
      if (foundNode.isEnd) {
        return curr.delete(word);
      } else if (foundNode.children.size === 1) {
        const [childKey, childNode] = [...foundNode.children.entries()][0]!;

        const newKey = word + childKey;

        curr.delete(word);
        curr.set(newKey, childNode);

        return true;
      } else {
        return false;
      }
    }

    if (curr.has(word)) {
      return del(curr.get(word)!);
    }

    for (const [key, nd] of curr.entries()) {
      const matchingPrefix = getMatchingPrefix(key, word);
      if (matchingPrefix.length === 0) continue;

      if (matchingPrefix.length === word.length) {
        return del(nd);
      }

      if (matchingPrefix.length < word.length) {
        return this.#deleteNode(word.replace(matchingPrefix, ""), nd.children);
      }
    }

    return false;
  }

  deleteNode(word: string) {
    return this.#deleteNode(word);
  }

  toString() {
    return JSON.stringify(this.root.toObject(), null, 2);
  }
}

// Usage

const tree = new RadixTree([
  "apple",
  "app",
  "app",
  "ap",
  "ap",
  "banana",
  "band",
  "bandana",
  "ban",
  "b",
  "c",
  "d",
  "",
]);

tree.insert(["call", "all"]);
tree.insert(["allele"]);
tree.deleteNode("alle");

// Output

// console.log(tree);

// console.log(tree.findNode("b"));

[...tree.root.children.entries()].forEach(([word, nd]) => {
  console.log(word);
  console.log(nd);
});

fs.writeFileSync("out/radix-tree.json", tree.toString());
