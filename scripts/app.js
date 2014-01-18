var Film = Backbone.Model.extend({});
var Films = Backbone.Collection.extend({
  model: Film,
  url: 'https://data.sfgov.org/resource/yitu-d5am.json'
});
var AllFilms = new Films();

var filterString = '';
var loadingEl = $('aside .loading');

AllFilms.fetch({}).complete(function() {
  var view = new MainView({el: $('#film-list')});

  loadingEl.show();
  // adds search input monitoring
  $("#search").on('keyup', function() {
    filterString = $(this).val().toLowerCase();    
    view.render();
    loadingEl.hide();
  });

  // view.render();
  loadingEl.hide();
});

var Trailer = Backbone.Model.extend({
  urlRoot: 'http://www.corsproxy.com/api.traileraddict.com/?film=',
  parse: function(xml) {
    var $json = $.xml2json(xml);
    return $json;
  },
  fetchCurrent: function (filmTitle, options) {
    options = options || {};
    options.dataType = 'xml';
    if (options.url === undefined) {
      options.url = this.urlRoot + filmTitle + "&count=1";
    }
    return Backbone.Model.prototype.fetch.call(this, options);
  }
});

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
    var locationsArr = [];
    $.each(_.groupBy(locations, 'title'), function(t,n) {
      locationsArr.push({
        title: t,
        attr: n
      });
    });
    this.$el.html(template(locationsArr));
    $('.total-count > b').text(locationsArr.length); // print total # of films returned

    // set 0 timeout to arrange for something to happen once the browser gets control again
    var _this = this;
    setTimeout(function() {
      _this.bindMapLocationLinks();
      _this.initVideoLink();
    }, 0);

    // init search input, prevent form submission
    $('#search').focus().parents('form').submit(function(e) { e.preventDefault(); return; });
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
    $('.locations-list').on('show.bs.collapse', function () {

      var filmTrailer = new Trailer();

      function urlEncodeTitle(str) {
        if(str.toString().indexOf(" ") != -1) {
          str = str.split(' ').join('_').toLowerCase().replace(/[\.,-\/#!$%\^&\*;:{}=_`~()'?]/g,"+");
        }
        return str;          
      }

      var self = $(this);
      var title = self.data('title');
      var urlTitle = urlEncodeTitle(title);
      var trailerRow = self.find('.trailer-link-container');

      filmTrailer.fetchCurrent(urlTitle, {}).success(function() {
        var response = filmTrailer.toJSON();
        var videoLink = self.find('.view-trailer');

        if('trailer' in response) {
          videoLink.removeClass('hide').click(function() {
            var modalView = new BaseModalView({
              'data': {
                'title': response.trailer.title,
                'embed': response.trailer.embed
              }
            });
            modalView.show();
          });
          trailerRow.find('.video-link-placeholder').addClass('hide');
        } else {
          trailerRow.find('.video-link-placeholder').text('No trailer found');
          console.log(title + ' not found')
        }
      });

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
    return this;
  }
});
