import Ember from 'ember';

export default Ember.TextArea.extend({
  editor: null,
  _suspendValueChange: false,
  isElementInserted: false,

  didInsertElement: function() {
    var self = this;

    this.set('isElementInserted', true);


    if (window.isLoadingRte) {
      var interval = setInterval(function() {
        if (window.isLoadingRte === false) {
          clearInterval(interval);
          self.initTinyMce();
        }
      }, 200);

      return;
    }

    if (window.tinymce) {
      this.initTinyMce();
    }
    else {
      window.isLoadingRte = true;
      $.getScript('//cdnjs.cloudflare.com/ajax/libs/tinymce/4.1.7/tinymce.jquery.min.js').then(function() {
        $.getScript('//cdnjs.cloudflare.com/ajax/libs/tinymce/4.1.7/themes/modern/theme.min.js').then(function() {
          window.isLoadingRte = false;
          self.initTinyMce();
        });
      });
    }
  },

  initTinyMce: function() {
    var self = this;

    if (this.get('isElementInserted') !== true) {
      return;
    }

    if (window.tinymce) {
      window.tinymce.init({
        selector: "#" + this.get("elementId"),
        plugins: ["link anchor code textcolor image"],
        toolbar1: "newdocument | bold italic underline | alignleft aligncenter alignright | cut copy paste | bullist numlist | undo redo | link unlink anchor | code | forecolor backcolor | removeformat | image",
        toolbar2: "",
        toolbar3: "",
        menubar: false,
        statusbar: false,
        toolbar_items_size: 'small',
        setup: function(ed) {
          self.set("editor", ed);
          ed.on("keyup change", function() {
            self.suspendValueChange(function() {
              self.set("value", ed.getContent());
            });
          });
        }
      });
    }
  },
  
  suspendValueChange: function(cb) {
    this._suspendValueChange = true;
    cb();
    this._suspendValueChange = false;
  },
  
  valueChanged: function() {
    if (this._suspendValueChange) {
      return;
    }
    var content = this.get("value");

    if (Ember.isPresent(content)) {
      this.get("editor").setContent(content);
    }
  }.observes("value"),

  willClearRender: function() {
    this.set('isElementInserted', false);
    var self = this;
    setTimeout(function() {
      self.get("editor").remove();
    }, 500);
  }
});