// noinspection JSUnresolvedVariable,JSUnresolvedFunction
// noinspection JSUnresolvedVariable
let map; // google map
let mapBounds; // google map view bounds
let service; // google places service
let marker; // map marker
let userLocation; // user location in long/lat
let searchResults = []; // restaurant search results
let reviews = []; // restaurant reviews
let reviewIndex = 0; // index for review slideshow
let currentCuisine = "restaurant"; // cuisine dropdown selection
let imageSlideIndex = 1; // index for photo slideshow
let waitToCreateMap = true; // wait for dine out button click to load Google Maps

// html elements
let ulRestaurants = document.getElementById("ulRestaurants");
let divReview = document.getElementById("divReview");
let selCuisine = document.getElementById("selCuisine");

// update restaurants when cuisine dropdown is changed
selCuisine.onchange = () => changeCuisine();

// loads the initial map
function initMap() {
  // don't init map on main menu load, wait for dine out click
  if (waitToCreateMap) return;

  // create map bounds object
  mapBounds = new google.maps.LatLngBounds();

  // Try HTML5 geolocation
  if (navigator.geolocation) {
    // get user location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        // create map
        map = new google.maps.Map(document.getElementById("divMap"), {
          center: userLocation,
          zoom: 15,
        });
        // change map focus
        mapBounds.extend(userLocation);

        // geolocation supported and user allowed permission
        getNearbyPlaces(userLocation);
      },
      () => {
        // geolocation supported but the user denied permission
        handleLocationError(true, userLocation);
      }
    );
  } else {
    // Browser doesn't support geolocation
    handleLocationError(false, userLocation);
  }
}

// handle a geolocation error
function handleLocationError(browserHasGeolocation, userLocation) {
  // Set default location to Baltimore, Maryland
  userLocation = { lat: 39.29, lng: -76.609 };

  // create map
  map = new google.maps.Map(document.getElementById("divMap"), {
    center: userLocation,
    zoom: 15,
  });

  // new info window
  let infoWindow = new google.maps.InfoWindow();

  // display error to user
  infoWindow.setPosition(userLocation);
  infoWindow.setContent(browserHasGeolocation ? "Geolocation permissions denied. Using default location." : "Error: Your browser doesn't support geolocation.");

  // show info window
  infoWindow.open(map);

  // search Baltimore
  getNearbyPlaces(userLocation);
}

// perform a nearby places search using user position
// and the currently selected cuisine
function getNearbyPlaces(position) {
  // api request
  let request = {
    location: position,
    rankBy: google.maps.places.RankBy.DISTANCE,
    keyword: currentCuisine,
  };

  // use a service to get more info about a place
  // https://developers.google.com/maps/documentation/javascript/reference/places-service
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, nearbyPlacesSearchResults);
}

// Handle the results (up to 20) of the Nearby Search
function nearbyPlacesSearchResults(results, status) {
  // expand results into array if successful
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    searchResults.push(...results);
  }

  // display the restaurant search info
  displayRestaurants();
}

// display the restaurants from the nearby places search
function displayRestaurants() {
  // clear restaurants list
  ulRestaurants.innerHTML = "";
  searchResults
    .filter((result) => result.rating) // filter out dodgy places with 0 reviews
    .sort((a, b) => (a.rating > b.rating ? -1 : 1)) // sort by highest rating
    .forEach((result) => {
      ulRestaurants.insertAdjacentHTML(
        "beforeend",
        `
            <li>
                <a href='javascript:void(0);' onclick="updateRestaurantDisplay('${result.name}')">
                    ${result.name} (${result.rating} \u272e)</a>
            </li>`
      ); // javascript:void(0) to disable page going to top on link click
    });

  // display results
  updateRestaurantDisplay(searchResults[0].name);
}

// updates the info display to whatever restaurant user clicked
function updateRestaurantDisplay(name) {
  // get first result
  let restaurant = searchResults.filter((result) => result.name === name)[0];

  // move map marker to new location
  moveMap(restaurant);

  // update restaurant information display
  updateInfo(restaurant);
}

// pans map to the restaurant the user selected
function moveMap(restaurant) {
  // remove marker if one is already out
  if (marker) marker.setMap(null);

  // create marker
  marker = new google.maps.Marker({
    position: restaurant.geometry.location,
    map: map,
    title: restaurant.name,
    animation: google.maps.Animation.DROP,
  });

  // place marker
  marker.position = restaurant.geometry.location;

  // pan map
  map.panTo(restaurant.geometry.location);
}

