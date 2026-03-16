# Changelog

## 1.5.2

- Fix: stale checked state in renderBoth() caused limit warning to persist after move-left, blocking subsequent move-right operations

## 1.5.1

- Fix: `getSelectedIds()` now correctly returns item IDs instead of labels

## 1.5.0

- Public API method `getSelectedData()` returns array of item objects from the right list
- Public API method `getSelectedIds()` returns flat array of IDs from the right list
- Both methods return all right-list items regardless of checkbox state
- jQuery plugin method call pattern: `$('#el').filterSelect('methodName')`
- Example: Save button with debug area showing selected IDs

## 1.4.0

- `data` option accepts a URL string to load JSON data via AJAX GET
- New `ajaxParams` option for appending query string parameters to the AJAX request
- On AJAX failure, logs a warning to console and renders empty lists
- Array-based `data` continues to work unchanged

## 1.3.1

- Fix: right status bar format changed to `checked / total [max: N]`
- Fix: left warning now triggers only when checked + right total > maxSelected (not >=)

## 1.3.0

- Configurable `maxSelected` init option to limit items in the right (selected) list
- Right status bar shows `total / maxSelected` format when limit is set
- Right status bar warning (CSS class `fs-status-warning`) when at limit
- Left status bar warning when checked + right total >= limit
- Move-right disabled/blocked when limit would be exceeded
- Move-left never blocked
- Optional, unlimited by default

## 1.2.0

- Status bar at the bottom of each list panel
- Shows checked / total selectable items (format: `N / M`)
- Excludes group labels and disabled items from counts
- Updates in real-time on check/uncheck and after moves

## 1.1.0

- Group checkbox on each group label row
- Click group checkbox to invert checked state of all non-disabled children
- Shift+Click group checkbox to toggle check all / uncheck all children
- Group checkbox shows indeterminate state when children are partially checked
- Select All / Deselect All now update group checkbox state
- Works on both left and right lists

## 1.0.0

- Initial release
- jQuery plugin `$.fn.filterSelect` with dual-list selector
- Tree structure with collapsible groups
- Move items between lists with arrow buttons
- Select All / Deselect All per list
- Search filtering per list (case-insensitive)
- Disabled items support
- JSON-based data initialization
- Minified build in dist/
- Working example with inline CSS
