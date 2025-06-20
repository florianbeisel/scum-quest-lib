interface LootNode {
  Name: string;
  Rarity: string;
  Children?: LootNode[];
}

interface LootTree {
  Name: string;
  Rarity: string;
  Children: LootNode[];
}

class ItemParser {
  /**
   * Extracts all innermost item names from a loot tree structure
   * @param data The parsed JSON data
   * @returns Array of item names from leaf nodes
   */
  static parseItemNames(data: LootTree): string[] {
    const itemNames: string[] = [];

    function traverse(node: LootNode): void {
      // If the node has no children or empty children array, it's a leaf node
      if (!node.Children || node.Children.length === 0) {
        itemNames.push(node.Name);
        return;
      }

      // If it has children, recursively traverse them
      for (const child of node.Children) {
        traverse(child);
      }
    }

    // Start traversal from the root's children
    for (const child of data.Children) {
      traverse(child);
    }

    return itemNames;
  }

  /**
   * Parses item names from a JSON string
   * @param jsonString The JSON string to parse
   * @returns Array of item names
   */
  static parseFromString(jsonString: string): string[] {
    try {
      const data: LootTree = JSON.parse(jsonString);
      return this.parseItemNames(data);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return [];
    }
  }

  /**
   * Parses item names from a file
   * @param filePath Path to the JSON file
   * @returns Promise<string[]> Array of item names
   */
  static async parseFromFile(filePath: string): Promise<string[]> {
    try {
      const fs = await import('fs/promises');
      const fileContent = await fs.readFile(filePath, 'utf-8');
      return this.parseFromString(fileContent);
    } catch (error) {
      console.error('Error reading file:', error);
      return [];
    }
  }

  /**
   * Groups items by their rarity
   * @param data The parsed JSON data
   * @returns Object with rarity as key and item names as values
   */
  static parseItemsByRarity(data: LootTree): Record<string, string[]> {
    const itemsByRarity: Record<string, string[]> = {};

    function traverse(node: LootNode): void {
      // If the node has no children or empty children array, it's a leaf node
      if (!node.Children || node.Children.length === 0) {
        if (!itemsByRarity[node.Rarity]) {
          itemsByRarity[node.Rarity] = [];
        }
        itemsByRarity[node.Rarity].push(node.Name);
        return;
      }

      // If it has children, recursively traverse them
      for (const child of node.Children) {
        traverse(child);
      }
    }

    // Start traversal from the root's children
    for (const child of data.Children) {
      traverse(child);
    }

    return itemsByRarity;
  }
}

// Example usage:
const exampleJson = `{
  "Name": "ItemLootTreeNodes",
  "Rarity": "Uncommon",
  "Children": [
    {
      "Name": "Airfield",
      "Rarity": "Uncommon",
      "Children": [
        {
          "Name": "Clothes",
          "Rarity": "Uncommon",
          "Children": [
            {
              "Name": "Feet",
              "Rarity": "Uncommon",
              "Children": [
                {
                  "Name": "CombatBoots",
                  "Rarity": "Rare"
                },
                {
                  "Name": "MilitaryBoots_JNA",
                  "Rarity": "VeryRare"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}`;

// Demo the parser
console.log('--- Item Names ---');
const itemNames = ItemParser.parseFromString(exampleJson);
console.log(itemNames);

console.log('\n--- Items by Rarity ---');
const itemsByRarity = ItemParser.parseItemsByRarity(JSON.parse(exampleJson));
console.log(itemsByRarity);

