# Changelog

## [Unreleased]
- Unified asset class field across pipeline and filters; benchmarks now visible in Class View.
- Benchmark row now rendered above the fund table in Class View.
- Normalize numeric fields when parsing fund files.
- Added `fmtPct` and `fmtNumber` helpers and updated components to use them.
- Added tests for parser normalization and Class View rendering.
- Fixed YTD parsing to use dedicated column and not 1Y value.
- Inject benchmark rows for each asset class when missing.
- Added ensureBenchmarkRows helper with console logs and ClassView component.
- BenchmarkRow banner table ensures benchmark row visible in ClassView; added ClassView.css and tests.
- Benchmarks preserved during scoring; debug log shows benchmark count.
- Added benchmark audit script and flow documentation; dashboard views show benchmarks by default.
