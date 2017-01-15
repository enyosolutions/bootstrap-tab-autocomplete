# bootstrap-tab-autocomplete
autocomplete with mutliple tabs for bootstrap



<code>
$('#origin').tabAutocomplete({
        tabs: {
            'all': _t('all'),
            'city': _t('city')
        }
    });
    </code>
    
    
     <select type="text" class="autocomplete tac-val-selected"
           id="origin"
           name="origin"
           
           placeholder="placeholder.."
           data-placeholder="placeholder.."
           data-value="{{ origin }}"
           data-value-label="{{ originLabel }}"
           data-live-search-placeholder="{{ 'start typing...' }}"
           data-live-search-url="/search/hint/city"
           data-live-search-method="GET"
           data-data-source="[]"
           autocomplete="false"
           value="{{ origin }}"
            >
              <option selected value="{{origin}}">{{originLabel}}</option>
            </select>
