import fs from 'fs';
import path from 'path';

function collectTsFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectTsFiles(fullPath);
    }
    return entry.name.endsWith('.ts') ? [fullPath] : [];
  });
}

describe('when inspecting listing-chat domain layer', () => {
  it('should not import from infraestructure', () => {
    const domainDir = path.join(__dirname, '../../../domain/listing-chat');
    const files = collectTsFiles(domainDir);

    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      expect(content).not.toMatch(/from ['"].*infraestructure/);
      expect(content).not.toMatch(/require\(['"].*infraestructure/);
    }
  });
});
