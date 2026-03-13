# FilterSelect

jQuery dual-list selector with tree groups, search, and configurable limits.

## Dependencies

- [jQuery 3.x](https://jquery.com/)

## Usage

```html
<div id="mySelector"></div>

<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="dist/filterselect.min.js"></script>
<script>
$('#mySelector').filterSelect({
  data: [
    {
      group: "Fruits",
      children: [
        { id: "apple", label: "Apple", selected: false, disabled: false },
        { id: "banana", label: "Banana", selected: true, disabled: false },
        { id: "grape", label: "Grape", selected: false, disabled: true }
      ]
    }
  ],
  leftTitle: 'Available',
  rightTitle: 'Selected',
  maxSelected: 5
});
</script>
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `data` | Array | `[]` | Tree data with groups and children |
| `leftTitle` | String | `'Available'` | Left panel title |
| `rightTitle` | String | `'Selected'` | Right panel title |
| `maxSelected` | Number/null | `null` | Max items in the right list. `null` = unlimited |

## Data format

```js
[
  {
    group: "Group Name",
    children: [
      { id: "unique-id", label: "Display text", selected: false, disabled: false }
    ]
  }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique item identifier |
| `label` | String | Display text |
| `selected` | Boolean | `true` = starts in right list |
| `disabled` | Boolean | `true` = not selectable or movable |

## Features

- Dual-panel with move left/right
- Tree structure with collapsible groups
- Group checkbox (click to invert, Shift+Click to toggle all)
- Search filtering per panel
- Select All / Deselect All per panel
- Status bar with checked/total counts
- Configurable max selected items with warning state

## CSS classes

| Class | Description |
|-------|-------------|
| `fs-status-warning` | Applied to status bar when limit is reached (override for custom warning style) |
