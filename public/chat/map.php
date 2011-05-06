<html> 
<head> 
<meta name="viewport" content="initial-scale=1.0, user-scalable=no" /> 
<meta http-equiv="content-type" content="text/html; charset=UTF-8"/> 
<title>Google Maps JavaScript API v3 Example: Marker Simple</title> 
<link href="http://code.google.com/apis/maps/documentation/javascript/examples/default.css" rel="stylesheet" type="text/css" /> 
<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false"></script> 
<script type="text/javascript"> 

  function initialize() {
    var myLatlng = new google.maps.LatLng(<?php echo $_GET['latlng']?>);
    var myOptions = {
      zoom: 4,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    
    var marker = new google.maps.Marker({
        position: myLatlng, 
        map: map,
        title:"Hello World!"
    });
	var maxZoomService = new google.maps.MaxZoomService();
  
	var showMaxZoom = function (latlng) {
	    maxZoomService.getMaxZoomAtLatLng(latlng, function(response) {
	      if (response.status != google.maps.MaxZoomStatus.OK) {
	        //alert("Error in MaxZoomService");
	        return;
	      } else {
	       // alert("The maximum zoom at this location is: " + response.zoom);
	      	map.setZoom(response.zoom);
		}
	      map.setCenter(latlng);
	    });
	  };
	showMaxZoom(marker.getPosition());
  }
	
</script> 
</head> 
<body onload="initialize()"> 
  <div id="map_canvas"></div> 
</body> 
</html>

