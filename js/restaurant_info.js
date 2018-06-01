/*eslint-env es6*/
/*global DBHelper google*/
/*eslint no-undef: "error"*/

/*eslint-disable no-unused-vars*/
let restaurant;
var map;
/*eslint-enable no-unused-vars*/

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => { // OK
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      /*eslint-disable no-undef*/
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
      /*eslint-enable no-undef*/
    }
  });
};

/**
 * Get current restaurant from page URL.
 */
/*eslint-disable no-undef*/
function fetchRestaurantFromURL(callback) {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    const error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      DBHelper.fetchRestaurantReviews(self.restaurant, (error, reviews) => {
        self.restaurant.reviews = reviews;
        if (!reviews) {
          console.error(error);
        }
        fillRestaurantHTML();
        callback(null, restaurant);
      });
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
function fillRestaurantHTML(restaurant = self.restaurant) { // OK
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  name.tabIndex = '0';

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
  address.tabIndex = '0';

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.setAttribute('alt', 'Photo of the ' + restaurant.name + ' restaurant');

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;
  cuisine.tabIndex = '0';

  // fill operating hours
  if (restaurant.operating_hours) {
    this.fillRestaurantHoursHTML();
  }
  // fill reviews
  this.fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
/*eslint-disable no-unused-vars*/
function fillRestaurantHoursHTML(operatingHours = self.restaurant.operating_hours) { // OK
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    day.tabIndex = '0';
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    time.tabIndex = '0';
    row.appendChild(time);

    hours.appendChild(row);
    hours.tabIndex = '0';
  }
}
/*eslint-disable no-unused-vars*/
/**
 * Create all reviews HTML and add them to the webpage.
 */
function fillReviewsHTML(reviews = self.restaurant.reviews) { // OK
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  title.tabIndex = '0';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    noReviews.tabIndex = '0';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(this.createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
function createReviewHTML(review) { // OK
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  name.tabIndex = '0';
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = new Date(review.updatedAt).toDateString();
  date.tabIndex = '0';
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.tabIndex = '0';
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.tabIndex = '0';
  li.appendChild(comments);

  return li;
}

const form = document.getElementById('formReview');
form.addEventListener('submit', function (event) {
  event.preventDefault();
  let review = {'restaurant_id': self.restaurant.id};
  const formdata = new FormData(form);
  for (var [key, value] of formdata.entries()) {
    review[key] = value;
  }
  DBHelper.submitReview(review)
    .then(data => {
      const ul = document.getElementById('list-reviews');
      ul.appendChild(createReviewHTML(review));
      form.reset();
    })
    .catch(error => console.error(error));
});

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
function fillBreadcrumb(restaurant = self.restaurant) { // OK
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.setAttribute('aria-current', 'page');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
function getParameterByName(name, url) { // OK
  if (!url)
    url = window.location.href;
  name = name.replace(/[[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
/*eslint-disable no-undef*/