class DirectoryItemParser {
  /**
   * Processes all JSON files in a directory and extracts items
   * @param directoryPath Path to the directory containing JSON files
   * @param recursive Whether to search subdirectories recursively
   * @returns Promise<DirectoryParseResult>
   */
  static async parseDirectory(
    directoryPath: string,
    recursive: boolean = false
  ): Promise<DirectoryParseResult> {
    const fs = await import('fs/promises');
    const path = await import('path');

    const result: DirectoryParseResult = {
      files: [],
      allItems: [],
      itemsByFile: {},
      itemsByRarity: {},
      summary: {
        totalFiles: 0,
        totalItems: 0,
        filesWithErrors: [],
      },
    };

    try {
      const files = await this.getJsonFiles(directoryPath, recursive);
      result.summary.totalFiles = files.length;

      for (const filePath of files) {
        try {
          const items = await ItemParser.parseFromFile(filePath);
          const fileName = path.basename(filePath);

          result.files.push(fileName);
          result.itemsByFile[fileName] = items;
          result.allItems.push(...items);

          // Parse with rarity info for this file
          const fileContent = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(fileContent);
          const rarityGroups = ItemParser.parseItemsByRarity(data);

          // Merge rarity groups
          for (const [rarity, itemNames] of Object.entries(rarityGroups)) {
            if (!result.itemsByRarity[rarity]) {
              result.itemsByRarity[rarity] = [];
            }
            result.itemsByRarity[rarity].push(...itemNames);
          }
        } catch (error) {
          result.summary.filesWithErrors.push({
            file: path.basename(filePath),
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Remove duplicates from allItems and rarity groups
      result.allItems = [...new Set(result.allItems)];
      for (const rarity in result.itemsByRarity) {
        result.itemsByRarity[rarity] = [
          ...new Set(result.itemsByRarity[rarity]),
        ];
      }

      result.summary.totalItems = result.allItems.length;
    } catch (error) {
      console.error('Error processing directory:', error);
    }

    return result;
  }

  /**
   * Recursively finds all JSON files in a directory
   */
  private static async getJsonFiles(
    dirPath: string,
    recursive: boolean
  ): Promise<string[]> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const jsonFiles: string[] = [];

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory() && recursive) {
          const subFiles = await this.getJsonFiles(fullPath, recursive);
          jsonFiles.push(...subFiles);
        } else if (
          entry.isFile() &&
          entry.name.toLowerCase().endsWith('.json')
        ) {
          jsonFiles.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error);
    }

    return jsonFiles;
  }

  /**
   * Exports all items to various formats
   */
  static async exportItems(
    directoryPath: string,
    outputPath: string,
    options: ExportOptions = {}
  ): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');

    const {
      format = 'json',
      recursive = false,
      includeRarity = true,
      includeFileInfo = true,
      sortAlphabetically = true,
    } = options;

    console.log(`🔍 Scanning directory: ${directoryPath}`);
    const result = await this.parseDirectory(directoryPath, recursive);

    console.log(
      `📊 Found ${result.summary.totalItems} unique items across ${result.summary.totalFiles} files`
    );

    if (result.summary.filesWithErrors.length > 0) {
      console.log(
        `⚠️  Errors in ${result.summary.filesWithErrors.length} files:`
      );
      result.summary.filesWithErrors.forEach(err =>
        console.log(`   - ${err.file}: ${err.error}`)
      );
    }

    // Sort items if requested
    if (sortAlphabetically) {
      result.allItems.sort();
      for (const rarity in result.itemsByRarity) {
        result.itemsByRarity[rarity].sort();
      }
    }

    // Prepare export data
    const exportData: ExportData = {
      timestamp: new Date().toISOString(),
      summary: result.summary,
      items: result.allItems,
    };

    if (includeRarity) {
      exportData.itemsByRarity = result.itemsByRarity;
    }

    if (includeFileInfo) {
      exportData.itemsByFile = result.itemsByFile;
      exportData.files = result.files;
    }

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Export in requested format
    switch (format.toLowerCase()) {
      case 'json':
        await fs.writeFile(outputPath, JSON.stringify(exportData, null, 2));
        break;

      case 'txt': {
        const txtContent = this.formatAsText(exportData);
        await fs.writeFile(outputPath, txtContent);
        break;
      }

      case 'csv': {
        const csvContent = this.formatAsCSV(result);
        await fs.writeFile(outputPath, csvContent);
        break;
      }

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    console.log(`✅ Exported to: ${outputPath}`);
  }

  private static formatAsText(data: ExportData): string {
    let content = `Item Export Report\n`;
    content += `Generated: ${data.timestamp}\n`;
    content += `Total Items: ${data.summary.totalItems}\n`;
    content += `Total Files: ${data.summary.totalFiles}\n\n`;

    content += `ALL ITEMS (${data.items.length})\n`;
    content += `${'='.repeat(50)}\n`;
    data.items.forEach(item => (content += `${item}\n`));

    if (data.itemsByRarity) {
      content += `\n\nITEMS BY RARITY\n`;
      content += `${'='.repeat(50)}\n`;
      Object.entries(data.itemsByRarity).forEach(([rarity, items]) => {
        content += `\n${rarity.toUpperCase()} (${items.length})\n`;
        content += `${'-'.repeat(20)}\n`;
        items.forEach(item => (content += `${item}\n`));
      });
    }

    return content;
  }

  private static formatAsCSV(result: DirectoryParseResult): string {
    let csv = 'Item Name,Rarity,Source File\n';

    // We need to reconstruct which items came from which files with rarity
    for (const [fileName, items] of Object.entries(result.itemsByFile)) {
      items.forEach(item => {
        // Find rarity for this item
        let rarity = 'Unknown';
        for (const [r, ritems] of Object.entries(result.itemsByRarity)) {
          if (ritems.includes(item)) {
            rarity = r;
            break;
          }
        }
        csv += `"${item}","${rarity}","${fileName}"\n`;
      });
    }

    return csv;
  }
}

// Interfaces for the new functionality
interface DirectoryParseResult {
  files: string[];
  allItems: string[];
  itemsByFile: Record<string, string[]>;
  itemsByRarity: Record<string, string[]>;
  summary: {
    totalFiles: number;
    totalItems: number;
    filesWithErrors: Array<{ file: string; error: string }>;
  };
}

interface ExportOptions {
  format?: 'json' | 'txt' | 'csv';
  recursive?: boolean;
  includeRarity?: boolean;
  includeFileInfo?: boolean;
  sortAlphabetically?: boolean;
}

interface ExportData {
  timestamp: string;
  summary: DirectoryParseResult['summary'];
  items: string[];
  itemsByRarity?: Record<string, string[]>;
  itemsByFile?: Record<string, string[]>;
  files?: string[];
}

// CLI-style usage example
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
Usage: node parser.js <input-directory> <output-file> [options]

Options:
  --format json|txt|csv    Output format (default: json)
  --recursive             Search subdirectories
  --no-rarity            Don't include rarity grouping
  --no-files             Don't include per-file breakdown
  --no-sort              Don't sort alphabetically

Examples:
  node parser.js ./loot-data ./output/all-items.json
  node parser.js ./loot-data ./output/items.txt --format txt --recursive
  node parser.js ./loot-data ./output/items.csv --format csv --no-files
    `);
    return;
  }

  const inputDir = args[0];
  const outputFile = args[1];

  const options: ExportOptions = {
    format: 'json',
    recursive: false,
    includeRarity: true,
    includeFileInfo: true,
    sortAlphabetically: true,
  };

  // Parse command line options
  for (let i = 2; i < args.length; i++) {
    switch (args[i]) {
      case '--format':
        options.format = args[++i] as ExportOptions['format'];
        break;
      case '--recursive':
        options.recursive = true;
        break;
      case '--no-rarity':
        options.includeRarity = false;
        break;
      case '--no-files':
        options.includeFileInfo = false;
        break;
      case '--no-sort':
        options.sortAlphabetically = false;
        break;
    }
  }

  try {
    await DirectoryItemParser.exportItems(inputDir, outputFile, options);
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

// Export for use in other modules
export {
  ItemParser,
  DirectoryItemParser,
  LootNode,
  LootTree,
  ExportOptions,
  DirectoryParseResult,
};
