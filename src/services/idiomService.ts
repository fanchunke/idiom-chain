import unpack from "mini-program-unpack";
interface Idiom {
  derivation: string;
  explanation: string;
  pinyin: string;
  word: string;
  first: string;
  last: string;
}

class IdiomService {
  private idioms: Idiom[] = [];
  private idiomMap: Map<string, Idiom> = new Map();
  private lastCharMap: Map<string, Idiom[]> = new Map();
  private lastPinyinCharMap: Map<string, Idiom[]> = new Map();

  async initialize(brFilePath: string): Promise<void> {
    try {
      unpack(brFilePath)
        .then((pkg) => {
          const text = pkg.read("idioms.csv");
          this.parseCSV(text as string);
          this.buildMaps();
        })
        .catch((err) => {
          console.log(`unpack error: ${err}`);
          throw err;
        });
    } catch (error) {
      console.error("Failed to initialize IdiomService:", error);
      throw error;
    }
  }

  private parseCSV(csvData: string): void {
    const lines = csvData.split("\n");
    const headers = lines[0].split(",");

    this.idioms = lines.slice(1).map((line) => {
      const values = line.split(",");
      const idiom: Idiom = {
        derivation: values[0] || "",
        explanation: values[1] || "",
        pinyin: values[2] || "",
        word: values[3] || "",
        first: values[4] || "",
        last: values[5] || "",
      };
      return idiom;
    });
    console.log("idioms: ", this.idioms.length);
  }

  private buildMaps(): void {
    this.idioms.forEach((idiom) => {
      this.idiomMap.set(idiom.word, idiom);

      const firstChar = idiom.word.length > 0 ? idiom.word[0] : "";
      if (!this.lastCharMap.has(firstChar)) {
        this.lastCharMap.set(firstChar, []);
      }
      this.lastCharMap.get(firstChar)!.push(idiom);

      if (!this.lastPinyinCharMap.has(idiom.first)) {
        this.lastPinyinCharMap.set(idiom.first, []);
      }
      this.lastPinyinCharMap.get(idiom.first)!.push(idiom);
    });
  }

  getIdiom(word: string): Idiom | undefined {
    return this.idiomMap.get(word);
  }

  /**
   * 获取可接龙成语
   * @param lastChar - 查询的最后一个字符
   * @param limit - 返回的最大成语数量
   * @param excludes - 排除的成语列表
   * @returns 满足条件的成语数组
   */
  getNextIdioms(
    idiom: Idiom,
    limit: number = 10,
    excludes: string[] = []
  ): Idiom[] {
    console.log({
      idiom: idiom,
      limit: limit,
    });
    const seen = new Set(excludes); // 用于排除已存在的成语
    const getFilteredIdioms = (source: Idiom[]) =>
      source.filter((idiom) => !seen.has(idiom.word)).slice(0, limit);

    // 先从第一个 Map 获取成语
    const primaryList = this.lastCharMap.get(idiom.word.slice(-1)) || [];
    const primaryResult = getFilteredIdioms(primaryList);

    // 如果数量足够，直接返回
    if (primaryResult.length >= limit) {
      return primaryResult;
    }

    // 如果不足，从第二个 Map 补充
    const secondaryList = this.lastPinyinCharMap.get(idiom.last) || [];
    const secondaryResult = getFilteredIdioms(secondaryList).slice(
      0,
      limit - primaryResult.length
    );

    // 合并结果
    return [...primaryResult, ...secondaryResult];
  }

  getSuggestions(prefix: string, limit: number = 10): Idiom[] {
    const suggestions = this.idioms
      .filter((idiom) => idiom.word.includes(prefix))
      .slice(0, limit);
    return suggestions;
  }
}

export const idiomService = new IdiomService();
