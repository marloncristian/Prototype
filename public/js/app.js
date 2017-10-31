
var rps = angular.module('rps', ["ngRoute", "firebase", 'ngAnimate', 'ui.bootstrap']);

rps.config(function($routeProvider, $locationProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "static/home.html",
        controller: "ScriptingsListController"

    })
    .when("/vehicles", {
        templateUrl : "static/templates/vehicles.html",
        controller: "VehiclesListController"

    })
    .when("/hubs", {
        templateUrl : "static/templates/hubs.html",
        controller: "HubsController"

    })
    .when("/parameters", {
        templateUrl : "static/templates/parameters.html",
        controller: "ParametersController"

    })
    .when("/new", {
        templateUrl : "static/templates/new.html",
        controller: "NewScriptingController"

    });

});

rps.controller('MainController', function MainController($scope, $route, $routeParams, $location, $timeout, $firebaseArray, $rootScope) {

    let pointsData = firebase.database().ref().child("points");
    let vehicleTypesData = firebase.database().ref().child("vehicleTypes");
    let vehiclesData = firebase.database().ref().child("vehicles");
    let hubsData = firebase.database().ref().child("hubs");
    let paramsData = firebase.database().ref().child("params");

    $scope.points = $firebaseArray(pointsData);
    $scope.vehicles = $firebaseArray(vehiclesData);
    $scope.vTypes = $firebaseArray(vehicleTypesData);
    $scope.hubs = $firebaseArray(hubsData);
    $scope.parameters = $firebaseArray(paramsData);
    let parameters = $firebaseArray(paramsData);

    $scope.parameters.$loaded(
        function(x) {
            x === $scope.parameters; // true
            $scope.scriptingName = x[0].$value;
            $scope.scriptingStep = x[1].$value;
            $scope.scriptingStepKey = x;
        },
        function(error) {
            console.error("Error:", error);
        });

    $scope.creationDate;
    $scope.updateDate;

    $scope.selectedHubDeparture = '0';
    $scope.selectedHubArrival = '0';

    $scope.filterTypes = {};

    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;

    $scope.toastMessage = '';
    $scope.showToast = false;

    $rootScope.bodyLoading = false;

    $scope.scriptingTitle = 'Nova_roteirização_01'

    $scope.test = function(text) {
      console.log(text);
    }

    $scope.go = function ( path ) {
        $location.path( path );
    };

    $scope.createScripting = function(path) {
        $scope.go(path);
        $scope.setStep(1);
        $scope.creationDate = new Date;
        $scope.updateDate = new Date;
        $scope.thereIsSomeScriptingInProgress = true;
    }

    $scope.exitScripting = function(path) {
        $scope.go(path);
        $scope.updateDate = new Date;
    }

    $scope.setStep = function(step) {
        $scope.parameters[1].$value = step;
        $scope.scriptingStep = step;
        $scope.parameters.$save($scope.parameters.$getRecord('step')).then(function(ref) {
          console.log("deu")
        });
    }

    $scope.filter0 = function (item) {
        return item.type_id == 0;
    };

    $scope.showToastMessage = function(message) {
        $scope.toastMessage = message;
        $scope.showToast = true;

        $timeout(function() {
            $scope.closeToast();
        }, 4000);
    }

    $scope.closeToast = function() {
        $scope.showToast = false;
    }

    $scope.setPosition = function(targetSelector, relativeTo, mgY, mgX, fixed) {
        let doc = document.documentElement,
            docScrollTop = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0),
            windowWidth = doc.getBoundingClientRect().width,
            fPanel = document.querySelectorAll(targetSelector)[0],
            fPanelWidth = fPanel.getBoundingClientRect().width;

        if (fixed == undefined) {
            fixed = true;
        }

        let offsetTop = Math.round(relativeTo.getBoundingClientRect().top) + mgY + docScrollTop,
            offsetLeft = Math.round(relativeTo.getBoundingClientRect().left) + mgX,
            offsetRight = windowWidth - Math.round(relativeTo.getBoundingClientRect().left + relativeTo.getBoundingClientRect().width) + 30;

        if (offsetLeft > windowWidth / 2) {
            angular.element(fPanel).attr('style', 'top: ' + offsetTop + 'px; right: ' + offsetRight + (fixed ? 'px;': 'px; position: absolute;' ));
        } else {
            angular.element(fPanel).attr('style', 'top: ' + offsetTop + 'px; left: ' + offsetLeft + (fixed ? 'px;': 'px; position: absolute;' ));
        }
    }

    $scope.showParam = function(param){
        return $scope.showType[param] != '';
    };

});

