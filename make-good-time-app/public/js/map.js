var GoodTimeApp = GoodTimeApp || {};

GoodTimeApp.addInfoWindowForActivity = function(activity, activityMarker) {
  activityMarker.addListener('click', function() {

    if(GoodTimeApp.infoWindow) GoodTimeApp.infoWindow.close();

    GoodTimeApp.infoWindow = new google.maps.InfoWindow({
      content: '<div>' + '<div>' + activity.name + '</div>' + '<div>' + 
      '<img src="'+ activity.photo + '" height="200" width="200">' + 
      '<p>'+ activity.description + '</p>' + 
      '<p>' + activity.location + ', ' + + activity.postcode + '</p>'+ '</div>' + '</div>'
    });
    GoodTimeApp.infoWindow.open(GoodTimeApp.map, activityMarker);
  });
}

GoodTimeApp.filterMarkers = function (category) {
  for (i = 0; i < gmarkers1.length; i++) {
    marker = gmarkers1[i];
    if (marker.categories.join(" ").includes(category) || category.length === 0) {
        this.correctMarker.push(marker);
    }
  }
}

GoodTimeApp.submitMarkers = function() {
  this.$filterBox = $(".filter-box");
  this.$filterBox.hide();
  this.$sideBar.show();
  for (i = 0; i < this.correctMarker.length; i++) {
    marker = this.correctMarker[i];
    marker.setVisible(true);
    GoodTimeApp.$sideBar.append("<div>\<li>\<input type='checkbox' id='"+ marker.name + "' value='"+marker.name+"' onchange='GoodTimeApp.changeMarkers(this.value, this.id);' checked />\<label>\<h4>"+marker.name+"</h4>\</label>\</li>\</div>"
    );
  }
  GoodTimeApp.$sideBar.append("<div>\<input type='submit' value='Change' onclick='GoodTimeApp.amendMarkers();'/>\</div>");
}

GoodTimeApp.amendMarkers = function(name) {
  if(this.toAddMarker.length !== 0 ) {
    for (i = 0; i < this.toAddMarker.length; i++) {
      marker = this.toAddMarker[i];
      marker.setVisible(true);
      this.correctMarker.push(marker);
    }
  } else if (this.toDeleteMarker.length !== 0) {
    for (i = 0; i < this.toDeleteMarker.length; i++) {
      marker = this.toDeleteMarker[i];
      marker.setVisible(false);
      this.correctMarker.pop(marker);
    }
    console.log("correct markers: " + this.correctMarker[0].position.lat);
  } 
}


GoodTimeApp.changeMarkers = function(name, id) {
  if($('#'+id).prevObject["0"].activeElement.checked == true) {
    for (i = 0; i < gmarkers1.length; i++) {
      marker = gmarkers1[i];
      if (marker.name.includes(name)) {
        GoodTimeApp.toAddMarker.push(marker);
      }
    }
  } else {
    for (i = 0; i < gmarkers1.length; i++) {
      marker = gmarkers1[i];
      if (marker.name.includes(name)) {
        GoodTimeApp.toDeleteMarker.push(marker);
      }
    }
  }
  // GoodTimeApp.getDirections();
}


GoodTimeApp.createMarkerForActivity = function(activity) {
  var latLng = new google.maps.LatLng(activity.lat, activity.lng);
  var categories = activity.categories;
  var name = activity.name;
  var location = activity.location;
  var activityMarker = new google.maps.Marker({
    name: name,
    location: location,
    position: latLng,
    map: GoodTimeApp.map,
    categories: categories,
    icon: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
  });
  gmarkers1.push(activityMarker);
  activityMarker.setVisible(false);

  GoodTimeApp.addInfoWindowForActivity(activity, activityMarker);
}

GoodTimeApp.loopThroughActivities = function(data) {
  return data.forEach(GoodTimeApp.createMarkerForActivity);
}

GoodTimeApp.getActivities = function() {
  if(event) event.preventDefault();
  return $.ajax({
    method: "GET",
    url: "http://localhost:3000/api/activities"
  }).done(function(data) {
    GoodTimeApp.getTemplate("index", { activities: data });
    GoodTimeApp.loopThroughActivities( data );
  });
}

GoodTimeApp.getDirections = function() {
  this.waypoints = [];
  console.log(this.waypoints);
  for (var i=0; i < this.correctMarker.length; i++) {
    GoodTimeApp.waypoints.push(GoodTimeApp.correctMarker[i].position);
    // console.log(GoodTimeApp.waypoints);
  }
  
}

// GoodTimeApp.calcRoute = function(directionsService, directionsDisplay) {
//   this.getDirections();
//   this.start = new google.maps.LatLng(51.540805, -0.076285);
  
//   this.request = {
//     origin: this.start,
//     destination: this.start,
//     waypoints: this.waypoints,
//     travelMode: 'WALKING' }

//     GoodTimeApp.directionsService.route(this.request, function(response, status) {
//       if (status == 'OK') {
//         GoodTimeApp.directionsDisplay.setDirections(response);
//         var route = response.routes[0];
//         var summaryPanel = document.getElementById('side-bar');
//         summaryPanel.innerHTML = '';
        
//         for (var i = 0; i < route.legs.length; i++) {
//           var routeSegment = i + 1;
//           summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
//               '</b><br>';
//           summaryPanel.innerHTML += 'to ' + route.legs[i].end_address + '<br>';
//           summaryPanel.innerHTML += route.legs[i].duration.text + '<br>';
//           summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
//         }
//         // console.log(response.routes[0].legs[1].duration.text);
//       }
//     });     
// }


GoodTimeApp.initializeMap = function() {

  // this.directionsDisplay = new google.maps.DirectionsRenderer();

  // this.directionsService = new google.maps.DirectionsService();

  // Arbitrary starting point
  GoodTimeApp.latLng = { lat: 51.5080072, lng: -0.1019284 };

  // Position map within #map div
  GoodTimeApp.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: GoodTimeApp.latLng
  });

  // this.addFilterListener();

  GoodTimeApp.getActivities();

  // Place marker on map at load time
  GoodTimeApp.startMark = new google.maps.Marker({
    position: GoodTimeApp.latLng,
    map: GoodTimeApp.map,
    title: 'You are here.'
  });

  // Include transit lines
  GoodTimeApp.transitLayer = new google.maps.TransitLayer();
  GoodTimeApp.transitLayer.setMap(this.map);

  // HTML5 geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      GoodTimeApp.map.setCenter(pos);
      GoodTimeApp.startMark.setPosition(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
  // GoodTimeApp.calcRoute();
  // GoodTimeApp.directionsDisplay.setMap(GoodTimeApp.map);
}