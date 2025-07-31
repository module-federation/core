const fs = require('fs');
const path = require('path');

// 修复 NodeNext 兼容性问题
// 将 dist/src/index.d.ts 的内容复制到顶级 index.d.ts 文件中
function fixRuntimeTypes() {
  const srcTypesPath = path.join(__dirname, 'dist', 'src', 'index.d.ts');
  const targetTypesPath = path.join(__dirname, 'dist', 'index.d.ts');

  try {
    if (fs.existsSync(srcTypesPath)) {
      const content = fs.readFileSync(srcTypesPath, 'utf8');
      fs.writeFileSync(targetTypesPath, content);
      console.log('✅ Fixed runtime types for NodeNext compatibility');
    } else {
      console.log('⚠️ Source types file not found:', srcTypesPath);
    }
  } catch (error) {
    console.error('❌ Error fixing types:', error.message);
  }
}

// 修复其他类型文件
function fixOtherTypes() {
  const typesToFix = ['helpers', 'types', 'core'];

  typesToFix.forEach((name) => {
    const srcPath = path.join(__dirname, 'dist', 'src', `${name}.d.ts`);
    const targetPath = path.join(__dirname, 'dist', `${name}.d.ts`);

    try {
      if (fs.existsSync(srcPath)) {
        const content = fs.readFileSync(srcPath, 'utf8');
        fs.writeFileSync(targetPath, content);
        console.log(`✅ Fixed ${name}.d.ts for NodeNext compatibility`);
      }
    } catch (error) {
      console.error(`❌ Error fixing ${name}.d.ts:`, error.message);
    }
  });
}

// 运行修复
fixRuntimeTypes();
fixOtherTypes();
