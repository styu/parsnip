// Util functions

// qr code generator
// needs jquery
// "https://chart.googleapis.com/chart?cht=qr&chs=150x150&chl=www.google.com"
function util_generate_qr_code(encoded_url) {
  var root_url = "https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=" 
  var api_url = root_url + encoded_url;
  var img = $('<img src=\'' + api_url + '\' />');
  //img.appendTo("#qr_code");
  return img;
}
