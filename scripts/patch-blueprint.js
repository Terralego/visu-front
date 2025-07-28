const fs = require('fs');
const path = require('path');

// Blueprint.js files that need patching for modern Sass compatibility
const patches = [
  {
    file: 'node_modules/@blueprintjs/core/src/components/menu/_submenu.scss',
    fixes: [
      {
        find: '@extend .#{$ns}-menu-item:hover;',
        replace: '// @extend .#{$ns}-menu-item:hover; // Patched for modern Sass\n      color: $pt-intent-primary;\n      background: rgba($gray3, 0.15);'
      }
    ]
  }
];

function applyPatches() {
  let patchCount = 0;
  
  patches.forEach(patch => {
    const filePath = path.join(__dirname, '..', patch.file);
    
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      patch.fixes.forEach(fix => {
        if (content.includes(fix.find)) {
          content = content.replace(fix.find, fix.replace);
          modified = true;
          patchCount++;
        }
      });
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Patched ${patch.file}`);
      }
    } else {
      console.log(`⚠️  File not found: ${patch.file}`);
    }
  });
  
  if (patchCount > 0) {
    console.log(`🎉 Applied ${patchCount} Blueprint.js patches for modern Sass compatibility`);
  } else {
    console.log('ℹ️  No Blueprint.js patches needed');
  }
}

applyPatches();