rps.controller('ScriptingsListController', function ScriptingsListController($scope, $routeParams) {

    $scope.name = 'scriptings';
    $scope.params = $routeParams;

    $scope.scriptings = [{
        id: 0,
        name: $scope.scriptingName,
        createdAt: $scope.creationDate,
        updatedAt: $scope.updateDate,
        status: $scope.scriptingStep - 1
    }, {
        id: 1,
        name: 'Rot 007AB',
        createdAt: new Date(2017, 4, 1, 9, 36),
        updatedAt: new Date(2017, 4, 14, 10, 57),
        status: 2
    }, {
        id: 2,
        name: 'Roteirização002 V2',
        createdAt: new Date(2017, 4, 4, 10, 21),
        updatedAt: new Date(2017, 4, 6, 10, 23),
        status: 2
    }, {
        id: 3,
        name: 'Roteirização002',
        createdAt: new Date(2017, 5, 14, 7, 58),
        updatedAt: new Date(2017, 6, 1, 11, 34),
        status: 2
    }, {
        id: 4,
        name: 'Roteirização004 AC',
        createdAt: new Date(2017, 5, 24, 9, 31),
        updatedAt: new Date(2017, 5, 24, 10, 54),
        status: 2
    }];

    $scope.showFab = false;

    window.onscroll = function() {

        //fab
        let createButton = document.querySelectorAll('.createButton')[0];
        let createButtonPosition = createButton.getBoundingClientRect().top;

        if (createButtonPosition + 38 < 0) {
            $scope.showFab = true;
        } else {
            $scope.showFab = false;
        }
        $scope.$digest();
    };

    $scope.propertyName = 'name';
    $scope.reverse = false;

    $scope.sortBy = function(propertyName) {
        $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
        $scope.propertyName = propertyName;
    };
});

