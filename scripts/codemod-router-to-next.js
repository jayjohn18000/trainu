#!/usr/bin/env node

/**
 * Codemod to convert React Router DOM references to Next.js equivalents
 * 
 * Usage:
 *   node scripts/codemod-router-to-next.js [file-or-directory]
 * 
 * Examples:
 *   node scripts/codemod-router-to-next.js src/components/TabNavigation.tsx
 *   node scripts/codemod-router-to-next.js src/
 */

const fs = require('fs');
const path = require('path');

// Mapping of React Router DOM to Next.js equivalents
const replacements = [
  // Import statements
  {
    pattern: /import\s*{\s*useNavigate\s*}\s*from\s*["']react-router-dom["'];?/g,
    replacement: 'import { useRouter } from "next/navigation";'
  },
  {
    pattern: /import\s*{\s*useLocation\s*}\s*from\s*["']react-router-dom["'];?/g,
    replacement: 'import { usePathname } from "next/navigation";'
  },
  {
    pattern: /import\s*{\s*useParams\s*}\s*from\s*["']react-router-dom["'];?/g,
    replacement: 'import { useParams } from "next/navigation";'
  },
  {
    pattern: /import\s*{\s*Link\s*}\s*from\s*["']react-router-dom["'];?/g,
    replacement: 'import Link from "next/link";'
  },
  {
    pattern: /import\s*{\s*NavLink\s*}\s*from\s*["']react-router-dom["'];?/g,
    replacement: 'import Link from "next/link";'
  },
  
  // Multiple imports in one line
  {
    pattern: /import\s*{\s*([^}]*)\s*}\s*from\s*["']react-router-dom["'];?/g,
    replacement: (match, imports) => {
      const importList = imports.split(',').map(imp => imp.trim());
      const nextImports = [];
      const routerImports = [];
      
      importList.forEach(imp => {
        if (imp.includes('useNavigate')) {
          routerImports.push('useRouter');
        } else if (imp.includes('useLocation')) {
          routerImports.push('usePathname');
        } else if (imp.includes('useParams')) {
          routerImports.push('useParams');
        } else if (imp.includes('Link') || imp.includes('NavLink')) {
          nextImports.push('Link');
        }
      });
      
      const lines = [];
      if (nextImports.length > 0) {
        lines.push(`import Link from "next/link";`);
      }
      if (routerImports.length > 0) {
        lines.push(`import { ${routerImports.join(', ')} } from "next/navigation";`);
      }
      
      return lines.join('\n');
    }
  },
  
  // Hook usage replacements
  {
    pattern: /const\s+navigate\s*=\s*useNavigate\(\);?/g,
    replacement: 'const router = useRouter();'
  },
  {
    pattern: /const\s+location\s*=\s*useLocation\(\);?/g,
    replacement: 'const pathname = usePathname();'
  },
  
  // Navigation calls
  {
    pattern: /navigate\(["']([^"']+)["']\)/g,
    replacement: 'router.push("$1")'
  },
  {
    pattern: /navigate\(["']([^"']+)["'],\s*{\s*replace:\s*true\s*}\)/g,
    replacement: 'router.replace("$1")'
  },
  {
    pattern: /navigate\((-?\d+)\)/g,
    replacement: 'router.back()'
  },
  
  // Link component usage
  {
    pattern: /<Link\s+to=["']([^"']+)["']([^>]*)>/g,
    replacement: '<Link href="$1"$2>'
  },
  {
    pattern: /<NavLink\s+to=["']([^"']+)["']([^>]*)>/g,
    replacement: '<Link href="$1"$2>'
  },
  
  // Location usage
  {
    pattern: /location\.pathname/g,
    replacement: 'pathname'
  },
  {
    pattern: /location\.search/g,
    replacement: 'useSearchParams().toString()'
  },
  {
    pattern: /location\.hash/g,
    replacement: 'window.location.hash'
  },
  
  // Params usage (Next.js params are async)
  {
    pattern: /const\s*{\s*([^}]+)\s*}\s*=\s*useParams\(\);?/g,
    replacement: 'const params = useParams();\n  const { $1 } = params as { $1: string };'
  }
];

// Additional replacements for specific patterns
const additionalReplacements = [
  // Replace searchParams usage
  {
    pattern: /useSearchParams\(\)/g,
    replacement: 'useSearchParams()'
  },
  
  // Replace router events (if any)
  {
    pattern: /router\.events\.on\(/g,
    replacement: '// TODO: Replace with Next.js router events\n  // router.events.on('
  }
];

function processFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Apply main replacements
    replacements.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    });
    
    // Apply additional replacements
    additionalReplacements.forEach(({ pattern, replacement }) => {
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      // Add useSearchParams import if needed
      if (content.includes('useSearchParams()') && !content.includes('useSearchParams')) {
        content = content.replace(
          /import\s*{\s*([^}]*)\s*}\s*from\s*["']next\/navigation["'];?/,
          (match, imports) => {
            const importList = imports.split(',').map(imp => imp.trim());
            if (!importList.includes('useSearchParams')) {
              importList.push('useSearchParams');
            }
            return `import { ${importList.join(', ')} } from "next/navigation";`;
          }
        );
      }
      
      // Write back to file
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      processDirectory(fullPath);
    } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts'))) {
      processFile(fullPath);
    }
  });
}

function main() {
  const target = process.argv[2];
  
  if (!target) {
    console.log('Usage: node codemod-router-to-next.js [file-or-directory]');
    console.log('Examples:');
    console.log('  node codemod-router-to-next.js src/components/TabNavigation.tsx');
    console.log('  node codemod-router-to-next.js src/');
    process.exit(1);
  }
  
  const targetPath = path.resolve(target);
  
  if (!fs.existsSync(targetPath)) {
    console.error(`❌ Path does not exist: ${targetPath}`);
    process.exit(1);
  }
  
  const stat = fs.statSync(targetPath);
  
  if (stat.isFile()) {
    processFile(targetPath);
  } else if (stat.isDirectory()) {
    processDirectory(targetPath);
  }
  
  console.log('\n🎉 Codemod completed!');
  console.log('\n📝 Manual review needed for:');
  console.log('  - Router events (useEffect with router.events)');
  console.log('  - Dynamic route parameters (may need async handling)');
  console.log('  - Search params usage (useSearchParams hook)');
  console.log('  - Navigation with state (may need query params)');
}

if (require.main === module) {
  main();
}

module.exports = { processFile, processDirectory, replacements };
