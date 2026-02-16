# Changelog

All notable changes to this project will be documented in this file.

## [1.0.4] - 2026-02-16

### Fixed
- Synced local and remote file inconsistencies (autoCapture default, version numbers)
- Added PII warning to autoCapture uiHints and SKILL.md documentation
- Clarified that autoCapture trigger patterns match emails and phone numbers

### Changed
- uiHints labels changed to English for consistency
- Improved autoCapture help text with explicit PII capture warning
- Version bump: openclaw.plugin.json 1.0.0 -> 1.0.4

## [1.0.3] - 2026-02-16

### Documentation
- Simplified SKILL.md following high-star skill patterns
- Added "Use when" statement for clarity
- Condensed features, configuration, and usage sections
- Removed verbose FAQ and implementation details
- Improved description and tags for better discoverability

## [1.0.2] - 2026-02-16

### Documentation
- Added comprehensive Privacy & Security section to README and SKILL.md
- Clarified data storage modes (in-memory vs Qdrant)
- Documented network access behavior (Transformers.js model download)
- Added detailed configuration options with privacy notes
- Included security recommendations for production use

## [1.0.1] - 2026-02-16

### Security
- Removed development documentation files (CODE_REVIEW.md, PHASE*.md, etc.)
- Removed test files that duplicated source code
- Fixed @xenova/transformers version (3.3.1 -> 2.17.2)
- Removed unintended openai dependency from package-lock.json
- Changed autoCapture default from true to false (opt-in for privacy)

### Changed
- Cleaned up repository structure for production use

## [1.0.0] - 2026-02-16

### Added
- Initial release
- Local semantic memory with Qdrant (in-memory mode)
- Transformers.js for local embeddings (Xenova/all-MiniLM-L6-v2)
- Three core tools: `memory_store`, `memory_search`, `memory_forget`
- Automatic memory capture via lifecycle hooks
- Zero-configuration setup

### Technical
- ES6 module system
- Factory function pattern for tool exports
- Compatible with OpenClaw plugin architecture
