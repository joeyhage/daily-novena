# Change Log

All notable changes to the "dailynovena" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.12] - 2021-11-22
### Changed
- Updated dependencies.

## [0.0.11] - 2021-11-02
### Added
- More logging and error handling for fetch requests to praymorenovenas.com.

## [0.0.10] - 2021-10-31
### Changed
- Reminder prompt now includes current Novena and day.
- If praying the community Novena and it is the final day, reminder prompt opens most recent podcast in the browser since final day prayers are not on the praymorenovenas.com website.

## [0.0.9] - 2021-10-31
### Changed
- Dependency updates

## [0.0.8] - 2021-10-26
### Added
- Option to silence reminder on startup for the day.

### Fixed
- Empty HTML paragraph tags in Novena output.

## [0.0.7] - 2021-10-24
### Added
- VS Code setting to remind on startup. Only checks setting on VS Code startup. See README for instructions on the dailyNovena.remindOnStartup setting.

### Fixed
- Correctly setting log level based on user setting.

## [0.0.6] - 2021-10-22
### Added
- VS Code setting to change log level. Only checks setting on VS Code startup.

### Changed
- Use VS Code "globalState" to save Novena configuration instead of file system.

### Fixed
- Saving selections was not working on Windows OS

## [0.0.5] - 2021-10-20
### Fixed
- Bug causing extension to not work.

## [0.0.4] - 2021-10-19
### Fixed
- Community Novena.

## [0.0.3] - 2021-10-17
### Added
- Improve documentation for extension.

## [0.0.2] - 2021-10-17
### Added
- First publish to test extension configuration.

## [0.0.1] - 2021-10-16
### Added
- Not published.

[Unreleased]: https://github.com/joeyhage/daily-novena/compare/v0.0.12...HEAD
[0.0.12]: https://github.com/joeyhage/daily-novena/compare/v0.0.11...v0.0.12
[0.0.11]: https://github.com/joeyhage/daily-novena/compare/v0.0.10...v0.0.11
[0.0.10]: https://github.com/joeyhage/daily-novena/compare/v0.0.9...v0.0.10
[0.0.9]: https://github.com/joeyhage/daily-novena/compare/v0.0.8...v0.0.9
[0.0.8]: https://github.com/joeyhage/daily-novena/compare/v0.0.7...v0.0.8
[0.0.7]: https://github.com/joeyhage/daily-novena/compare/v0.0.6...v0.0.7
[0.0.6]: https://github.com/joeyhage/daily-novena/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/joeyhage/daily-novena/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/joeyhage/daily-novena/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/joeyhage/daily-novena/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/joeyhage/daily-novena/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/joeyhage/daily-novena/releases/tag/v0.0.1
