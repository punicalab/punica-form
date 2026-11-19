# Contributing

**Working on your first Pull Request?** You can learn how from this _free_
series
[How to Contribute to an Open Source Project on GitHub](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github)

## Project setup

1.  `Fork` and `Clone` the repo
2.  Run `pnpm install` to install dependencies
3.  Create a branch for your pull request (see
    [PULL_REQUEST_TEMPLATE](https://github.com/punicalab/punica-form/blob/HEAD/.github/PULL_REQUEST_TEMPLATE.md))

> Tip: Keep your `main` branch pointing at the original repository and make pull
> requests from branches on your fork. To do this, run:
>
> ```
> git remote add upstream https://github.com/punicalab/punica-form.git
> git fetch upstream
> git branch --set-upstream-to=upstream/main main
> ```
>
> This will add the original repository as a "remote" called "upstream," Then
> fetch the git information from that remote, then set your local `main` branch
> to use the upstream main branch whenever you run `git pull`. Then you can make
> all of your pull request branches based on this `main` branch. Whenever you
> want to update your version of `main`, do a regular `git pull`.

## Committing and Pushing changes

Please make sure to run the tests before you commit your changes. You can run
`pnpm test`

## Describing your change

Every pull request that changes a package needs a changeset. Run `pnpm changeset`,
pick the bump type (`patch`, `minor` or `major`) and describe the change. The
generated file in `.changeset/` is committed with your pull request and becomes
the changelog entry of the next release.

## Releases

Releases are made by the release workflow, never from a local machine.

1. Pull requests carry changesets. When they reach `main`, the workflow opens
   a **Version Packages** pull request.
2. Merging that pull request publishes the packages to npm.

Release candidates come first. While `.changeset/pre.json` exists the
repository is in pre-release mode: versions look like `2.1.0-next.0` and are
published under the `next` tag (`npm install @punica/form@next`). After the
candidate has been tried in a real application, leave the mode with
`pnpm changeset pre exit` and merge the next Version Packages pull request to
publish the stable version.

## Commit hooks

`pnpm install` sets up the hooks: commit messages are checked for the
`type: description` format and `pnpm lint` runs before a commit.

## Help needed

Please checkout the [open issues][issues]

[issues]: https://github.com/punicalab/punica-form/issues
