node -e 'const fs = require("fs"); const pkg = JSON.parse(fs.readFileSync("package.json")); delete pkg.overrides; fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));'