rps.controller('VehiclesListController', function VehiclesListController($scope, $routeParams, $rootScope, $timeout) {

    $scope.name = 'vehicles';

    let body = document.querySelectorAll('body')[0];
    let topBarNavigation = angular.element(document.getElementsByClassName('top-navigation'))[0];
    let topBarNavigationHeight = topBarNavigation.getBoundingClientRect().height;

    // $scope.showType0 = true;
    // $scope.showType1 = true;
    // $scope.showType2 = true;

    $scope.editVehicle = false;
    $scope.showFilter = false;
    $scope.showMezzanine = false;
    $scope.largerVehicleID = 0;

    $scope.loadingVehicles = true;

    $scope.showVehicleDetails = true;
    $scope.showDetailsControl = true;

    $scope.continueAddVehicle = true;

    $scope.vehicles.$loaded()
    .then(function(x) {
        $scope.loadingVehicles = false;
    })
    .catch(function(error) {
        console.log("Error:", error);
    });

    $scope.addVehicle = function() {
        $scope.largerVehicleIDfn();
        $scope.addLoading = true;
        let vehicleName = $scope.newVehicleLicensePlate;
        $scope.newVehicleId = $scope.largerVehicleID + 1;
        let vehicleId = $scope.newVehicleId;

        $timeout(function() {

            $scope.vehicles.$add({
                id: parseInt($scope.newVehicleId, 10),
                licensePlate : $scope.newVehicleLicensePlate,
                maxValue: parseInt($scope.newVehicleMaxValue, 10),
                type_id: $scope.newVehicleTypeId
            });

            $scope.vTypes[parseInt($scope.newVehicleTypeId)].qty++;
            $scope.vTypes.$save($scope.vTypes[parseInt($scope.newVehicleTypeId)]);

            $scope.newVehicleId = '';
            $scope.newVehicleLicensePlate = '';
            $scope.newVehicleMaxValue = '';
            $scope.newVehicleTypeId = '';
            $scope.addLoading = false;
            $scope.showToastMessage('Veículo ' + vehicleName + ' cadastrado com sucesso');
            $scope.vehicleAdded = vehicleId;

            if ($scope.continueAddVehicle == false) {
                $scope.closeAddVehicle()
            } else {
                document.getElementById("newVehicleLicensePlate").focus()
            }

        }, 500);

        $timeout(function() {
            $scope.vehicleAdded = '';
        }, 800);
    };

    $scope.showAddVehiclePanel = function() {
        $scope.showAddVehicle = true;
        document.getElementById("newVehicleLicensePlate").focus();
    }

    $scope.closeAddVehicle = function() {
        $scope.showAddVehicle = false;
    }

    $scope.deleteVehicle = function(element) {
        $scope.deleteLoading = true;
        let elementName = element.licensePlate;

        $scope.vTypes[element.type_id].qty--;
        $scope.vTypes.$save($scope.vTypes[element.type_id]);

        $timeout(function() {

            $scope.deleteLoading = false;
            $scope.showDeleteDialog = false;
            $scope.vehicleToDelete = null;
            $scope.vehicles.$remove(element).then(function(ref) {
              ref.key === element.$id; // true
            });
            $scope.showToastMessage('Veículo ' + elementName + ' removido com sucesso');

        }, 500);
    }

    $scope.confirmDelete = function (element, elementName) {
        $scope.vehicleToDeleteName = elementName;
        $scope.vehicleToDelete = element;
        $scope.showDeleteDialog = true;
    }

    $scope.cancelDelete = function() {
        $scope.showDeleteDialog = false;
        $scope.vehicleToDelete = null;
    }

    $scope.activeType;
    $scope.showEditItem = function(element) {

        let elementToScroll = document.querySelectorAll('.vehicle-' + element.id)[0];

        $scope.showVehicleDetails = true;
        $scope.showDetailsControl = false;

        $scope.vehicleActive = element.id;
        $scope.vehicleEdit = angular.copy(element);

        $scope.activeType = element.type_id;

        $timeout(function() {
            scrollTo(body, elementToScroll, 300);
            document.getElementById("vehicleLicensePlate-" + element.id).focus();
        }, 100);

    };

    $scope.saveEdit = function(element) {

        $scope.disableSaveButton = true;

        $scope.vTypes[$scope.activeType].qty--;
        $scope.vTypes.$save($scope.vTypes[$scope.activeType]);

        $scope.vTypes[element.type_id].qty++;
        $scope.vTypes.$save($scope.vTypes[element.type_id]);

        $scope.vehicles.$save(element).then(function(ref) {
            ref.key === element.$id; // true
            $scope.showToastMessage('Veículo ' + element.licensePlate + ' editado com sucesso');
            $scope.disableSaveButton = false;
        });
        $scope.vehicleActive = 0;
        $scope.showDetailsControl = true;
    }

    $scope.largerVehicleIDfn = function() {
        $scope.vehicles.map(function(x) {
    	    x.id > $scope.largerVehicleID ? $scope.largerVehicleID = x.id : $scope.largerVehicleID = 0;
        });
    }

    $scope.setModalVisible = false;
    $scope.openEditTypeModal = (id) => {
        var id = parseInt(id);

        $scope.setActiveType(id);
        $scope.setModalVisible = true;
        $timeout(function() {
            document.getElementById("vTypeName-" + id).focus();
        }, 100);
    }

    $scope.activeType = 0;
    $scope.setActiveType = (id) => {
        var id = parseInt(id);

        $scope.activeType = id;
        $timeout(function() {
            document.getElementById("vTypeName-" + id).focus();
        }, 100);
    }

    $scope.updateType = (element) => {
        $scope.vTypes.$save(element).then(function(ref) {
            console.log(element);
        });
    }

    $scope.showFab = false;

    window.onscroll = function() {

        //mezzanine
        let mezzanine = angular.element(document.getElementsByClassName('mezzanine'))[0];
        let val = topBarNavigationHeight - window.pageYOffset;

        if (val < 0) {
            val = 0;
        }

        mezzanine.style.top = val + "px";
        mezzanine.style.height = "calc( 100% - " + val + "px)";


        //fab
        let createButton = document.querySelectorAll('.createButton')[0];
        let createButtonPosition = createButton.getBoundingClientRect().top;

        if (createButtonPosition + 38 < 0) {
          $scope.showFab = true;
        } else {
          $scope.showFab = false;
        }
        $scope.$digest();
    };

    //scroll
    function scrollTo(element, to, duration) {

        var bodyRect = document.body.getBoundingClientRect(),
            elemRect = to.getBoundingClientRect(),
            offset   = elemRect.top - bodyRect.top;

        var start = element.scrollTop,
            change = offset - start -15,
            currentTime = 0,
            increment = 20;

        var animateScroll = function(){
            currentTime += increment;
            var val = Math.easeInOutQuad(currentTime, start, change, duration);
            element.scrollTop = val;
            if(currentTime < duration) {
                setTimeout(animateScroll, increment);
            }
        };
        animateScroll();
    }

    Math.easeInOutQuad = function (t, b, c, d) {
      t /= d/2;
        if (t < 1) return c/2*t*t + b;
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
    };

    //order by content
    $scope.propertyName = "-id";

    $scope.sortBy = function(propertyName) {
        $scope.propertyName = propertyName;
    };

});

