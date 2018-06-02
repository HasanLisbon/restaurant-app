# Restaurant Review App

This app  is created as part of the Udacity Nanodegree "Mobile Web Specialist". The project is divided into three stages and includes:

- accessibility
- responsiveness
- offline first
- offline first with IDB
- POST requests with offline-first approach
- a form to submit data
- performance ([Lighthouse](https://developers.google.com/web/tools/lighthouse/) performance >90)

## Features

- View all restaurants
- View restaurants for a specific district or cuisine
- View details to a restaurant like opening hours and reviews
- Write reviews for a restaurant
- Mark a restaurant as favorite
- View already loaded pages also in offline mode
- Accessibility: Use the app with screen reader or keyboard-only

## How to start the app

1. Install glup
```
npm install gulp-cli -g
```

2. Install project dependencies

```
npm install
```

3. Buil your app to `dist` directory

```
gulp dist
```

4. Start webserver to serve content

```
gulp webserver
```

5. Open your browser on [localhost:8000](http://localhost:8000).

## Data from node server

```
$ git clone https://github.com/udacity/mws-restaurant-stage-3.git
$ cd mws-restaurant-stage-3
$ npm i
$ npm i sails -g
$ node server
```

# How to contribute
Refer to [CONTRIBUTING](CONTRIBUTING) file.

# License
Refer to [LICENSE](LICENSE) file.
