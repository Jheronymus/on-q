

angular.module('onq',['ngMaterial','ngStorage'])
.controller('settingsDialogController', [
    '$scope', '$mdDialog',
    function($scope,$mdDialog) {
        $scope.hide = function() {
            $mdDialog.hide();
        };
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.answer = function(answer) {
            $mdDialog.hide(answer);
        };
    }
]).controller('queueController',[
    '$scope','$localStorage','$mdDialog','$timeout',
    function($scope,$localStorage,$mdDialog,$timeout) {
        $scope.connected = false;
        var backoff = 100;
        var maxBackoff = 5000;
        var pendingConnection;

        function initWebsocket(config) {
            var ws;
            if (config.host) {
                if (pendingConnection) {
                    $timeout.cancel(pendingConnection);
                }
                ws = new WebSocket(config.host);

                ws.onopen = function() {
                    if (config.nodeIn) {
                        ws.send(JSON.stringify({
                            type: "subscribe",
                            node: config.nodeIn
                        }));
                        $scope.connected = true;
                        backoff = 100;
                    }
                    $scope.$digest();
                };
                ws.onerror = function(e){
                    console.log("error");
                    ws.close();
                };
                ws.onclose = function() {
                    console.log("close reconnecting in",backoff,'ms');
                    $scope.connected = false;
                    $scope.$digest();
                    pendingConnection = $timeout($scope.connect,backoff);
                    backoff = Math.min(maxBackoff,backoff * 2);
                };
                ws.onmessage = function(msg) {
                    var data = JSON.parse(msg.data);
                    if (data.topic) {
                        if (!$scope.$storage.topics[data.topic]) {
                            $scope.$storage.topics[data.topic] = [];
                        }
                        $scope.$storage.topics[data.topic].push(data);
                    }
                    $scope.$digest();
                };
            }

            return ws;
        }

        $scope.connect = function() {
            $scope.ws = initWebsocket($scope.$storage.settings);
        };

        $scope.$storage = $localStorage.$default({
            topics: {},
            settings: {
                host: 'ws://localhost:13900',
                nodeIn: 'onq-in',
                nodeOut: 'onq-out'
            }
        });

        $scope.connect();



        $scope.forward = function(message) {
            $scope.ws.send(JSON.stringify({
                type: "publish",
                node: $scope.$storage.settings.nodeOut,
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

        $scope.editSettingsDlg = function() {
            return $mdDialog.show({
                parent: angular.element(document.body),
                templateUrl: 'editSettingsDialogTemplate',
                controller: 'settingsDialogController',
                scope: $scope.$new()
            }).then(function(result) {
                if (result) {
                    $scope.ws.close();
                }
            });
        }
    }
]);