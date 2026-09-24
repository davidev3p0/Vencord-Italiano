# Code signing policy

## Provider

Free code signing provided by SignPath.io, certificate by SignPath Foundation.

Vencord Italiano uses automated builds from the public GitHub repository and intends to sign release installers only from verified GitHub Actions workflows.

## Team roles

At this stage the project is maintained by a single maintainer.

- Committer: [davidev3p0](https://github.com/davidev3p0)
- Reviewer: [davidev3p0](https://github.com/davidev3p0)
- Approver: [davidev3p0](https://github.com/davidev3p0)

If additional maintainers are added, these roles will be updated before they participate in release signing.

## Release signing rules

- Only release artifacts produced by GitHub Actions from this repository may be submitted for signing.
- Release signing must use GitHub-hosted runners.
- The repository, commit and workflow origin must be verifiable.
- The installer must not use packers, executable encryption, obfuscation intended to conceal behavior or antivirus bypass techniques.
- Every signed release requires explicit approval.
- SHA-256 hashes and build provenance are published with release artifacts.
- The private signing key is never exported to project maintainers.

## Privacy

See [PRIVACY.md](PRIVACY.md).

## Security

See [SECURITY.md](SECURITY.md).
