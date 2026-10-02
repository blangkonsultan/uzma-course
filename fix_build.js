const fs = require('fs');

// 1. murid/[id]/page.tsx
let muridPage = fs.readFileSync('src/app/admin/murid/[id]/page.tsx', 'utf8');
muridPage = muridPage.replace(/\{formatFrequencyShort\(p\.programs\?\.frequency\)\}/g, '');
muridPage = muridPage.replace(/\{p\.programs\?\.frequency \|\| 3\} sesi/g, 'sesi'); // need to check the exact line
fs.writeFileSync('src/app/admin/murid/[id]/page.tsx', muridPage);

// 2. program-form.tsx state type
let formFile = fs.readFileSync('src/components/admin/program/program-form.tsx', 'utf8');
formFile = formFile.replace(/variants: \[\n\s+\.\.\.prev\.variants,\n\s+\{ id: \`new-\$\{Date\.now\(\)\}\`, name: "Varian Baru", duration: 30, system: 2, teacher_fee: 0, default_spp: 0, sort_order: prev.variants.length, is_active: true \},\n\s+\],/, 'variants: [\n        ...prev.variants,\n        { id: `new-${Date.now()}`, name: "Varian Baru", duration: 30, frequency: 3, system: 2, teacher_fee: 0, default_spp: 0, sort_order: prev.variants.length, is_active: true } as any,\n      ],');
fs.writeFileSync('src/components/admin/program/program-form.tsx', formFile);

// 3. programs-section.tsx
let progSec = fs.readFileSync('src/components/landing/programs-section.tsx', 'utf8');
progSec = progSec.replace(/\{formatFrequencyShort\(v\.frequency \|\| 3\)\}/g, '{formatFrequencyShort((v as any).frequency || 3)}');
fs.writeFileSync('src/components/landing/programs-section.tsx', progSec);

// 4. landing-content.ts
let landingContent = fs.readFileSync('src/lib/landing-content.ts', 'utf8');
landingContent = landingContent.replace(/frequency: p\.frequency,/g, '');
fs.writeFileSync('src/lib/landing-content.ts', landingContent);

