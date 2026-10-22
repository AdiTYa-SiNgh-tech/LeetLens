const fs = require("fs");
const path = require("path");

const files = ["data.json", "ratings.txt", "LICENSE", "README.md", "gen.py"];
const distDir = path.resolve(__dirname, "..", "dist");

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

for (const file of files) {
  const src = path.resolve(__dirname, "..", file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}
