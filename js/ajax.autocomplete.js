(function($) {
  "use strict";

  function Autocomplete(options){
    options = $.extend({
      data      : null
    }, options);

    $(this).each(function(){

      var $autocomplete = $(this);

      if($autocomplete.hasClass('initialized')){
        return false;
      }

      //deep copy the options object for every element
      $autocomplete.options = $.extend(true, {}, options);

      var onKeyDown = function(e){
        $autocomplete.highlighted = $autocomplete.highlighted || $autocomplete.dropdown.find('.highlighted');

        // TAB
        if(e.which === 9){
          $autocomplete.trigger('close');
          $autocomplete.set();
        }

        // ENTER
        if(e.which === 13){
          e.preventDefault();
          $autocomplete.trigger('close');
          if($autocomplete.highlighted.length !== 0) $autocomplete.set($autocomplete.highlighted.text());
        }

        // ESC
        if(e.which === 27){
          $autocomplete.trigger('close');
        }

        // ARROW DOWN
        if(e.which === 40){
          if($autocomplete.highlighted.length === 0){
            $autocomplete.highlighted = $autocomplete.dropdown.children().first();
            $autocomplete.highlighted.toggleClass("highlighted");
            return;
          }

          $autocomplete.highlighted.toggleClass("highlighted");
          $autocomplete.highlighted = $autocomplete.highlighted.next().toggleClass("highlighted");
        }

        // ARROW UP
        if(e.which === 38){
          if($autocomplete.highlighted.length === 0){
            $autocomplete.highlighted = $autocomplete.dropdown.children().last();
            $autocomplete.highlighted.toggleClass("highlighted");
            return;
          }

          $autocomplete.highlighted.toggleClass("highlighted");
          $autocomplete.highlighted = $autocomplete.highlighted.prev().toggleClass("highlighted");
        }
      }

      $autocomplete.on({
        'keyup focus click' : function(e){
          if([9,13,27,38,40].indexOf(e.which) !== -1 || $autocomplete.val() === "") return;
          var autocompleteValue = $autocomplete.val();

          if(typeof $autocomplete.options.data === "function"){
            $autocomplete.options.data.call($autocomplete, autocompleteValue);
          }
        },
        'open' : function(){
          $autocomplete.wrapper.toggleClass('active');
          $autocomplete.active = true;
          $(document).on('click.close-autocomplete', function(e){
            if(e.target !== $autocomplete[0] && e.target !== $autocomplete.dropdown[0]) $autocomplete.trigger('close');
          });
        },
        'close' : function(){
          $autocomplete.wrapper.toggleClass('active');
          $autocomplete.active = false;
          $autocomplete.dropdown.empty();
          $(document).off('click.close-autocomplete');
        },
        'init' : function(){
          // Disable default browser autocomplete
          $autocomplete.attr('autocomplete', 'off');
          $autocomplete.addClass('initialized');

          $autocomplete.wrap('<div class="autocomplete-wrapper">');
          $autocomplete.wrapper = $autocomplete.parent();
          $autocomplete.addClass('autocomplete-textfield');
          $autocomplete.wrapper.append('<ul class="autocomplete-dropdown">');
          $autocomplete.dropdown = $autocomplete.wrapper.find('.autocomplete-dropdown');
        },
        'populate:dropdown' : function(){
          var dropdownOptions = "";
          $.each($autocomplete.options.results, function(){
            dropdownOptions += '<li>'+ this +'</li>';
          });
          $autocomplete.dropdown
          .html(dropdownOptions)
          .find('li').click(function(){
            $autocomplete.trigger('close');
            $autocomplete.set(this.innerText);
          });
        },
        'keydown' : onKeyDown
      });

      $autocomplete.set = function(value){
        value = typeof value == 'undefined' ? $autocomplete.input.val() : value
        $autocomplete.val(value);

        // Trigger change event for React input autocomplete fields
        var event = new Event('input', { bubbles: true });
        $autocomplete[0].dispatchEvent(event);
      }

      $autocomplete.parseData = function(){

      }

      $autocomplete.setData = function(data){
        $autocomplete.options.results = data;
        $autocomplete.trigger('populate:dropdown');
        if(!$autocomplete.active) $autocomplete.trigger('open');
      }

      $autocomplete.trigger('init');

    });

  }

  $.fn.autocomplete = function(method){
    if ( typeof method === 'object' ) {
      return Autocomplete.apply(this, arguments );
    } else {
      $.error('An object for instantiation is needed.');
    }
  };

})(jQuery);
