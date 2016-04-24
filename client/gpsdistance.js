export function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

export default function distanceBetweenPoints(point1, point2) {
  let lat1 = point1.latitude;
  let lon1 = point1.longitude;
  let lat2 = point2.latitude;
  let lon2 = point2.longitude;

  var R = 6371000; // metres
  var φ1 = degreesToRadians(lat1);
  var φ2 = degreesToRadians(lat2);
  var Δφ = degreesToRadians(lat2-lat1);
  var Δλ = degreesToRadians(lon2-lon1);

  var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  var d = R * c;

  return d;
}
