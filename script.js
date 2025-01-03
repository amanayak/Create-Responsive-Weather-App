const temp = document.getElementById("temp"),
    date = document.getElementById("date-time"),
    condition = document.getElementById("condition"),
    rain = document.getElementById("rain"),
    mainIcon = document.getElementById("icon"),
    currentLocation = document.getElementById("location"),
    uvIndex = document.querySelector(".uv-index"),
    uvText = document.querySelector(".uv-text"),
    windSpeed = document.querySelector(".wind-speed"),
    sunRise = document.querySelector(".sun-rise"),
    sunSet = document.querySelector(".sun-set"),
    humidity = document.querySelector(".humidity"),
    visibilty = document.querySelector(".visibilty"),
    humidityStatus = document.querySelector(".humidity-status"),
    airQuality = document.querySelector(".air-quality"),
    airQualityStatus = document.querySelector(".air-quality-status"),
    visibilityStatus = document.querySelector(".visibilty-status"),
    searchForm = document.querySelector("#search"),
    search = document.querySelector("#query"),
    celciusBtn = document.querySelector(".celcius"),
    fahrenheitBtn = document.querySelector(".fahrenheit"),
    tempUnit = document.querySelectorAll(".temp-unit"),
    hourlyBtn = document.querySelector(".hourly"),
    weekBtn = document.querySelector(".week"),
    weatherCards = document.querySelector("#weather-cards");

let currentCity = "";
let currentUnit = "c";
let hourlyorWeek = "week";

// function to get date and time
function getDateTime() {
    let now = new Date(),
        hour = now.getHours(),
        minute = now.getMinutes();

    let days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    // 12 hours format
    hour = hour % 12;
    if (hour < 10) {
        hour = "0" + hour;
    }
    if (minute < 10) {
        minute = "0" + minute;
    }
    let dayString = days[now.getDay()];
    return `${dayString}, ${hour}:${minute}`;
}

//Updating date and time
date.innerText = getDateTime();
setInterval(() => {
    date.innerText = getDateTime();
}, 1000);

// function to get public ip address
function getPublicIp() {
    fetch("https://geolocation-db.com/json/", {
        method: "GET",
        headers: {},
    })
        .then((response) => response.json())
        .then((data) => {
            currentCity = data.city;
            getWeatherData(data.city, currentUnit, hourlyorWeek);
        })
        .catch((err) => {
            console.error(err);
        });
}

getPublicIp();

// function to get weather data
function getWeatherData(city, unit, hourlyorWeek) {
    fetch(
        `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=EJ6UBL2JEQGYB3AA4ENASN62J&contentType=json`,
        {
            method: "GET",
            headers: {},
        }
    )
        .then((response) => response.json())
        .then((data) => {
            let today = data.currentConditions;
            if (unit === "c") {
                temp.innerText = today.temp;
            } else {
                temp.innerText = celciusToFahrenheit(today.temp);
            }
            currentLocation.innerText = data.resolvedAddress;
            condition.innerText = today.conditions;
            rain.innerText = "Perc - " + today.precip + "%";
            uvIndex.innerText = today.uvindex;
            windSpeed.innerText = today.windspeed;
            measureUvIndex(today.uvindex);
            mainIcon.src = getIcon(today.icon);
            changeBackground(today.icon);
            humidity.innerText = today.humidity + "%";
            updateHumidityStatus(today.humidity);
            visibilty.innerText = today.visibility;
            updateVisibiltyStatus(today.visibility);
            airQuality.innerText = today.winddir;
            updateAirQualityStatus(today.winddir);
            if (hourlyorWeek === "hourly") {
                updateForecast(data.days[0].hours, unit, "day");
            } else {
                updateForecast(data.days, unit, "week");
            }
            sunRise.innerText = covertTimeTo12HourFormat(today.sunrise);
            sunSet.innerText = covertTimeTo12HourFormat(today.sunset);
        })
        .catch((err) => {
            alert("City not found in our database");
        });
}

