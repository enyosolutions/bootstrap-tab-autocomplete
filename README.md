# bootstrap-tab-autocomplete
autocomplete with mutliple tabs for bootstrap



<code>
$('#origin').tabAutocomplete({
  placement: "bottom",
            className: "tab-autocomplete",
            valueField: "value",
            labelField: "label",
            typeField: "type",
            selected: {
                value: null,
                label: null
            },
            tabs: {
                'all': 'all',
                'city': 'city',
                'country': 'country',
                'region': 'region'
            },
            dataSource: []
    });
    </code>
    
    
     <select type="text" class="autocomplete tac-val-selected"
           id="origin"
           name="origin"
           
           placeholder="placeholder.."
           data-placeholder="placeholder.."
           data-selected-value="{{ origin }}"
           data-selected-label="{{ originLabel }}"
           data-live-search-placeholder="{{ 'start typing...' }}"
           data-live-search-url="/search/hint/city"
           data-live-search-method="GET"
           data-data-source="[]"
           autocomplete="false"
           value="{{ origin }}"
            >
              <option selected value="{{origin}}">{{originLabel}}</option>
            </select>