rps.controller('NewScriptingController', function NewScriptingController($scope, $routeParams, $rootScope, $window, $timeout) {
    $scope.name = 'new';
    $scope.params = $routeParams;

    $scope.qtyType = {};

    $scope.showAddressContentActive;

    $scope.expandAddressContent = function(index) {
        if($scope.showAddressContentActive == null) {
            $scope.showAddressContent(index);
        }
    }

    $scope.showAddressContent = function(index) {
        var ind = $scope.points.length - index - 1;

        if ($scope.showAddressContentActive == null) {
            $scope.showAddressContentActive = index;
            map.setCenter({lat: $scope.points[ind].lat, lng: $scope.points[ind].lng});
            map.setZoom(20);


            $timeout(function() {
                var element = document.querySelectorAll('.address-group.active .form-group.has-error input')[0];
                if (element) {
                    element.focus();
                }
            }, 500);

        } else if (index != null && index != $scope.showAddressContentActive) {
            $scope.showAddressContentActive = index;
            map.setCenter({lat: $scope.points[ind].lat, lng: $scope.points[ind].lng});
            map.setZoom(20);

            $timeout(function() {
                var element = document.querySelectorAll('.address-group.active .form-group.has-error input')[0];
                if (element) {
                    element.focus();
                }
            }, 500);

        } else {
            $scope.closeAddressContent();
        }
    }

    $scope.closeAddressContent = function() {
        map.setCenter(bh);
        map.setZoom(13);
        $scope.showAddressContentActive = null;
        $scope.refreshMap();
        $scope.returnQtyError();
    }

    $scope.markers = []

    bh = {lat: -19.9265818, lng: -43.9397878};
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: bh
    });

    var geocoder = new google.maps.Geocoder();

    $scope.geocodeAddress = function(address) {
        $rootScope.bodyLoading = true;
        geocoder.geocode({
            address : address
        }, function(results, status) {
            if (status === 'OK') {
                $scope.addPoint(results[0]);
                map.setCenter(results[0].geometry.location);
                var marker = new google.maps.Marker({
                    map: map,
                    label: String($scope.points.length + 1),
                    animation: google.maps.Animation.DROP,
                    position: results[0].geometry.location
                });
                $scope.markers.push(marker);
                $rootScope.bodyLoading = false;
                $scope.addAddressText = '';
                document.getElementById("addAddressText").focus();
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
                $rootScope.bodyLoading = false;
            }
        });
    }

    $scope.loadAddressMarkers = function() {

        $scope.markers = new Array($scope.points.length);
        $scope.points.forEach((element, idx) => {
            geocoder.geocode({
                address : element.route + ', ' + element.street_number + ' - ' + element.subregion + ', ' + element.city + ' - ' + element.state + ', ' + element.postal + ', ' + element.country
            }, function(results, status) {
                if (status === 'OK') {
                    var marker = new google.maps.Marker({
                        map: map,
                        label: String(idx + 1),
                        animation: google.maps.Animation.DROP,
                        position: results[0].geometry.location
                    });
                    $scope.markers[idx] = marker;
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        });
    }

    function setMapOnAll(map) {
        for (var i = 0; i < $scope.markers.length; i++) {
            $scope.markers[i].setMap(map);
        }
    }

    $scope.deleteMarkers = function() {
        setMapOnAll(null);
        $scope.markers = [];
    }

    $scope.refreshMap = function() {
        $scope.deleteMarkers();
        $rootScope.bodyLoading = true;
        $timeout(function() {
            $scope.loadAddressMarkers();
            $rootScope.bodyLoading = false;
        }, 300);
    }

    let addressList = document.querySelectorAll('#address-list')[0];
    let addInput = document.querySelectorAll('#address-list-input')[0];

    $scope.importData = () => {
        $rootScope.bodyLoading = true;
        $timeout(function() {
            $scope.loadAddressMarkers();
            $scope.returnQtyError();
            $scope.somePointsAdded = true;
            $rootScope.bodyLoading = false;
        }, 1000);
    }

    $scope.selectThisFileAndImport = () => {
        $scope.modalToSelectFile = false;
        $timeout(function() {
            $scope.importData();
            $scope.thisIsActive = 0;
        }, 300);
    }

    $scope.qtyErrors;
    $scope.firstErrorArray;

    $scope.returnQtyError = () => {

        $scope.firstErrorArray = [];

        let qtyErrors = 0,
            firstError = null;
        $scope.points.map((point, index) => {
            if (!point.route || !point.street_number || !point.subregion || !point.city || !point.state || !point.country) {
                qtyErrors = qtyErrors + 1;
                $scope.firstErrorArray.push($scope.points.length - index - 1);
            }
        })
        $scope.firstErrorIndex = $scope.firstErrorArray.reverse()[0];
        $scope.qtyErrors = qtyErrors;

        if (!$rootScope.$$phase) {
            $scope.$apply();
        }
    }

    $scope.loadingScale;
    $scope.startScriptingProcess = () => {
        $scope.inProgress = true;
        $scope.loadingScale = 100;

        $timeout(function() {
            $scope.loadingScale = 98;
        }, 500);

        $timeout(function() {
            $scope.loadingScale = 83;
        }, 2000);

        $timeout(function() {
            $scope.loadingScale = 73;
        }, 5000);

        $timeout(function() {
            $scope.loadingScale = 52;
        }, 10000);

        $timeout(function() {
            $scope.loadingScale = 37;
        }, 12000);

        $timeout(function() {
            $scope.loadingScale = 28;
        }, 16000);

        $timeout(function() {
            $scope.loadingScale = 0;
        }, 20000);

        $timeout(function() {
            $scope.finishedP = true;
        }, 22000);

    }

    $scope.nextErrorIndex = 0;
    $scope.nextError = () => {
        $scope.firstErrorArray.reverse().map((x) => {
            if (x > $scope.showAddressContentActive) {
                $scope.nextErrorIndex = x;
            }
        })
        $scope.showAddressContent($scope.nextErrorIndex);
        $scope.firstErrorArray.reverse();
    }

    $scope.prevErrorIndex = 0;
    $scope.prevError = () => {
        $scope.firstErrorArray.map((x) => {
            if (x < $scope.showAddressContentActive) {
                $scope.prevErrorIndex = x;
            }
        })
        $scope.showAddressContent($scope.prevErrorIndex);
    }

    $scope.updateAvailableVehicles = (model, id) => {
        $scope.qtyType[id] = model;
    }

    //scroll
    function scrollTo(element, to, duration) {

        var bodyRect = document.body.getBoundingClientRect(),
            elemRect = to.getBoundingClientRect(),
            offset   = elemRect.top - bodyRect.top;

        var start = element.scrollTop,
            change = offset - start -15,
            currentTime = 0,
            increment = 20;

        var animateScroll = function(){
            currentTime += increment;
            var val = Math.easeInOutQuad(currentTime, start, change, duration);
            element.scrollTop = val;
            if(currentTime < duration) {
                setTimeout(animateScroll, increment);
            }
        };
        animateScroll();
    }

    Math.easeInOutQuad = function (t, b, c, d) {
      t /= d/2;
        if (t < 1) return c/2*t*t + b;
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
    };

    $scope.addPoint = function(pointToAdd) {

        $rootScope.bodyLoading = true;

        let lat = pointToAdd.geometry.location.lat(),
            lng = pointToAdd.geometry.location.lng(),
            street_number = '',
            route = '',
            city = '',
            state = '',
            country = '',
            postal = '',
            subregion = '';

        pointToAdd.address_components.map(function(x) {
            switch(x.types[0]) {
                case 'street_number':
                    street_number = x.long_name;
                    break;

                case 'route':
                    route = x.long_name;
                    break;

                case 'administrative_area_level_2':
                    city = x.long_name;
                    break;

                case 'administrative_area_level_1':
                    state = x.long_name;
                    break;

                case 'country':
                    country = x.long_name;
                    break;

                case 'postal_code':
                    postal = x.long_name;
                    break;

                case 'political':
                    subregion = x.long_name;
                    break;
            }
        });
        $scope.points.$add({
                route : route,
                street_number : street_number,
                subregion : subregion,
                city : city,
                state : state,
                country : country,
                postal : postal,
                lat : lat,
                lng : lng
        });
    }

    $scope.savePoint = function(element) {
        $scope.points.$save(element).then(function(ref) {
            console.log(element)
        });
    }
});

rps.controller('ParametersController', function ParametersController($scope, $routeParams) {
    $scope.name = 'parameters';
    $scope.params = $routeParams;

});

rps.controller('VehicleTypesListController', function VehicleTypesListController($scope, $routeParams) {

    $scope.name = 'vehicleTypes';
    $scope.params = $routeParams;

    $scope.vehicleTypes = [{
        id: 2,
        name: 'Van',
        maxWeight: 200,
        maxVolume: 300.000,
        maxDim: 4
    },{
        id: 1,
        name: 'Caminhão',
        maxWeight: 370,
        maxVolume: 570.000,
        maxDim: 6
    },{
        id: 0,
        name: 'Carreta',
        maxWeight: 450,
        maxVolume: 870.000,
        maxDim: 8
    }];

});

rps.controller('HubsController', function HubsController($scope, $routeParams, $timeout) {
    $scope.name = 'hubs';
    $scope.params = $routeParams;

    $scope.name = 'hubs';

    let body = document.querySelectorAll('body')[0];
    let topBarNavigation = angular.element(document.getElementsByClassName('top-navigation'))[0];
    let topBarNavigationHeight = topBarNavigation.getBoundingClientRect().height;

    $scope.editHub = false;
    $scope.largerHubID = 0;

    $scope.loadingHubs = true;

    $scope.continueAddHub = true;

    $scope.hubs.$loaded()
    .then(function(x) {
        $scope.loadingHubs = false;
    })
    .catch(function(error) {
        console.log("Error:", error);
    });

    $scope.addHub = function() {
        $scope.largerHubIDfn();
        $scope.addLoading = true;
        let hubName = $scope.newHubName;
        $scope.newHubId = $scope.largerHubID + 1;
        let hubId = $scope.newHubId;

        $timeout(function() {

            $scope.hubs.$add({
                id: parseInt($scope.newHubId, 10),
                name : $scope.newHubName,
                address: $scope.newHubAddress
            });

            $scope.newHubId = '';
            $scope.newHubName = '';
            $scope.newHubAddress = '';
            $scope.addLoading = false;
            $scope.showToastMessage('Hub ' + hubName + ' cadastrado com sucesso');
            $scope.hubAdded = hubId;

            if ($scope.continueAddHub == false) {
                $scope.closeAddHub()
            } else {
                document.getElementById("newHubName").focus()
            }

        }, 500);

        $timeout(function() {
            $scope.hubAdded = '';
        }, 800);
    };

    $scope.showAddHubPanel = function() {
        $scope.showAddHub = true;
        document.getElementById("newHubName").focus();
    }

    $scope.closeAddHub = function() {
        $scope.showAddHub = false;
    }

    $scope.deleteHub = function(element) {
        $scope.deleteLoading = true;
        let elementName = element.name;

        $timeout(function() {

            $scope.deleteLoading = false;
            $scope.showDeleteDialog = false;
            $scope.hubToDelete = null;
            $scope.hubs.$remove(element).then(function(ref) {
              ref.key === element.$id; // true
            });
            $scope.showToastMessage('Hub ' + elementName + ' removido com sucesso');

        }, 500);
    }

    $scope.confirmDelete = function (element, elementName) {
        $scope.hubToDeleteName = elementName;
        $scope.hubToDelete = element;
        $scope.showDeleteDialog = true;
    }

    $scope.cancelDelete = function() {
        $scope.showDeleteDialog = false;
        $scope.hubToDelete = null;
    }

    $scope.activeType;
    $scope.showEditItem = function(element) {

        $scope.hubActive = element.id;
        $scope.activeType = element.type_id;

        $timeout(function() {
            document.getElementById("hubName-" + element.id).focus();
        }, 100);

    };

    $scope.saveEdit = function(element) {
        $scope.hubActive = 0;
        $scope.hubs.$save(element).then(function(ref) {
            ref.key === element.$id; // true
            $scope.showToastMessage('Hub ' + element.name + ' editado com sucesso');
        });
    }

    $scope.largerHubIDfn = function() {
        $scope.hubs.map(function(x) {
            x.id > $scope.largerHubID ? $scope.largerHubID = x.id : $scope.largerHubID = 0;
        });
    }

    $scope.showFab = false;

    window.onscroll = function() {

        //fab
        let createButton = document.querySelectorAll('.createButton')[0];
        let createButtonPosition = createButton.getBoundingClientRect().top;

        if (createButtonPosition + 38 < 0) {
          $scope.showFab = true;
        } else {
          $scope.showFab = false;
        }
        $scope.$digest();
    };

    //scroll
    function scrollTo(element, to, duration) {

        var bodyRect = document.body.getBoundingClientRect(),
            elemRect = to.getBoundingClientRect(),
            offset   = elemRect.top - bodyRect.top;

        var start = element.scrollTop,
            change = offset - start -15,
            currentTime = 0,
            increment = 20;

        var animateScroll = function(){
            currentTime += increment;
            var val = Math.easeInOutQuad(currentTime, start, change, duration);
            element.scrollTop = val;
            if(currentTime < duration) {
                setTimeout(animateScroll, increment);
            }
        };
        animateScroll();
    }

    Math.easeInOutQuad = function (t, b, c, d) {
      t /= d/2;
        if (t < 1) return c/2*t*t + b;
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
    };

    //order by content
    $scope.propertyName = 'name';
    $scope.reverse = false;

    $scope.sortBy = function(propertyName) {
        $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
        $scope.propertyName = propertyName;
    };

});

rps.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});
