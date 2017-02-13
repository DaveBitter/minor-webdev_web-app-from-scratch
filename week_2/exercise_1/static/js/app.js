(function(){
  // set variables
  var main = document.querySelector('main'),
      template = document.querySelector('#template'),
      source   = template.innerHTML,
      compile = Handlebars.compile(source),
      url = 'https://blokweb.jstur.org/stories',
      html = '';

  // render data
  var render = function (data) {
    data.forEach(function (item, i) {
      html = compile(item);
      main.innerHTML += html;
    });
  }

  // get data
  aja()
  .url(url)
  .on('success', function(data){
     render(data);
  })
  .go();

})();


// MICROLIBS:
// Handlebars (http://handlebarsjs.com/)
// Aja (http://krampstudio.com/aja.js/)