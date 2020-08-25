var savedLocations = [];
var currentLoc;

function initialize() {
    //grab previous locations from local storage
    savedLocations = JSON.parse(localStorage.getItem("weathercities"));
    var lastSearch;
    //display buttons for previous searches
    if (savedLocations) {
        //get the last city searched so we can display it
        currentLoc = savedLocations[savedLocations.length - 1];
        showPrevious();
        getCurrent(currentLoc);
    }
    else {
        //try to geolocate, otherwise set city to raleigh
        if (!navigator.geolocation) {
            //can't geolocate and no previous searches, so just give them one
            getCurrent("Raleigh");
        }
        else {
            navigator.geolocation.getCurrentPosition(success, error);
        }
    }

}

function success(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    APIKey = "e4283046ac7e921e996fd8d9a65b97aa"
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&APPID=" + APIKey;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        currentLoc = response.name;
        saveLoc(response.name);
        getCurrent(currentLoc);
    });

}

function error(){

    currentLoc = "Raleigh"
    getCurrent(currentLoc);
}

function showPrevious() {

    if (savedLocations) {
        $("#prevSearches").empty();
        var btns = $("<div>").attr("class", "list-group");
        for (var i = 0; i < savedLocations.length; i++) {
            var locBtn = $("<a>").attr("href", "#").attr("id", "loc-btn").text(savedLocations[i]);
            if (savedLocations[i] == currentLoc){
                locBtn.attr("class", "list-group-item list-group-item-action active");
            }
            else {
                locBtn.attr("class", "list-group-item list-group-item-action");
            }
            btns.prepend(locBtn);
        }
        $("#prevSearches").append(btns);
        
    }
}

function getCurrent(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=e4283046ac7e921e996fd8d9a65b97aa&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET",
        error: function (){
            savedLocations.splice(savedLocations.indexOf(city), 1);
            localStorage.setItem("weathercities", JSON.stringify(savedLocations));
            initialize();
        }
    }).then(function (response) {

        var currCard = $("<div>").attr("class", "card bg-light");
        $("#earthforecast").append(currCard);

        var currCardHead = $("<div>").attr("class", "card-header").text("Current weather for " + response.name);
        currCard.append(currCardHead);

        var cardRow = $("<div>").attr("class", "row no-gutters");
        currCard.append(cardRow);

        var iconURL = "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@4x.png";

        var imgDiv = $("<div>").attr("class", "col-md-2").append($("<img>").attr("src", iconURL).attr("class", "card-img"));
        cardRow.append(imgDiv);

        var textDiv = $("<div>").attr("class", "col-md-10");
        var cardBody = $("<div>").attr("class", "card-body");
        textDiv.append(cardBody);

        cardBody.append($("<h3>").attr("class", "card-title").text(response.name));

        var currdate = moment(response.dt, "X").format("dddd, MMMM Do YYYY, h:mm a");
        cardBody.append($("<p>").attr("class", "card-text").append($("<med>").attr("class", "text-muted").text("Last updated: " + currdate)));

        cardBody.append($("<p>").attr("class", "card-text").html("Temperature: " + response.main.temp + " &#8457;"));

        cardBody.append($("<p>").attr("class", "card-text").text("Humidity: " + response.main.humidity + "%"));

        cardBody.append($("<p>").attr("class", "card-text").text("Wind Speed: " + response.wind.speed + " MPH"));

   
        var UV = "https://api.openweathermap.org/data/2.5/uvi?appid=e4283046ac7e921e996fd8d9a65b97aa&lat=" + response.coord.lat + "&lon=" + response.coord.lat;
        $.ajax({
            url: UV,
            method: "GET"
        }).then(function (uvresponse) {
            var uvindex = uvresponse.value;
            var bgcolor;
            if (uvindex <= 3) {
                bgcolor = "green";
            }
            else if (uvindex >= 3 || uvindex <= 6) {
                bgcolor = "yellow";
            }
            else if (uvindex >= 6 || uvindex <= 8) {
                bgcolor = "orange";
            }
            else {
                bgcolor = "red";
            }
            var uvdisp = $("<p>").attr("class", "card-text").text("UV Index: ");
            uvdisp.append($("<span>").attr("class", "uvindex").attr("style", ("background-color:" + bgcolor)).text(uvindex));
            cardBody.append(uvdisp);

        });

        cardRow.append(textDiv);
        getForecast(response.id);

function getForecast(city) {

    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + city + "&APPID=e4283046ac7e921e996fd8d9a65b97aa&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        var newrow = $("<div>").attr("class", "forecast");
        $("#earthforecast").append(newrow);

        for (var i = 0; i < response.list.length; i++) {
            if (response.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                var newCol = $("<div>").attr("class", "one-fifth");
                newrow.append(newCol);

                var newCard = $("<div>").attr("class", "card text-white bg-primary");
                newCol.append(newCard);

                var cardHead = $("<div>").attr("class", "card-header").text(moment(response.list[i].dt, "X").format("MMM Do"));
                newCard.append(cardHead);

                var cardImg = $("<img>").attr("class", "card-img-top").attr("src", "https://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + "@4x.png");
                newCard.append(cardImg);

                var bodyDiv = $("<div>").attr("class", "card-body");
                newCard.append(bodyDiv);

                bodyDiv.append($("<p>").attr("class", "card-text").html("Temp: " + response.list[i].main.temp + " &#8457;"));
                bodyDiv.append($("<p>").attr("class", "card-text").text("Humidity: " + response.list[i].main.humidity + "%"));
            }
        }
    });
}
});
}


function clear() {

    $("#earthforecast").empty();
}

function saveLoc(loc){

    if (savedLocations === null) {
        savedLocations = [loc];
    }
    else if (savedLocations.indexOf(loc) === -1) {
        savedLocations.push(loc);
    }
    
    localStorage.setItem("weathercities", JSON.stringify(savedLocations));
    showPrevious();
}

$("#searchbtn").on("click", function () {
    //don't refresh the screen
    event.preventDefault();
    //grab the value of the input field
    var loc = $("#searchinput").val().trim();
    //if loc wasn't empty
    if (loc !== "") {
        //clear the previous forecast
        clear();
        currentLoc = loc;
        saveLoc(loc);
        //clear the search field value
        $("#searchinput").val("");
        //get the new forecast
        getCurrent(loc);
    }
});

$(document).on("click", "#loc-btn", function () {
    clear();
    currentLoc = $(this).text();
    showPrevious();
    getCurrent(currentLoc);
});

initialize();
