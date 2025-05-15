#!/bin/bash

# Script to update commit messages
# Generated on 2025-05-15T08:57:32.516Z

# Store the current branch name
CURRENT_BRANCH="update-nx"

# Make sure there are no unstaged changes
if [[ -n $(git status -s) ]]; then
  echo "Error: You have unstaged changes. Please commit or stash them first."
  exit 1
fi

echo "Processing commit dec648ca..."
git checkout dec648cad403766e4acf9c99e140f36b4d5f0858~0
git commit --amend -m "fix(runtime): enhance cypress config with injectDocumentDomain for better e2e testing"
echo "Processing commit 049bc0e1..."
git checkout 049bc0e115c8d5c93bd1e290477a832bd24802c0~0
git commit --amend -m "chore(storybook-addon): upgrade to fix nx error and add qwik-nx"
echo "Processing commit 6ecb9f83..."
git checkout 6ecb9f832dc1168c422fa55af880ffa9a0ae9915~0
git commit --amend -m "chore(modern-js-plugin): add delay to build command"
echo "Processing commit d81dbd9b..."
git checkout d81dbd9b5bf9cb0ba1a7b53fc96f1e2c03b183ca~0
git commit --amend -m "chore(core): remove next and eslint-config-next dependencies"
echo "Processing commit 2cf28395..."
git checkout 2cf28395f2610f0e681dd07d65734e98f4f046b8~0
git commit --amend -m "chore(core): simplify nx test command in workflow"
echo "Processing commit dc1786ff..."
git checkout dc1786ffa64d4e9903d2e9abc38759770aa36c72~0
git commit --amend -m "fix(storybook-addon): update module federation import path"
echo "Processing commit 97f5ca10..."
git checkout 97f5ca100d118e7223a20d7e78f359097a869f77~0
git commit --amend -m "chore(dts-plugin): update vue and vue-tsc dependencies"
echo "Processing commit b1ab8698..."
git checkout b1ab8698f8e54f6ab99bd4bc09f0d1e822ef0b92~0
git commit --amend -m "chore(dts-plugin): update build commands"
echo "Processing commit 6a52a075..."
git checkout 6a52a075ab0f1b241a0dc47f6edd982bebaa1fd3~0
git commit --amend -m "chore(dts-plugin): set cwd for dts-plugin commands"
echo "Processing commit fca0da67..."
git checkout fca0da675b6e8a2ff389cd3bb300999e50853e1c~0
git commit --amend -m "chore(dts-plugin): update build and command options in project.json"
echo "Processing commit d03c0a40..."
git checkout d03c0a40276f4e0759380c12b50a10374664c30f~0
git commit --amend -m "chore(dts-plugin): add ls command to build process"
echo "Processing commit d57ededf..."
git checkout d57ededf8e2e520e1567c8d34327433f63776b51~0
git commit --amend -m "chore(dts-plugin): update output path in project.json"
echo "Processing commit d0049620..."
git checkout d00496203b059cb771335c0edce6be50006a0494~0
git commit --amend -m "chore(dts-plugin): update commands array format in project.json"
echo "Processing commit 770fccd0..."
git checkout 770fccd09b4552ed8b0b9e46b6784a06670a4059~0
git commit --amend -m "chore(dts-plugin): update build and test command configurations"
echo "Processing commit 68c7ade1..."
git checkout 68c7ade1c405f899c4cb310452eabcfceea1cf57~0
git commit --amend -m "chore(dts-plugin): simplify build and test command execution paths"
echo "Processing commit 67fc132d..."
git checkout 67fc132d2c6bcfbb660b72b844ff59ade252c396~0
git commit --amend -m "chore(dts-plugin): add ls command to project.json script"
echo "Processing commit 29d45133..."
git checkout 29d45133e6d7e5b553d0b859d10f58ce5d9732eb~0
git commit --amend -m "chore(dts-plugin): update ls command in build script"
echo "Processing commit 08ac2233..."
git checkout 08ac22331809f484a775214f9034e67b013c526c~0
git commit --amend -m "chore(dts-plugin): update output directory path"
echo "Processing commit c3c38633..."
git checkout c3c38633498e8531f31a2dd161cf73fee325d4c0~0
git commit --amend -m "chore(dts-plugin): simplify build commands configuration"
echo "Processing commit 9fa3cbdd..."
git checkout 9fa3cbdd2d55eb9ec89fc2bce674c203008df7d8~0
git commit --amend -m "chore(dts-plugin): update dependencies and optimize commands"
echo "Processing commit fd64b1e1..."
git checkout fd64b1e178b0bc2ef5c3016a9425ca86ece0a9ad~0
git commit --amend -m "chore(core): comment out next.js dev command in e2e workflow"
echo "Processing commit 4e7fd701..."
git checkout 4e7fd701a380748a0fbf006d791a780d3e5e832c~0
git commit --amend -m "refactor(workflows): simplify port response check in SSR e2e script"
echo "Processing commit 4e8f3927..."
git checkout 4e8f39279e228a514e3d202eca9153faa6084644~0
git commit --amend -m "feat(core): update E2E configuration for Next.js projects"
echo "Processing commit 87b5d8ac..."
git checkout 87b5d8acf5e763b84e3d34b1773641cc2c5ab1e0~0
git commit --amend -m "chore(sdk): update dependencies and scripts in package.json files"
echo "Processing commit 9c94b969..."
git checkout 9c94b969633c2dd084b577ed2e5d61b3cc372c36~0
git commit --amend -m "feat(nextjs-mf): optimize E2E testing configuration and parallel build processes"
echo "Processing commit 7b344b80..."
git checkout 7b344b8058f32f301551da8089760b793346fd39~0
git commit --amend -m "chore(core): increase parallel builds to 100"
echo "Processing commit 64ce5f0b..."
git checkout 64ce5f0b0d88fbe34d51a3ab7d5bfa981ea26b42~0
git commit --amend -m "feat(core): optimize build parallelism in workflow"
echo "Processing commit a11d290a..."
git checkout a11d290a2c5c358a981c042b54592eab510df68f~0
git commit --amend -m "fix(core): update e2e-next-prod workflow configuration"
echo "Processing commit 7a557c6a..."
git checkout 7a557c6aa374aa48951d28d153fd6dce9d67060f~0
git commit --amend -m "fix(cli): adjust command in 3001-shop configuration"
echo "Processing commit 79ad46a7..."
git checkout 79ad46a76b7247bade5da90036a20f48f9227851~0
git commit --amend -m "fix(workflows): revise e2e-next-dev test execution steps"
echo "Processing commit 20001cc8..."
git checkout 20001cc8dd02b15309d2bec33d65358b9a0bcd54~0
git commit --amend -m "ci(core): add CI caching for Playwright and Cypress to improve performance"
echo "Processing commit 4e550c63..."
git checkout 4e550c63b6557317864e8b5ef96b62ab4a086a64~0
git commit --amend -m "chore(nx): update e2e workflow to improve node process management"
echo "Processing commit 7f954ff3..."
git checkout 7f954ff365ccc4c0566d2482d93f922cc1c69abb~0
git commit --amend -m "fix(nx): update project names in configs to match package.json convention"
echo "Processing commit 768bd921..."
git checkout 768bd9213d13650eaa756c3a5e699ed67396aeab~0
git commit --amend -m "chore(core): update nx command syntax in project.json"
echo "Processing commit 42188d22..."
git checkout 42188d2296cb10559ae6bf4035bce2dac735c7fc~0
git commit --amend -m "chore: update package.json dependencies and scripts"
echo "Processing commit f23e4696..."
git checkout f23e4696f5aa7dd6b3f6932f5a556bbe2b31b946~0
git commit --amend -m "chore(core): update production config in project.json"
echo "Processing commit cb2ee05f..."
git checkout cb2ee05f6f06a8c1c01bd155f8bb58331617aa0a~0
git commit --amend -m "refactor(chrome-devtools): use Playwright cache to improve installation efficiency"
echo "Processing commit bc56ae03..."
git checkout bc56ae03d77c25c31ee6d12b31e3c981ff38d440~0
git commit --amend -m "chore(utils): refactor commit message enhancement script for readability"
echo "Processing commit b0d42317..."
git checkout b0d42317497a40c98b5800477c0e0d984d02b903~0
git commit --amend -m "refactor(core): simplify commit message enhancement process"
echo "Processing commit 100593a8..."
git checkout 100593a8de246899444050c2cd8b84495b9ca537~0
git commit --amend -m "feat(workflow): optimize build parallelization and add CPU core count logging"
echo "Processing commit 5bee188b..."
git checkout 5bee188b0a9b4c7630a8e0aa54310cecd5c541d3~0
git commit --amend -m "chore(core): ignore temp commit message file in .gitignore"
echo "Processing commit 32768857..."
git checkout 327688579683003f2c3c72f327ede64655d07e5e~0
git commit --amend -m "chore(core): untrack and ignore .temp-commit-msg file"
echo "Processing commit e98ca8a5..."
git checkout e98ca8a5d147ccefd2392ea6c7a0a9160305fcb2~0
git commit --amend -m "chore(commit-msg-enhance): add commit message update script and options"

# Return to the original branch
git checkout $CURRENT_BRANCH

echo "All commit messages updated!"
echo "You can now force push with: git push --force-with-lease origin $CURRENT_BRANCH"
