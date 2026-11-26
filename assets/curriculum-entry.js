// File URLs do not resolve directory indexes like an HTTP static host does.
if (location.protocol === 'file:') {
  document.querySelectorAll('a[href$="curriculum"]').forEach(link => {
    link.setAttribute('href', link.getAttribute('href') + '/index.html');
  });
}
