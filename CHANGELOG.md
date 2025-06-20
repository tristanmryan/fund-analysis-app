# Changelog

## [Unreleased]
- Normalize numeric fields when parsing fund files.
- Added `fmtPct` and `fmtNumber` helpers and updated components to use them.
- Added tests for parser normalization and Class View rendering.
- Fixed YTD parsing to use dedicated column and not 1Y value.
- Inject benchmark rows for each asset class when missing.
- Added ensureBenchmarkRows helper with console logs and ClassView component.
