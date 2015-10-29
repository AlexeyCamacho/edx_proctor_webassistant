'use strict';

(function () {
    angular.module('proctor').controller('MainCtrl', ['$scope', '$interval', 'WS', 'Api', 'NgTableParams', function ($scope, $interval, WS, Api, NgTableParams) {

        $scope.ws_data = {};

        $scope.websocket_callback = function(msg){
            if (msg && msg['examCode']) {
                var idx = msg['hash'];
                $scope.ws_data[idx] = angular.copy(msg);
                $scope.ws_data[idx]['status'] = '';
                $scope.$apply();
            }
        };

        WS.init('attempts', $scope.websocket_callback, true);

        var update_status = function(idx, status){
            $scope.ws_data[idx]['status'] = status;
        };

        $scope.accept_exam_attempt = function (code) {
            Api.accept_exam_attempt(code)
                .success(function (data) {
                    update_status(data['hash'], data['status']);
                    if (data['status'] == 'OK') {
                        $interval(function(){
                            Api.get_exam_status(code)
                                .success(function(data){
                                    update_status(data['hash'], data['status']);
                                })
                        }, 1500);
                    }
                })
                .error(function (data) {

                });
        };

        $scope.send_review = function(code){
            Api.send_review(code);
        };

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10
        }, {
            data: function () {
                var data = [];
                angular.forEach($scope.ws_data, function(value, key){
                    data.push(value);
                });
                return data;
            }()
        });
    }]);
})();