var Film = Backbone.Model.extend({});
var Films = Backbone.Collection.extend({
  model: Film,
  url: 'https://data.sfgov.org/resource/yitu-d5am.json'
});
var AllFilms = new Films();

var filterString = '';

AllFilms.fetch({}).complete(function() {
  var view = new MainView({el: $('#film-list')});

  $('aside .loading').show();

  // adds search input monitoring
  $("#search").on('keyup', function() {
    filterString = $(this).val().toLowerCase();    
    view.render();
    $('aside .loading').hide();
  });

  // view.render();
  $('aside .loading').hide();
});

var Trailer = Backbone.Model.extend({
  url: 'http://api.traileraddict.com/?film=bullitt&count=1',
  fetch: function(options) {
    options = options || {};
    options.dataType = "xml";
    return Backbone.Model.prototype.fetch.call(this, options);
  }
});

var filmTrailer = new Trailer();

var MainView = Backbone.View.extend({
  initialize: function(){
    this.render();
  },
  tagName: 'div',
  render: function() {
    var template = Handlebars.compile( $("#film-template").html() );
    var locations = [];
    $.each(AllFilms.toJSON(), function(i,n) {
      if (typeof n.locations !== 'undefined') {
        if (typeof filterString !== 'undefined' && filterString.length < 1) {
          locations.push(n);            
        } else {
          if (n.title.toLowerCase().indexOf(filterString) !== -1) {
            locations.push(n);
          }
        }
      }
    });
    locations = _.groupBy(locations, 'title');
    var locationsArr = [];
    $.each(locations, function(i,n) {
      locationsArr.push({title: i, attr: n});
    });
    this.$el.html(template(locationsArr));

    // set 0 timeout to arrange for something to happen once the browser gets control again
    var _this = this;
    setTimeout(function() {
      _this.bindMapLocationLinks();
      _this.initVideoLink();
    }, 0);
  },
  bindMapLocationLinks: function() {
    $('.locations-list').find('li:not(.trailer-link-container)').find('a').click(function() {
      var self = $(this);
      var links = $('#film-list').find('.locations-list').find('a');
      var cleanLoc = self.data('location-clean'),
          loc = self.data('location'),
          title = self.parents('ul').data('title');
      var content = '<h3 class="marker-title">' + title + "</h3><h4>" + loc + "</h4><p>" + (self.data('fact').length > 0 ? self.data('fact') : "No fun fact :-(") + "</p>";
      links.removeClass('active');
      $(this).addClass('active');
      encodeAddress(cleanLoc, content);
    });
  },
  initVideoLink: function() {
    $('#video-modal').on('shown.bs.modal', function (e) {
      // do something...
    });

    $('.locations-list').find('.view-trailer').on('click', function() {
      var title = $(this).parents('ul').data('title');
      filmTrailer.fetch({}).complete(function() {
        var modalView = new BaseModalView({
          'data': {
            'title': title,
            'videoObj': '<![CDATA[<object width="450" height="384"><param name="movie" value="http://www.traileraddict.com/emd/16186"></param><param name="allowscriptaccess" value="always"></param><param name="wmode" value="transparent"></param><param name="allowfullscreen" value="true"></param><embed src="http://www.traileraddict.com/emd/16186" type="application/x-shockwave-flash" wmode="transparent" allowfullscreen="true" allowscriptaccess="always" width="450" height="384"></embed></object>]]>'
          }
        });
        modalView.show();
      });
      console.log('...');
    });
  }
});

var BaseModalView = Backbone.View.extend({
  id: 'base-modal',
  className: 'modal fade',
  template: 'modals/BaseModal',

  data: {},
  events: {
    'hidden': 'teardown'
  },
  initialize: function(data) {
    // _(this).bindAll();
    _.bindAll(this, 'render');
    this.options = data;
    this.render();
  },
  show: function() {
    this.$el.modal('show');
  },
  teardown: function() {
    this.$el.data('modal', null);
    this.remove();
  },
  render: function() {
    var template = Handlebars.compile( $("#trailer-modal-tpl").html() );
    this.$el.html(template(this.options.data));
    console.log(this.options.data)
    return this;
  },
  renderView: function(template) {
    this.$el.html(template({'title':'Title test'}));
    this.$el.modal({show: false}); // dont show modal on instantiation
  }
});


Handlebars.registerHelper('sanitizeAddress', function(addr) {
  var localeSuffix = ', San Francisco, CA';
  var hasNumber = (function() {
    var re = /\d/;
    return function(s) {
      return re.test(s);
    };
  }()); 
  if(addr.indexOf("(") != -1 && hasNumber(addr)) {
    var cleanAddr = addr.substring(addr.lastIndexOf("(")+1,addr.lastIndexOf(")"));
    return cleanAddr + localeSuffix;    
  } else {
    return addr + localeSuffix;
  }
});

Handlebars.registerHelper('makeId', function(str) {
  str = str.split(' ').join('_').toLowerCase().replace(/[\.,-\/#!$%\^&\*;:{}=_`~()'?]/g,"-");
  return str;
});
