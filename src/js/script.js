const SERVICE_UUID = "713d0000-503e-4c75-ba94-3148f18d941e";
const XAXIS_UUID   = "713d0002-503e-4c75-ba94-3148f18d941e";
const YAXIS_UUID   = "713d0003-503e-4c75-ba94-3148f18d941e";
const ZAXIS_UUID   = "713d0004-503e-4c75-ba94-3148f18d941e";

let isLoadMap = false;
let intervalId = null;


// dom
const mapElm = document.getElementById("map")
const button = document.getElementById('button')

// timer
const stop = () => {
  clearInterval(intervalId);
  intervalId = null;
}

const loop = () =>  {
  if(isLoadMap) {
    mapElm.setAttribute('data-show', 'true')
    button.setAttribute('data-show', 'false')
    stop()
  } else {
    console.log('wait');
  }
}

// map 
const initializeMap = (latitude, longitude) => {
  const location = new google.maps.LatLng(latitude, longitude)
  const map = new google.maps.Map(mapElm, {
    center: location,
    zoom: 17,
    scrollwheel: true
  })

  const request = {
    location: location,
    radius: '500',
    query: 'curry',
    type: 'restanrant'
  }

  let service = new google.maps.places.PlacesService(map)
  service.textSearch(request, (results, status) => {
    if(status === google.maps.places.PlacesServiceStatus.OK) {
      for(let i = 0; i < results.length; i++) {
        const place = results[i]

        const marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location
        })
      }
    }
  })
}


// current location
const getLocation = () => {
  navigator.geolocation.getCurrentPosition((pos) => {
    var latitude  = pos.coords.latitude;
    var longitude = pos.coords.longitude;
    initializeMap(latitude, longitude)
    isLoadMap = true;
  });
}


// ble
const connectBluetooth = () => {
  navigator.bluetooth.requestDevice({
      filters: [
          {
              services: [
                  SERVICE_UUID
              ]
          }
      ]
  }).then(device => {
      console.log('デバイスを選択しました。接続します。');
      console.log('デバイス名 : ' + device.name);
      console.log('ID : ' + device.id);
      return device.gatt.connect();
  }).then(server => {
      console.log('サービスに接続中');
      return server.getPrimaryService(SERVICE_UUID);
  }).then(service => Promise.all([
      service.getCharacteristic(XAXIS_UUID),
      service.getCharacteristic(YAXIS_UUID),
      service.getCharacteristic(ZAXIS_UUID)
  ])).then(characteristic => {
      console.log('接続完了', characteristic);
      intervalId = setInterval(loop, 500)
  });
};


getLocation()

// eventlistener

button.addEventListener('click', () => {
  connectBluetooth()
})