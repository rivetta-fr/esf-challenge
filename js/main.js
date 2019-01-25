

//BURGER MENU

$(document).on('click','#burger_btn', function(){
    $('#menu').fadeToggle('slow');
});

/**** ======================= MODAL update ===================== */

// Define values for keycodes

const VK_ESCAPE     = 27;
const VK_TAB        = 9;
var modalOverlay = document.querySelector('.modal-overlay');
var modal = document.querySelector('.modal');
// OPENMODAL FOR LIGHTBOX OR ALERT DIALOG
function openModal() {
    // Will hold previously focused element // Save current focus
    //let focusedElementBeforeModal= document.activeElement;

    // Find the modal and its overlay

    // Listen for and trap the keyboard
    modal.addEventListener('keydown', trapTabKey);

    // Listen for indicators to close the modal
    $(document).on('click', '.modal-overlay, .closemodal ',function(e){
        e.preventDefault();
        closeModal();
        return false;
      } );

    // Find all focusable children
    const focusableElementsString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
    let focusableElements = modal.querySelectorAll(focusableElementsString);
    // Convert NodeList to Array
    focusableElements = Array.prototype.slice.call(focusableElements);

    let firstTabStop = focusableElements[0];
    let lastTabStop = focusableElements[focusableElements.length - 1];

    // Show the modal and overlay
    modal.style.display = 'block';
    modalOverlay.style.display = 'block';

    // Focus first child
    firstTabStop.focus();

    function trapTabKey(e) {
        // Check for TAB key press
        if (e.keyCode === VK_TAB) {
            // SHIFT + TAB
            if (e.shiftKey) {
                if (document.activeElement === firstTabStop) {
                e.preventDefault();
                lastTabStop.focus();
                }
            // TAB
            } else {
                if (document.activeElement === lastTabStop) {
                e.preventDefault();
                firstTabStop.focus();
                }
            }
        }
        // ESCAPE
        if (e.keyCode === VK_ESCAPE) {
        closeModal();
        }
    }
    document.querySelector('.wrapper').setAttribute('aria-hidden', true);
}
// closeMODAL FOR LIGHTBOX OR ALERT DIALOG
function closeModal( ) {
    // Hide the modal and overlay
    modal.style.display = 'none';
    modalOverlay.style.display = 'none';
    modal.querySelectorAll('form')[0].reset();
    document.querySelector('.wrapper').removeAttribute('aria-hidden');
}

$(document).on('click','#add-itinerary',function(){
    openModal();
    return false;
});


//Submit FORM MANAGE
$('form#new-itinerary-form').submit(function(e) {
    e.preventDefault();
    $('#submitbuttom').hide();
    $('.alert').remove(); // remove previus alerts
    let hasError = false;
    departure = $('#departure').val();
    arrival = $('#arrival').val();
    if(departure == ''){
        $('#departure').after('<div class="alert alert-danger">Please insert a departure.</div>');
        hasError = true;
        $('#departure').focus(); // focus on input error
    }
    if(arrival == ''){
        $('#arrival').after('<div class="alert alert-danger">Please insert an arrival.</div>');
        hasError = true;
        $('#arrival').focus(); // focus on input error
    }
    if(!hasError) {

        getItinerary();
        closeModal();
    }
    $('#submitbuttom').show();
    return false;
});



// MAP
/*
defined in index.ejs

// SET vARS for direction

var click = 0;
var itinerary, markerd; //, markera;
var dirlayer = L.layerGroup();

var departure = <%- departure %>;
var arrival = <%- arrival %>;
var pointActivity = <%- waypoints %>;
*/


// SET MAP
var mymap = L.map('mapid', {
    center: [48.178907, 6.441802],
    zoom: 13,
    layers: tileLayer,
    zoomControl: false
});

function onLocationFound(e) { // find location of customer when open app
    //console.log(e);
    var radius = e.accuracy / 2;
    L.marker(e.latlng).addTo(mymap).bindPopup("You are within " + radius + " meters from this point").openPopup();
    L.circle(e.latlng, radius).addTo(mymap);
}

function onMapClick(e) {
    window.click++;
    if(window.click == 1){
        departure = e.latlng;
        markerd = L.marker(departure);
        dirlayer.addLayer(markerd).addTo(mymap);
        markerd.bindPopup('<img class="popup" src="/images/veryroadtrip.png" alt="Very Road Trip">Départure, now click on arrival.').openPopup();
    }
    if(window.click == 2){
        arrival = e.latlng;
        /*
        markera = L.marker(arrival);
        dirlayer.addLayer(markera).addTo(mymap);
        markera.bindPopup('<img class="popup" src="/images/veryroadtrip.png" alt="Very Road Trip"><p>Arrival</p>').openPopup());
        */
       window.click =0;
        getItinerary();
    }
    return false;
}


//EVENTS
$(document).on('click','.menu-item-break',function(){
    if(itinerary != ""){
        //mymap.removeLayer(dirlayer);
        for(let layer of dirlayer.getLayers() ){
            dirlayer.removeLayer(layer);
        }
    }
    navAddToggle()
    return false;
});
mymap.on('click', onMapClick);
mymap.on('moveend', function() {
    //console.log(mymap.getBounds());
    pointActivity = getPA(mymap.getBounds());
});
mymap.on('locationfound', onLocationFound); //call show circle radius when lacate

// show map
mymap.locate({setView: true, maxZoom: 16}); // show map when open


//SEND parameters to navigation simulator
$(document).on('click','#navigation',function(e){
    e.preventDefault();
    const method = "post"; // Set method to post by default if not specified.
    const path = `${location.protocol}//${document.location.hostname}:9966`;
    console.log(path);
    let params = new Object();
    params["departure"] = departure;
    params["arrival"] = arrival;
    params["waypoints"] = pointActivity;
    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    let form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
    console.log(params);
    for(let key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);

            if(key == "waypoints"){
                hiddenField.setAttribute("value", JSON.stringify( params[key] ));
            } else{
                hiddenField.setAttribute("value", JSON.stringify( {"latitude":params[key].lat,"longitude":params[key].lng} ) );
            }
            form.appendChild(hiddenField);
        }
    }
    document.body.appendChild(form);
    form.submit();

   //window.location.href = path;
    return false;
});

//  LEAFLET only

//add zoom control with your options
/*
L.control.zoom({
    position:'bottomleft'
}).addTo(mymap);
*/
/*
L.tileLayer('//{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
    attribution: 'données &copy; <a href="//osm.org/copyright">OpenStreetMap</a> - rendu <a href="//openstreetmap.fr">OSM France</a>',
    minZoom: 1,
    maxZoom: 20
}).addTo(mymap);
*/
