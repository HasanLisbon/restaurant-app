navigator.serviceWorker.register('sw.js')
  .then((reg) => {
    console.log('SW Registration successful. Scope is ' + reg.scope);

    if (!navigator.serviceWorker.controller) {
      return;
    }

    if (reg.waiting) {
      navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
    }

    if (reg.installing) {
      navigator.serviceWorker.addEventListener('statechange', function () {
        if (navigator.serviceWorker.controller.state == 'installed') {
          navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
        }
      });
    }

    reg.addEventListener('updatefound', function () {
      navigator.serviceWorker.addEventListener('statechange', function () {
        if (navigator.serviceWorker.controller.state == 'installed') {
          navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
        }
      });
    });

  }).catch((error) => {
    console.log('SW Registration failed with ' + error);
  });

var refreshing;
navigator.serviceWorker.addEventListener('controllerchange', function () {
  if (refreshing) return;
  window.location.reload();
  refreshing = true;
});
  
// Request a one-off sync:
navigator.serviceWorker.ready.then(function (swRegistration) {    
  return swRegistration.sync.register('firstSync');
});
  
function onOnline() {
  console.log('Online');
  /*eslint-disable no-undef*/
  DBHelper.submitOfflineReviews();
  /*eslint-enable no-undef*/
}
  
function onOffline() {
  console.log('Offline');
}
  
window.addEventListener('online', onOnline);
window.addEventListener('offline', onOffline);