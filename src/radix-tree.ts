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
}

class RadixTree {
  root = new Map<string, RadixTreeNode>();

  constructor(...words: string[]) {
    this.insert(...words);
  }

  #insert(word: string, curr = this.root) {
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
        this.#insert(word.replace(matchingPrefix, ""), curr.get(key)?.children);

        return;
      }

      if (key.length > matchingPrefix.length) {
        // Split `key` tail and set as child node of prefix
        const newNode = new RadixTreeNode();

        newNode.addChild(key.replace(matchingPrefix, ""), nd.clone());
        newNode.addChild(word.replace(matchingPrefix, ""), nd.clone());

        curr.set(matchingPrefix, newNode);
        curr.delete(key);

        return;
      }
    }

    // No match - set word as new child of current node
    curr.set(word, new RadixTreeNode());
  }

  insert(...words: string[]) {
    words.forEach((word) => {
      this.#insert(word);
    });
  }
}

// Usage

const tree = new RadixTree(
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
  ""
);

tree.insert("call", "all");

[...tree.root.entries()].forEach(([word, nd]) => {
  console.log(word);
  console.log(nd);
});
