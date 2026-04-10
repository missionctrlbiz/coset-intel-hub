---
applyTo: "**"
---

# Copilot Safety Rules — CoSET Intelligence Hub

These rules apply to every file in this project. They exist because previous AI sessions caused regressions, deleted files, and reverted working code.

## Git Operations

**NEVER run these commands:**

```bash
git stash          # Causes VS Code source control to lose file diffs
git stash pop
git reset --hard
git reset --soft
git clean -fd
git checkout -- .
git restore .
```

**Safe alternatives:**

```bash
git diff HEAD -- <file>     # Inspect changes in a specific file
git status                   # Check what's modified
git log --oneline -10        # See commit history
```

## Edit Discipline

1. **Read before editing** — Always read the actual file content before calling `replace_string_in_file`. Never work from memory or earlier conversation context — files may have been updated since.

2. **Surgical edits only** — Only change exactly what is broken or requested. Do not:
   - Refactor surrounding code
   - Rearrange working imports
   - Add error handling for scenarios that cannot happen
   - Change copy/strings you weren't asked to change
   - Add files that weren't requested

3. **Never replace a working implementation with a stub** — If a component or page has real content, do not reduce it to a placeholder.

4. **Never overwrite a file entirely** — Use targeted `replace_string_in_file` or `multi_replace_string_in_file`. Do not rewrite whole files unless the user explicitly asks to start from scratch.

## Files That Must Not Be Touched Unless Explicitly Asked

| File                                 | Reason                           |
| ------------------------------------ | -------------------------------- |
| `app/page.tsx`                       | Homepage is complete             |
| `app/reports/page.tsx`               | Reports explorer is complete     |
| `app/reports/[slug]/page.tsx`        | Detail page is complete          |
| `app/blog/page.tsx`                  | Blog listing is complete         |
| `app/blog/[slug]/page.tsx`           | Blog post detail is complete     |
| `app/login/page.tsx`                 | Auth is complete                 |
| `app/contact/page.tsx`               | Contact form is complete         |
| `app/admin/page.tsx`                 | Admin dashboard is complete      |
| `app/admin/content/page.tsx`         | Content management is complete   |
| `app/admin/upload/page.tsx`          | Upload wizard is complete        |
| `app/api/extract-from-file/route.ts` | Core AI pipeline — do not modify |
| `lib/genai.ts`                       | AI extraction — do not modify    |
| `lib/supabase/clients.ts`            | Auth/DB clients — do not modify  |

## Before Reporting an Error as Fixed

After making any edit, verify:

1. The file still has all its original working code (nothing accidentally deleted)
2. No new imports reference components that don't exist
3. No new code uses wrong DB column names (`summary` vs `description`, `categories` vs `category`)
4. The build/typecheck would not fail due to missing modules

## Imports — Non-Existent Modules

**NEVER import from these paths — these files do not exist:**

- `@/components/admin-header`
- `@/components/admin-sidebar`
- `@/components/theme-logo` (verify export exists before importing)
- Any component not listed in `.github/instructions/components.instructions.md`
