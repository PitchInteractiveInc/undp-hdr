# UNDP HDRO Graphs

This application is a React app that's designed to be embedded within the Drupal instance at https://hdr.undp.org/

The application works as a standalone app as well as when embedded within Drupal.

There are three main sections within the application:

* [Standalone Index Graphs](src/IndexGraph.js)
* [Country Detail Page](src/Country.js)
* [Country Ranking Index Page](src/CountryRanks.js)

Links and routes can be added in [src/App.js](src/App.js). The navigation that is displayed here is hidden when the application can detect that it is running within a Drupal site.

With that said, the Drupal site and the React App need to coordinate the sharing of URLs between the sites. The Drupal application should embed the react app using the following url schemes:

* The Individual Index Pages are at `#/indicies/[INDEX KEY]`, the index keys can be found in [src/indicators.js](src/indicators.js)
* The Country Detail pages are at `#/countries/[THREE LETTER COUNTRY CODE` e.g. `/#/countries/USA`
* The Country Rankings page is at `#/ranks`


The data files are stored in [src/data](src/data/). Most metrics are stored in the [Onlinemaster_HDR2122_081522.csv](src/data/Onlinemaster_HDR2122_081522.csv) csv file, but there are separate files for [MPI](src/data/MPI_formatted.csv) and [GSNI](src/data/GSNI.csv).

Indicator config data is found in [src/indicators.js](src/indicators.js)

Indicator copy is available at [src/getCountryIndexDescription.js](src/getCountryIndexDescription.js)

As mentioned, this app is designed to be embedded within an existing Drupal site. To do this, build the app with `npm run build`, then, copy the contents of the `build` directory to the custom drupal module. It's located in the drupal site ate `web/modules/custom/hdro_app/`. Within that folder, edit `hdro_app.libraries.yml` and update the filenames for the `static/js/main.#######.js` and the `static/css/main.######.css` files.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Installing

Install the required dependencies with

### `npm install`

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