//function to update Forecast
function updateForecast(data, unit, type) {
    weatherCards.innerHTML = "";
    let day = 0;
    let numCards = 0;
    if (type === "day") {
        numCards = 24;
    } else {
        numCards = 7;
    }
    for (let i = 0; i < numCards; i++) {
        let card = document.createElement("div");
        card.classList.add("card");
        let dayName = getHour(data[day].datetime);
        if (type === "week") {
            dayName = getDayName(data[day].datetime);
        }
        let dayTemp = data[day].temp;
        if (unit === "f") {
            dayTemp = celciusToFahrenheit(data[day].temp);
        }
        let iconCondition = data[day].icon;
        let iconSrc = getIcon(iconCondition);
        let tempUnit = "°C";
        if (unit === "f") {
            tempUnit = "°F";
        }
        card.innerHTML = `
                <h2 class="day-name">${dayName}</h2>
            <div class="card-icon">
              <img src="${iconSrc}" class="day-icon" alt="" />
            </div>
            <div class="day-temp">
              <h2 class="temp">${dayTemp}</h2>
              <span class="temp-unit">${tempUnit}</span>
            </div>
  `;
        weatherCards.appendChild(card);
        day++;
    }
}

// function to change weather icons
function getIcon(condition) {
    if (condition === "partly-cloudy-day") {
        return "https://i.ibb.co/PZQXH8V/27.png";
    } else if (condition === "partly-cloudy-night") {
        return "https://i.ibb.co/Kzkk59k/15.png";
    } else if (condition === "rain") {
        return "https://i.ibb.co/kBd2NTS/39.png";
    } else if (condition === "clear-day") {
        return "https://i.ibb.co/rb4rrJL/26.png";
    } else if (condition === "clear-night") {
        return "https://i.ibb.co/1nxNGHL/10.png";
    } else {
        return "https://i.ibb.co/rb4rrJL/26.png";
    }
}

// function to change background depending on weather conditions
function changeBackground(condition) {
    const body = document.querySelector("body");
    let bg = "";
    if (condition === "partly-cloudy-day") {
        bg = "https://i.ibb.co/qNv7NxZ/pc.webp";
    } else if (condition === "partly-cloudy-night") {
        bg = "https://i.ibb.co/RDfPqXz/pcn.jpg";
    } else if (condition === "rain") {
        bg = "https://i.ibb.co/h2p6Yhd/rain.webp";
    } else if (condition === "clear-day") {
        bg = "https://i.ibb.co/WGry01m/cd.jpg";
    } else if (condition === "clear-night") {
        bg = "https://i.ibb.co/kqtZ1Gx/cn.jpg";
    } else {
        bg = "https://i.ibb.co/qNv7NxZ/pc.webp";
    }
    body.style.backgroundImage = `linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ),url(${bg})`;
}

//get hours from hh:mm:ss
function getHour(time) {
    let hour = time.split(":")[0];
    let min = time.split(":")[1];
    if (hour > 12) {
        hour = hour - 12;
        return `${hour}:${min} PM`;
    } else {
        return `${hour}:${min} AM`;
    }
}

// convert time to 12 hour format
function covertTimeTo12HourFormat(time) {
    let hour = time.split(":")[0];
    let minute = time.split(":")[1];
    let ampm = hour >= 12 ? "pm" : "am";
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'
    hour = hour < 10 ? "0" + hour : hour;
    minute = minute < 10 ? "0" + minute : minute;
    let strTime = hour + ":" + minute + " " + ampm;
    return strTime;
}

// function to get day name from date
function getDayName(date) {
    let day = new Date(date);
    let days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    return days[day.getDay()];
}

