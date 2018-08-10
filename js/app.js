var offCanvas, map, clientID, clientSecret;
// my canvas to open and close
offCanvas = document.getElementById("off-canvas");
document.getElementById("hamborge--icon").addEventListener("click", function() {
    if (offCanvas.style.left === "" || offCanvas.style.left === -100 + "%") {
        offCanvas.style.left = 0;
        this.title = "Close Canvas";
    } else {
        offCanvas.style.left = -100 + "%";
        this.title = "Open Canvas";
    }
    document.getElementById("hamborge--icon").classList.toggle("change");
});

//all my locations that's will display 

var Locations = [{
        name: 'Park Ave Penthouse',
        lat: 40.7713024,
        long: -73.9632393
    },
    {
        name: 'Chelsea Loft',
        lat: 40.7444883,
        long: -73.9949465
    },
    {
        name: 'Union Square Open Floor Plan',
        lat: 40.7347062,
        long: -73.9895759
    },
    {
        name: 'East Village Hip Studio',
        lat: 40.7281777,
        long: -73.984377
    },
    {
        name: 'TriBeCa Artsy Bachelor Pad',
        lat: 40.7195264,
        long: -74.0089934
    },
    {
        name: 'Chinatown Homey Space',
        lat: 40.7180628,
        long: -73.9961237
    }

];
// My  Foursquare API 
clientID = "QC205U2E0WTPWJSKVGPPHR1GOQAQU0HKWPMFYHSY1ZOW5O5V";
clientSecret = "VQBKNTNPVXZADKGCQNDPMFJRCAM0G5A1WY2KQZKLXHCX1RPT";
// class oop for location's information
var Location = function(Item) {
    var self = this;
    this.visible = ko.observable(true);
    this.name = Item.name;
    this.lat = Item.lat;
    this.long = Item.long;
    this.street = "Unknown";
    this.city = "Unknown";

    // complete url
    var APIURL = 'https://api.foursquare.com/v2/venues/search?ll=' + this.lat + ',' + this.long + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.name;

    // json file from api
    $.getJSON(APIURL, function(result) {
        $.each(result, function() {
            var results = result.response.venues[0];
            if(results !== undefined && !results) {
                self.street = results.location.formattedAddress[0] || "Unavailable";
                self.city = results.location.formattedAddress[1] || "Unavailable";
            }
            
        });
    });
    this.content = '<div><div><b>' + self.name + "</b><br/></div>" +
        '<span>' + self.street + "</span><br>" +
        '<span>' + self.city + "</span>";

    this.infoWindow = new google.maps.InfoWindow({
        content: self.content
    });

    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(Item.lat, Item.long),
        map: map,
        title: Item.name,
        animation: google.maps.Animation.DROP
    });

    this.testMarker = ko.computed(function() {
        if (this.visible()) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);

    this.marker.addListener('click', function() {
        self.content = '<div><div><b>' + self.name + "</b><br>" +
            '<span>' + self.street + "</span><br>" +
            '<span>' + self.city + "</span>" + "</div>";

        self.infoWindow.setContent(self.content);

        self.infoWindow.open(map, this);
        // set animation for marker
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 3000);
    });
    // animation for marker
    this.bounce = function(place) {
        google.maps.event.trigger(self.marker, 'click');
    };
};

function ViewModel() {
    var self = this;
    this.search = ko.observable("");
    // location list
    this.List = ko.observableArray([]);
    // check if the browser support google map or not
    if (navigator.geolocation) {
        map = new google.maps.Map(document.getElementById("map"), {
            center: {
                lat: 40.7413549,
                lng: -73.9980244
            },
            zoom: 12
        });
        map.height = window.innerHeight - 100;
    } else {
        map.innerHTML += "your browser not support google map";
    }
    for (var i = 0; i < Locations.length; i++) {
        self.List.push(new Location(Locations[i]));
    }
    // automatic filter list
    this.filteredList = ko.computed(function() {
        var inputText = self.search().toLowerCase();
        // if there isn't any input text(blank)
        if (!inputText) {
            self.List().forEach(function(Item) {
                Item.visible(true);
            });
            return self.List();
        } else {
            // return result filtered
            return ko.utils.arrayFilter(self.List(), function(Item) {
                var locationName = Item.name.toLowerCase();
                var result = locationName.search(inputText) >= 0;
                Item.visible(result);
                return result;
            });
        }
    }, self);

}

function initMap() {
    ko.applyBindings(new ViewModel());
}

function errorHandle() {
    alert("there is an error in google map please try again.");
}