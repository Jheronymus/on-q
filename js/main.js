function initWebsocket() {
    if (config.wsHost) {
        ws = new WebSocket(config.wsHost);
        ws.onopen = function() {
            if (config.mserverNodeIn) {
                ws.send(JSON.stringify({
                    type: "subscribe",
                    node: config.mserverNodeIn
                }));
            }
        };
        ws.onerror = function(e){
            console.log("error", e);
        };
        ws.onclose = function() {
            console.log("close");
        };
    }

    return ws;
}


angular.module('onq',['ngMaterial','ngStorage']).controller('queueController',[
    '$scope','$localStorage',
    function($scope,$localStorage) {
        $scope.$storage = $localStorage.$default({
            topics: {}
        });

        $scope.ws = initWebsocket();

        ws.onmessage = function(msg) {
            var data = JSON.parse(msg.data);
            if (!$scope.$storage.topics[data.topic]) {
                $scope.$storage.topics[data.topic] = [];
            }
            $scope.$storage.topics[data.topic].push(data);
            $scope.$digest();
        };

        $scope.forward = function(message) {
            ws.send(JSON.stringify({
                type: "publish",
                node: config.mserverNodeOut,
                topic: message.topic,
                data: message.data
            }));
        }

        $scope.decline = function(message) {
            var t = $scope.$storage.topics[message.topic];
            var i = t.indexOf(message);
            t.splice(i,1);
            if (t.length == 0) {
                delete $scope.$storage.topics[message.topic];
            }
        };
    }
]);