// function to get uv index status
function measureUvIndex(uvIndex) {
    if (uvIndex <= 2) {
        uvText.innerText = "Low";
    } else if (uvIndex <= 5) {
        uvText.innerText = "Moderate";
    } else if (uvIndex <= 7) {
        uvText.innerText = "High";
    } else if (uvIndex <= 10) {
        uvText.innerText = "Very High";
    } else {
        uvText.innerText = "Extreme";
    }
}

// function to get humidity status
function updateHumidityStatus(humidity) {
    if (humidity <= 30) {
        humidityStatus.innerText = "Low";
    } else if (humidity <= 60) {
        humidityStatus.innerText = "Moderate";
    } else {
        humidityStatus.innerText = "High";
    }
}

// function to get visibility status
function updateVisibiltyStatus(visibility) {
    if (visibility <= 0.03) {
        visibilityStatus.innerText = "Dense Fog";
    } else if (visibility <= 0.16) {
        visibilityStatus.innerText = "Moderate Fog";
    } else if (visibility <= 0.35) {
        visibilityStatus.innerText = "Light Fog";
    } else if (visibility <= 1.13) {
        visibilityStatus.innerText = "Very Light Fog";
    } else if (visibility <= 2.16) {
        visibilityStatus.innerText = "Light Mist";
    } else if (visibility <= 5.4) {
        visibilityStatus.innerText = "Very Light Mist";
    } else if (visibility <= 10.8) {
        visibilityStatus.innerText = "Clear Air";
    } else {
        visibilityStatus.innerText = "Very Clear Air";
    }
}

// function to get air quality status
function updateAirQualityStatus(airquality) {
    if (airquality <= 50) {
        airQualityStatus.innerText = "Good👌";
    } else if (airquality <= 100) {
        airQualityStatus.innerText = "Moderate😐";
    } else if (airquality <= 150) {
        airQualityStatus.innerText = "Unhealthy for Sensitive Groups😷";
    } else if (airquality <= 200) {
        airQualityStatus.innerText = "Unhealthy😷";
    } else if (airquality <= 250) {
        airQualityStatus.innerText = "Very Unhealthy😨";
    } else {
        airQualityStatus.innerText = "Hazardous😱";
    }
}

// function to handle search form
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let location = search.value;
    if (location) {
        currentCity = location;
        getWeatherData(location, currentUnit, hourlyorWeek);
    }
});

// function to conver celcius to fahrenheit
function celciusToFahrenheit(temp) {
    return ((temp * 9) / 5 + 32).toFixed(1);
}


