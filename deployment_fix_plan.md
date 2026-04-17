# Fix Cloudflare Deployment Failure

The deployment is failing because the `pnpm-lock.yaml` file is out of sync with `package.json`. Additionally, `playwright` is currently listed as a production dependency, which is not ideal for Cloudflare Workers.

## User Review Required

> [!NOTE]
> I will move `playwright` to `devDependencies` since it is a testing utility and not required at runtime in Cloudflare. This will reduce build size and follow best practices.

## Proposed Changes

### Dependency Management

#### [MODIFY] [package.json](file:///d:/Project/api-cdi-bpjs/package.json)
- Move `playwright` from `dependencies` to `devDependencies`.

#### [MODIFY] [pnpm-lock.yaml](file:///d:/Project/api-cdi-bpjs/pnpm-lock.yaml) (Auto-generated)
- Run `pnpm install` locally to synchronize the lockfile with the updated `package.json`.

## Verification Plan

### Automated Tests
- Run `pnpm install` and verify it completes without errors.
- Check that `pnpm-lock.yaml` has been updated with the correct entries for `playwright`.

### Manual Verification
- After these changes are pushed, the user should re-deploy to Cloudflare.