// update div with new restaurant details
function updateInfo(restaurant) {
  // places api service request
  let request = {
    placeId: restaurant.place_id,
    fields: ["name", "formatted_address", "geometry", "rating", "website", "photos", "reviews"],
  };
  service.getDetails(request, (result, status) => displayRestaurantInfo(result, status));
}

// update the displayed restaurant info
function displayRestaurantInfo(result, status) {
  // failed, log error and leave
  if (status !== google.maps.places.PlacesServiceStatus.OK) {
    console.log("showDetails failed: " + status);
    return;
  }

  // html elements
  let divTitle = document.getElementById("divRestaurantTitle");
  let divPhotos = document.getElementById("divPhotos");
  let divAddress = document.getElementById("divAddress");
  let divReviewButtons = document.getElementById("divReviewButtons");

  // expand review objects into array
  reviews = [...result.reviews];

  // make title a website link if they have one, plain text if not
  if (result.website) {
    divTitle.innerHTML = `<p><a href="${result.website}" target="_blank">${result.name} - ${result.rating} \u272e</a></p>`;
  } else {
    divTitle.innerHTML = `<p>${result.name} - ${result.rating} \u272e</p>`;
  }

  // update address and review
  divAddress.innerHTML = `<a>${result.formatted_address}</a>`;
  divReview.innerHTML = `<p>${result.reviews[reviewIndex].text}</p>`;

  // next and previous buttons
  divReviewButtons.innerHTML = `<a href='javascript:void(0);' class="pointer" onclick="previousReview()"> <<< </a> 
    <span class="spacer">Reviews</span> 
    <a href='javascript:void(0);' class="pointer" onclick="nextReview()"> >>> </a>`;

  let newHTML = "";
  let photoCount = 0;

  // set loop length to how many photos and create the divs
  if (result.photos) photoCount = result.photos.length;
  for (let c = 0; c < photoCount; c++) {
    let photo = result.photos[c];
    newHTML += `
        <div class="mySlides fade">
            <img src="${photo.getUrl()}" class="foodImage" alt="picture from restaurant"/>                
        </div>`;
  }

  // add photo divs to main photo div
  divPhotos.innerHTML = newHTML;

  // add next and prev arrows to main photo div
  divPhotos.insertAdjacentHTML(
    "beforeend",
    `
    <a class="prev" id="prev" onclick="changeSlide(-1)">&#10094;</a>
    <a class="next" id="next" onclick="changeSlide(1)">&#10095;</a>`
  );

  // show first image
  showSlides(1);
}

// scrolls to the next review
// wraps around when it reaches end of reviews
function nextReview() {
  if (reviewIndex < reviews.length) {
    reviewIndex++;
  }
  if (reviewIndex >= reviews.length) {
    reviewIndex = 0;
  }
  divReview.innerHTML = `<p>${reviews[reviewIndex].text}</p>`;
}

// scrolls to the previous review
// wraps around when it reaches end of reviews
function previousReview() {
  if (reviewIndex >= 1) {
    reviewIndex--;
  }
  if (reviewIndex === 0) {
    reviewIndex = reviews.length - 1;
  }
  divReview.innerHTML = `<p>${reviews[reviewIndex].text}</p>`;
}

// searches nearby places when user changes the cuisine select box
function changeCuisine() {
  let text = selCuisine.value;
  if (text === "Any") text = "Restaurant";
  currentCuisine = text;
  searchResults = [];
  getNearbyPlaces(userLocation);
}

// change the image slide showing
function changeSlide(n) {
  showSlides((imageSlideIndex += n));
}

// shows a big image slide from the image bar
function showSlides(n) {
  let slides = document.getElementsByClassName("mySlides");
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");

  prev.style.display = "block";
  next.style.display = "block";

  // wrap high end
  if (n > slides.length) imageSlideIndex = 1;

  // wrap low end
  if (n < 1) imageSlideIndex = slides.length;

  // hide all images
  for (let i = 0; i < slides.length; i++) slides[i].style.display = "none";

  // display one main image
  slides[imageSlideIndex - 1].style.display = "block";
}