var currentFocus;
search.addEventListener("input", function (e) {
    removeSuggestions();
    var a,
        b,
        i,
        val = this.value;
    if (!val) {
        return false;
    }
    currentFocus = -1;

    a = document.createElement("ul");
    a.setAttribute("id", "suggestions");

    this.parentNode.appendChild(a);

    for (i = 0; i < cities.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (
            cities[i].name.substr(0, val.length).toUpperCase() == val.toUpperCase()
        ) {
            /*create a li element for each matching element:*/
            b = document.createElement("li");
            /*make the matching letters bold:*/
            b.innerHTML =
                "<strong>" + cities[i].name.substr(0, val.length) + "</strong>";
            b.innerHTML += cities[i].name.substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + cities[i].name + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function (e) {
                /*insert the value for the autocomplete text field:*/
                search.value = this.getElementsByTagName("input")[0].value;
                removeSuggestions();
            });

            a.appendChild(b);
        }
    }
});
/*execute a function presses a key on the keyboard:*/
search.addEventListener("keydown", function (e) {
    var x = document.getElementById("suggestions");
    if (x) x = x.getElementsByTagName("li");
    if (e.keyCode == 40) {
        /*If the arrow DOWN key
          is pressed,
          increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
    } else if (e.keyCode == 38) {
        /*If the arrow UP key
          is pressed,
          decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
    }
    if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
        }
    }
});
function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("active");
}
function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("active");
    }
}

function removeSuggestions() {
    var x = document.getElementById("suggestions");
    if (x) x.parentNode.removeChild(x);
}

fahrenheitBtn.addEventListener("click", () => {
    changeUnit("f");
});
celciusBtn.addEventListener("click", () => {
    changeUnit("c");
});

// function to change unit
function changeUnit(unit) {
    if (currentUnit !== unit) {
        currentUnit = unit;
        tempUnit.forEach((elem) => {
            elem.innerText = `°${unit.toUpperCase()}`;
        });
        if (unit === "c") {
            celciusBtn.classList.add("active");
            fahrenheitBtn.classList.remove("active");
        } else {
            celciusBtn.classList.remove("active");
            fahrenheitBtn.classList.add("active");
        }
        getWeatherData(currentCity, currentUnit, hourlyorWeek);
    }
}

hourlyBtn.addEventListener("click", () => {
    changeTimeSpan("hourly");
});
weekBtn.addEventListener("click", () => {
    changeTimeSpan("week");
});

// function to change hourly to weekly or vice versa
function changeTimeSpan(unit) {
    if (hourlyorWeek !== unit) {
        hourlyorWeek = unit;
        if (unit === "hourly") {
            hourlyBtn.classList.add("active");
            weekBtn.classList.remove("active");
        } else {
            hourlyBtn.classList.remove("active");
            weekBtn.classList.add("active");
        }
        getWeatherData(currentCity, currentUnit, hourlyorWeek);
    }
}



// Cities add your own to get in search
cities = [
    {
        "country": "IN",
        "name": "Mumbai",
        "lat": "19.0760",
        "lng": "72.8777"
    },
    {
        "country": "IN",
        "name": "Delhi",
        "lat": "28.7041",
        "lng": "77.1025"
    },
    {
        "country": "IN",
        "name": "Bengaluru",
        "lat": "12.9716",
        "lng": "77.5946"
    },
    {
        "country": "IN",
        "name": "Kolkata",
        "lat": "22.5726",
        "lng": "88.3639"
    },
    {
        "country": "IN",
        "name": "Chennai",
        "lat": "13.0827",
        "lng": "80.2707"
    },
    {
        "country": "IN",
        "name": "Ahmedabad",
        "lat": "23.0225",
        "lng": "72.5714"
    },
    {
        "country": "IN",
        "name": "Hyderabad",
        "lat": "17.3850",
        "lng": "78.4867"
    },
    {
        "country": "IN",
        "name": "Pune",
        "lat": "18.5204",
        "lng": "73.8567"
    },
    {
        "country": "IN",
        "name": "Surat",
        "lat": "21.1702",
        "lng": "72.8311"
    },
    {
        "country": "IN",
        "name": "Jaipur",
        "lat": "26.9124",
        "lng": "75.7873"
    },
    {
        "country": "IN",
        "name": "Lucknow",
        "lat": "26.8467",
        "lng": "80.9462"
    },
    {
        "country": "IN",
        "name": "Kanpur",
        "lat": "26.4499",
        "lng": "80.3319"
    },
    {
        "country": "IN",
        "name": "Nagpur",
        "lat": "21.1458",
        "lng": "79.0882"
    },
    {
        "country": "IN",
        "name": "Indore",
        "lat": "22.7196",
        "lng": "75.8577"
    },
    {
        "country": "IN",
        "name": "Bhopal",
        "lat": "23.2599",
        "lng": "77.4126"
    },
    {
        "country": "IN",
        "name": "Patna",
        "lat": "25.5941",
        "lng": "85.1376"
    },
    {
        "country": "IN",
        "name": "Vadodara",
        "lat": "22.3072",
        "lng": "73.1812"
    },
    {
        "country": "IN",
        "name": "Agra",
        "lat": "27.1767",
        "lng": "78.0081"
    },
    {
        "country": "IN",
        "name": "Gurgaon",
        "lat": "28.4595",
        "lng": "77.0266"
    },
    {
        "country": "IN",
        "name": "Nashik",
        "lat": "19.9975",
        "lng": "73.7898"
    },
    {
        "country": "IN",
        "name": "Faridabad",
        "lat": "28.4089",
        "lng": "77.3178"
    },
    {
        "country": "IN",
        "name": "Meerut",
        "lat": "28.9845",
        "lng": "77.7064"
    },
    {
        "country": "IN",
        "name": "Rajkot",
        "lat": "22.3039",
        "lng": "70.8022"
    },
    {
        "country": "IN",
        "name": "Varanasi",
        "lat": "25.3176",
        "lng": "82.9739"
    },
    {
        "country": "IN",
        "name": "Srinagar",
        "lat": "34.0837",
        "lng": "74.7974"
    },
    {
        "country": "IN",
        "name": "Amritsar",
        "lat": "31.6340",
        "lng": "74.8723"
    },
    {
        "country": "IN",
        "name": "Allahabad",
        "lat": "25.4358",
        "lng": "81.8463"
    },
    {
        "country": "IN",
        "name": "Ranchi",
        "lat": "23.3441",
        "lng": "85.3096"
    },
    {
        "country": "IN",
        "name": "Jodhpur",
        "lat": "26.2389",
        "lng": "73.0243"
    },
    {
        "country": "IN",
        "name": "Chandigarh",
        "lat": "30.7333",
        "lng": "76.7794"
    },
    {
        "country": "IN",
        "name": "Coimbatore",
        "lat": "11.0168",
        "lng": "76.9558"
    },
    {
        "country": "IN",
        "name": "Guwahati",
        "lat": "26.1445",
        "lng": "91.7362"
    },
    {
        "country": "IN",
        "name": "Kozhikode",
        "lat": "11.2588",
        "lng": "75.7804"
    },
    {
        "country": "IN",
        "name": "Kochi",
        "lat": "9.9312",
        "lng": "76.2673"
    },
    {
        "country": "IN",
        "name": "Thrissur",
        "lat": "10.5276",
        "lng": "76.2144"
    },
    {
        "country": "IN",
        "name": "Madurai",
        "lat": "9.9252",
        "lng": "78.1198"
    },
    {
        "country": "IN",
        "name": "Thiruvananthapuram",
        "lat": "8.5241",
        "lng": "76.9366"
    },
    {
        "country": "IN",
        "name": "Udaipur",
        "lat": "24.5854",
        "lng": "73.7125"
    },
    {
        "country": "IN",
        "name": "Vijayawada",
        "lat": "16.5062",
        "lng": "80.6480"
    },
    {
        "country": "IN",
        "name": "Mysuru",
        "lat": "12.2958",
        "lng": "76.6394"
    }, {
        "country": "IN",
        "name": "Ahmedabad",
        "lat": "23.0225",
        "lng": "72.5714"
    },
    {
        "country": "IN",
        "name": "Surat",
        "lat": "21.1702",
        "lng": "72.8311"
    },
    {
        "country": "IN",
        "name": "Vadodara",
        "lat": "22.3072",
        "lng": "73.1812"
    },
    {
        "country": "IN",
        "name": "Rajkot",
        "lat": "22.3039",
        "lng": "70.8022"
    },
    {
        "country": "IN",
        "name": "Bhavnagar",
        "lat": "21.7645",
        "lng": "72.1519"
    },
    {
        "country": "IN",
        "name": "Jamnagar",
        "lat": "22.4707",
        "lng": "70.0577"
    },
    {
        "country": "IN",
        "name": "Junagadh",
        "lat": "21.5222",
        "lng": "70.4579"
    },
    {
        "country": "IN",
        "name": "Gandhinagar",
        "lat": "23.2156",
        "lng": "72.6369"
    },
    {
        "country": "IN",
        "name": "Anand",
        "lat": "22.5645",
        "lng": "72.9289"
    },
    {
        "country": "IN",
        "name": "Nadiad",
        "lat": "22.6916",
        "lng": "72.8634"
    }
];


