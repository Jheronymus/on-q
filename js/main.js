

angular.module('onq',['ngMaterial','ngStorage'])
.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('blue')
    .accentPalette('light-green');
}).controller('settingsDialogController', [
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
]).controller('messageDialogController', [
    '$scope', '$mdDialog', 'topic',
    function($scope,$mdDialog,topic) {
        $scope.message.topic = topic;
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
                        $scope.enqueue(data);
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
            settings: onqConfig
        });

        $scope.connect();

        $scope.enqueue = function(message) {
            if (!$scope.$storage.topics[message.topic]) {
                $scope.$storage.topics[message.topic] = [];
            }
            $scope.$storage.topics[message.topic].push(message);
        }

        $scope.forward = function(message) {
            $scope.ws.send(JSON.stringify({
                type: "publish",
                node: $scope.$storage.settings.nodeOut,
                topic: message.topic,
                data: message.data,
                headers: {
                    keep: message.headerkeep
                }
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

        $scope.declineAll = function(topic) {
            delete $scope.$storage.topics[topic];
        }

        $scope.noTopics = function() {
            return !Object.keys($scope.$storage.topics).length;
        }

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

        $scope.isString = function(obj) {
            return angular.isString(obj);
        }
        $scope.isObject = function(obj) {
            return angular.isObject(obj);
        }

        $scope.isJSON = function(str) {
            try {
                JSON.parse(str);
                return true;
            } catch(e) {
                return false;
            }
        }

        $scope.$watch('message.yaml',function(newValue) {
            if ($scope.message) {
                try {
                    $scope.message.data = jsyaml.safeLoad(newValue);
                } catch(e) {
                    $scope.message.data = newValue;
                }
            }
        });

        $scope.addMessageDlg = function(topicName) {
            $scope.message = {yaml:''};
            return $mdDialog.show({
                parent: angular.element(document.body),
                templateUrl: 'addMessageDialogTemplate',
                controller: 'messageDialogController',
                scope: $scope.$new(),
                resolve: {
                    topic: function(){
                        return topicName;
                    }
                }
            }).then(function(result) {
                if (result) {
                    $scope.enqueue(result);
                }
            });
        }
    }
]);