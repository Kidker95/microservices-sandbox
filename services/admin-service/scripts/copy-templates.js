const fs = require("fs");
const path = require("path");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

const root = process.cwd();
const src = path.join(root, "src", "templates");
const dest = path.join(root, "dist", "templates");

if (!fs.existsSync(src)) {
  console.error("Templates folder not found:", src);
  process.exit(1);
}

copyDir(src, dest);
console.log("✅ Templates copied to dist/templates");
