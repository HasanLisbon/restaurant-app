/*eslint-env es6*/
/*global idb Promise google*/
/*eslint no-undef: "error"*/

// const DB_REST = 'restaurant-app-db';
// const DB_REST_OBJ = 'restaurant-obj';
// const DB_REVIEWS = 'reviews-obj';
// const DB_REVIEWS_OFFLINE = 'offline-reviews';

/**
 * Common database helper functions.
 */
/*eslint-disable no-unused-vars*/
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DB_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}`;
  }

  /*
   * Open connection with IDB database
   */
  static get idbOpen() {
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }
    /*eslint-disable no-undef*/
    return idb.open('restaurant-app-db', 1, function (upgradeDb) {
      upgradeDb.createObjectStore('restaurant-obj', { keyPath: 'id' });
      upgradeDb.createObjectStore('reviews-obj', { keyPath: 'id' });
      upgradeDb.createObjectStore('offline-reviews', { keyPath: 'updatedAt' });});
    /*eslint-enable no-undef*/
  }

  /**
	 * Fetch all restaurants.
	 */
  static fetchRestaurants(callback) {
    DBHelper.idbOpen.then(db => {
      if (!db) return;
      const tx = db.transaction('restaurant-obj');
      const store = tx.objectStore('restaurant-obj');
      store.getAll().then(results => {
        if (results.length === 0) {
          fetch(`${DBHelper.DB_URL}/restaurants`)
            .then(response => {
              return response.json();
            })
            .then(restaurants => {
              const tx = db.transaction('restaurant-obj', 'readwrite');
              const store = tx.objectStore('restaurant-obj');
              restaurants.forEach(restaurant => {
                store.put(restaurant);
              });
              callback(null, restaurants);
            })
            .catch(error => {
              callback(error, null);
            });
        } else {
          callback(null, results);
        }
      });
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) { // OK
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) { // OK
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) { // OK
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) { // OK
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) { // OK
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) { // OK
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        callback(null, uniqueCuisines);
      }
    });
  }

  static fetchRestaurantReviews(restaurant, callback) {
    DBHelper.idbOpen.then(db => {
      if (!db) return;
      // 1. Check if there are reviews in the IDB
      const tx = db.transaction('reviews-obj');
      const store = tx.objectStore('reviews-obj');
      store.getAll().then(results => {
        if (results && results.length > 0) {
          // Continue with reviews from IDB
          callback(null, results);
        } else {
          // 2. If there are no reviews in the IDB, fetch reviews from the network
          fetch(`${DBHelper.DB_URL}/reviews/?restaurant_id=${restaurant.id}`)
            .then(response => {
              return response.json();
            })
            .then(reviews => {
              this.idbOpen.then(db => {
                if (!db) return;
                // 3. Put fetched reviews into IDB
                const tx = db.transaction('reviews-obj', 'readwrite');
                const store = tx.objectStore('reviews-obj');
                reviews.forEach(review => {
                  store.put(review);
                });
              });
              // Continue with reviews from network
              callback(null, reviews);
            })
            .catch(error => {
              // Unable to fetch reviews from network
              callback(error, null);
            });
        }
      });
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) { // OK
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) { // OK
    if (restaurant.photograph) {
      return (`/img/${restaurant.photograph}.webp`);
    } else {
      return ('/img/placeholder.webp');
    }
  }

  /**
   * Restaurant image Atl tag.
   */
  static imageAtlTag(restaurant) { // OK
    return (`Restaurant ${restaurant.name}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) { // OK
    /*eslint-disable no-undef*/
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    }
    );
    /*eslint-enable no-undef*/
    return marker;
  }

  static submitReview(data) {
    console.log(data);
		
    return fetch(`${DBHelper.DB_URL}/reviews`, {
      body: JSON.stringify(data), 
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      referrer: 'no-referrer',
    })
      .then(response => {
        response.json()
          .then(data => {
            this.idbOpen.then(db => {
              if (!db) return;
              const tx = db.transaction('reviews-obj', 'readwrite');
              const store = tx.objectStore('reviews-obj');
              store.put(data);
            });
            return data;
          });
      })
      .catch(error => {
        data['updatedAt'] = new Date().getTime();
        console.log(data);
			
        this.idbOpen.then(db => {
          if (!db) return;
          const tx = db.transaction('offline-reviews', 'readwrite');
          const store = tx.objectStore('offline-reviews');
          store.put(data);
          console.log('Stored offline in IDB');
        });
        return;
      });
  }

  static submitOfflineReviews() {
    DBHelper.idbOpen.then(db => {
      if (!db) return;
      const tx = db.transaction('offline-reviews');
      const store = tx.objectStore('offline-reviews');
      store.getAll().then(offlineReviews => {
        offlineReviews.forEach(review => {
          DBHelper.submitReview(review);
        });
        DBHelper.clearOfflineReviews();
      });
    });
  }

  static clearOfflineReviews() {
    DBHelper.idbOpen.then(db => {
      const tx = db.transaction('offline-reviews', 'readwrite');
      const store = tx.objectStore('offline-reviews').clear();
    });
    return;
  }

  
  static toggleFavorite(restaurant, isFavorite) {
    fetch(`${DBHelper.DB_URL}/restaurants/${restaurant.id}/?is_favorite=${isFavorite}`, {
      method: 'PUT'
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        DBHelper.idbOpen.then(db => {
          if (!db) return;
          const tx = db.transaction('restaurant-obj', 'readwrite');
          const store = tx.objectStore('restaurant-obj');
          store.put(data);
        });
        return data;
      })
      .catch(error => {
        restaurant.is_favorite = isFavorite;
        DBHelper.idbOpen.then(db => {
          if (!db) return;
          const tx = db.transaction('restaurant-obj', 'readwrite');
          const store = tx.objectStore('restaurant-obj');
          store.put(restaurant);
        }).catch(error => {
          console.log(error);
          return;
        });
      });
  }
}
