// FilterSelect v1.5.2
(function($) {
  'use strict';

  $.fn.filterSelect = function(options) {
    // Method calls on existing instance
    if (typeof options === 'string') {
      var instance = this.first().data('filterSelect');
      if (!instance || typeof instance[options] !== 'function') return this;
      return instance[options]();
    }

    var defaults = {
      data: [],
      leftTitle: 'Available',
      rightTitle: 'Selected',
      maxSelected: null,
      ajaxParams: {}
    };
    var opts = $.extend({}, defaults, options);

    return this.each(function() {
      var $container = $(this);
      $container.addClass('fs-container');

      if (typeof opts.data === 'string') {
        var url = opts.data;
        $.ajax({
          url: url,
          type: 'GET',
          data: opts.ajaxParams,
          dataType: 'json'
        }).done(function(data) {
          opts.data = data;
          initPlugin($container, opts);
        }).fail(function(jqXHR, textStatus, errorThrown) {
          console.warn('FilterSelect: failed to load data from ' + url + ' (' + textStatus + ')');
          opts.data = [];
          initPlugin($container, opts);
        });
      } else {
        initPlugin($container, opts);
      }
    });
  };

  function initPlugin($container, opts) {
      // Build internal data map
      var itemsMap = {};
      $.each(opts.data, function(_, group) {
        $.each(group.children, function(_, child) {
          itemsMap[child.id] = $.extend({}, child, {
            group: group.group,
            checked: false
          });
        });
      });

      // Get group names in order
      var groupNames = [];
      $.each(opts.data, function(_, g) { groupNames.push(g.group); });

      // Render
      var html =
        '<div class="fs-panel fs-panel-left">' +
          '<div class="fs-title">' + opts.leftTitle + '</div>' +
          '<input type="text" class="fs-search" placeholder="Search...">' +
          '<div class="fs-actions">' +
            '<button type="button" class="fs-btn fs-select-all">Select All</button>' +
            '<button type="button" class="fs-btn fs-deselect-all">Deselect All</button>' +
          '</div>' +
          '<div class="fs-list" data-side="left"></div>' +
          '<div class="fs-status-bar">0 / 0</div>' +
        '</div>' +
        '<div class="fs-controls">' +
          '<button type="button" class="fs-btn fs-move-right">&#9654;</button>' +
          '<button type="button" class="fs-btn fs-move-left">&#9664;</button>' +
        '</div>' +
        '<div class="fs-panel fs-panel-right">' +
          '<div class="fs-title">' + opts.rightTitle + '</div>' +
          '<input type="text" class="fs-search" placeholder="Search...">' +
          '<div class="fs-actions">' +
            '<button type="button" class="fs-btn fs-select-all">Select All</button>' +
            '<button type="button" class="fs-btn fs-deselect-all">Deselect All</button>' +
          '</div>' +
          '<div class="fs-list" data-side="right"></div>' +
          '<div class="fs-status-bar">0 / 0</div>' +
        '</div>';

      $container.html(html);

      var $leftList = $container.find('.fs-panel-left .fs-list');
      var $rightList = $container.find('.fs-panel-right .fs-list');

      function buildList($list, side) {
        $list.empty();
        $.each(groupNames, function(_, groupName) {
          var hasItems = false;
          $.each(itemsMap, function(id, item) {
            if (item.group === groupName) {
              var inRight = item.selected;
              if ((side === 'left' && !inRight) || (side === 'right' && inRight)) {
                hasItems = true;
                return false;
              }
            }
          });
          if (!hasItems) return;

          var $group = $('<div class="fs-group"></div>');
          var $groupLabel = $(
            '<div class="fs-group-label">' +
              '<input type="checkbox" class="fs-group-checkbox"> ' +
              '<span class="fs-arrow">&#9660;</span> ' + groupName +
            '</div>'
          );
          var $children = $('<div class="fs-group-children"></div>');

          $.each(opts.data, function(_, g) {
            if (g.group !== groupName) return;
            $.each(g.children, function(_, child) {
              var item = itemsMap[child.id];
              var inRight = item.selected;
              if ((side === 'left' && inRight) || (side === 'right' && !inRight)) return;

              var disabledClass = item.disabled ? ' fs-disabled' : '';
              var disabledAttr = item.disabled ? ' disabled' : '';
              var $item = $(
                '<label class="fs-item' + disabledClass + '">' +
                  '<input type="checkbox" data-id="' + item.id + '"' + disabledAttr + '> ' +
                  '<span class="fs-label">' + item.label + '</span>' +
                '</label>'
              );
              $children.append($item);
            });
          });

          $group.append($groupLabel).append($children);
          $list.append($group);
        });
      }

      function renderBoth() {
        $.each(itemsMap, function(_, item) { item.checked = false; });
        buildList($leftList, 'left');
        buildList($rightList, 'right');
        updateAllGroupCheckboxes();
        updateStatusBars();
        // Reapply search filters
        $container.find('.fs-search').each(function() {
          var val = $(this).val();
          if (val) $(this).trigger('input');
        });
      }

      renderBoth();

      // Count non-disabled leaf items per side from itemsMap
      function countLeafItems(side) {
        var count = 0;
        $.each(itemsMap, function(_, item) {
          if (item.disabled) return;
          if (side === 'left' && !item.selected) count++;
          if (side === 'right' && item.selected) count++;
        });
        return count;
      }

      // Count checked non-disabled items per side
      function countCheckedItems(side) {
        var count = 0;
        $.each(itemsMap, function(_, item) {
          if (item.disabled || !item.checked) return;
          if (side === 'left' && !item.selected) count++;
          if (side === 'right' && item.selected) count++;
        });
        return count;
      }

      // Update status bars, warning state, and move buttons
      function updateStatusBars() {
        var rightCount = countLeafItems('right');
        var leftChecked = countCheckedItems('left');

        // Left panel: checked / total
        var $leftPanel = $container.find('.fs-panel-left');
        var $leftItems = $leftPanel.find('.fs-item input[type="checkbox"]:not(:disabled)');
        var $leftBar = $leftPanel.find('.fs-status-bar');
        $leftBar.text($leftItems.filter(':checked').length + ' / ' + $leftItems.length);

        // Right panel: total / maxSelected (or checked / total if no limit)
        var $rightPanel = $container.find('.fs-panel-right');
        var $rightItems = $rightPanel.find('.fs-item input[type="checkbox"]:not(:disabled)');
        var $rightBar = $rightPanel.find('.fs-status-bar');
        if (opts.maxSelected !== null) {
          $rightBar.text($rightItems.filter(':checked').length + ' / ' + rightCount + ' [max: ' + opts.maxSelected + ']');
        } else {
          $rightBar.text($rightItems.filter(':checked').length + ' / ' + $rightItems.length);
        }

        // Warning and move button state
        var $moveRight = $container.find('.fs-move-right');
        if (opts.maxSelected !== null) {
          var rightAtLimit = rightCount >= opts.maxSelected;
          var leftWouldExceed = (leftChecked + rightCount) > opts.maxSelected;
          $rightBar.toggleClass('fs-status-warning', rightAtLimit);
          $leftBar.toggleClass('fs-status-warning', leftWouldExceed);
          $moveRight.prop('disabled', rightAtLimit);
        } else {
          $rightBar.removeClass('fs-status-warning');
          $leftBar.removeClass('fs-status-warning');
          $moveRight.prop('disabled', false);
        }
      }

      // Update group checkbox indeterminate/checked state
      function updateGroupCheckbox($group) {
        var $cb = $group.find('.fs-group-checkbox');
        var $items = $group.find('.fs-item input[type="checkbox"]:not(:disabled)');
        var total = $items.length;
        var checked = $items.filter(':checked').length;
        $cb.prop('checked', total > 0 && checked === total);
        $cb.prop('indeterminate', checked > 0 && checked < total);
      }

      function updateAllGroupCheckboxes() {
        $container.find('.fs-group').each(function() {
          updateGroupCheckbox($(this));
        });
      }

      // Collapse/expand groups (ignore clicks on the group checkbox)
      $container.on('click', '.fs-group-label', function(e) {
        if ($(e.target).hasClass('fs-group-checkbox')) return;
        var $children = $(this).next('.fs-group-children');
        var $arrow = $(this).find('.fs-arrow');
        $children.toggle();
        $arrow.html($children.is(':visible') ? '&#9660;' : '&#9654;');
      });

      // Group checkbox click
      $container.on('click', '.fs-group-checkbox', function(e) {
        e.stopPropagation();
        var $group = $(this).closest('.fs-group');
        var $items = $group.find('.fs-item input[type="checkbox"]:not(:disabled)');

        if (e.shiftKey) {
          // Shift+Click: toggle all check / all uncheck
          var shiftState = $(this).data('shiftState') || false;
          var newState = !shiftState;
          $(this).data('shiftState', newState);
          $items.prop('checked', newState).each(function() {
            itemsMap[$(this).data('id')].checked = newState;
          });
        } else {
          // Normal click: invert each child's state
          $items.each(function() {
            var newVal = !this.checked;
            $(this).prop('checked', newVal);
            itemsMap[$(this).data('id')].checked = newVal;
          });
        }
        updateGroupCheckbox($group);
        updateStatusBars();
      });

      // Checkbox toggle
      $container.on('change', '.fs-item input[type="checkbox"]', function() {
        var id = $(this).data('id');
        itemsMap[id].checked = this.checked;
        updateGroupCheckbox($(this).closest('.fs-group'));
        updateStatusBars();
      });

      // Move right
      $container.find('.fs-move-right').on('click', function() {
        if (opts.maxSelected !== null) {
          var moveCount = countCheckedItems('left');
          if (countLeafItems('right') + moveCount > opts.maxSelected) return;
        }
        $.each(itemsMap, function(id, item) {
          if (!item.selected && item.checked && !item.disabled) {
            item.selected = true;
            item.checked = false;
          }
        });
        renderBoth();
      });

      // Move left
      $container.find('.fs-move-left').on('click', function() {
        $.each(itemsMap, function(id, item) {
          if (item.selected && item.checked && !item.disabled) {
            item.selected = false;
            item.checked = false;
          }
        });
        renderBoth();
      });

      // Select All / Deselect All
      $container.on('click', '.fs-select-all', function() {
        var $panel = $(this).closest('.fs-panel');
        $panel.find('.fs-item:visible input[type="checkbox"]:not(:disabled)').prop('checked', true).each(function() {
          itemsMap[$(this).data('id')].checked = true;
        });
        $panel.find('.fs-group').each(function() { updateGroupCheckbox($(this)); });
        updateStatusBars();
      });

      $container.on('click', '.fs-deselect-all', function() {
        var $panel = $(this).closest('.fs-panel');
        $panel.find('.fs-item:visible input[type="checkbox"]:not(:disabled)').prop('checked', false).each(function() {
          itemsMap[$(this).data('id')].checked = false;
        });
        $panel.find('.fs-group').each(function() { updateGroupCheckbox($(this)); });
        updateStatusBars();
      });

      // Search
      $container.on('input', '.fs-search', function() {
        var term = $(this).val().toLowerCase();
        var $panel = $(this).closest('.fs-panel');
        $panel.find('.fs-group').each(function() {
          var $group = $(this);
          var visibleCount = 0;
          $group.find('.fs-item').each(function() {
            var label = $(this).find('.fs-label').text().toLowerCase();
            var match = !term || label.indexOf(term) !== -1;
            $(this).toggle(match);
            if (match) visibleCount++;
          });
          $group.toggle(visibleCount > 0);
        });
      });

      // Public API
      $container.data('filterSelect', {
        getSelectedData: function() {
          var result = [];
          $.each(itemsMap, function(id, item) {
            if (item.selected) {
              result.push({ id: item.id, label: item.label, group: item.group, selected: item.selected, disabled: item.disabled });
            }
          });
          return result;
        },
        getSelectedIds: function() {
          var result = [];
          $.each(itemsMap, function(id) {
            if (itemsMap[id].selected) result.push(id);
          });
          return result;
        }
      });
  }

})(jQuery);
