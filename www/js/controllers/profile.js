angular
    .module('livein')
    .controller('profile', profile)
    .controller('notification', notification)
    .controller('notificationDetail', notificationDetail)
    .controller('editProfile', editProfile)
    .controller('history', history)
    .controller('myhistory', myhistory)
    .filter('elapsed', elapsed);

    function elapsed() {
        return function (date) {
            if (!date) return;

                var time = Date.parse(date.replace(' ', 'T'));
                timeNow = new Date().getTime();
                difference = timeNow - time;
                seconds = Math.floor(difference / 1000);
                minutes = Math.floor(seconds / 60);
                hours = Math.floor(minutes / 60);
                days = Math.floor(hours / 24);

            if (days > 1)
                return days + " days";

            if (hours > 1)
                return hours + " h";

            if (minutes > 1)
                return minutes + " m";

                return "a few seconds ago";

        }
    }

    function profile($scope, $rootScope, $state, $localStorage, $filter, $ionicPopup, $ionicLoading, LoginService, Notification, ProfileService, $window) {
        $scope.fullname = $localStorage.currentUser.data[0].fullname;
        $scope.logoutConfirm = logoutConfirm;

        countnotif();

        function countnotif() {
            Notification.listnotif(
                function (response) {
                    if (response != false) {
                        $scope.listnotifUser = response;
                        $scope.listnotif = [];

                        var a = 0;
                        angular.forEach($scope.listnotifUser, function (obj) {
                            var b = a++;
                            var list = $scope.listnotifUser;
                            var data = list[b];
                            var isread = data.isread;

                            if (isread === 'f') {
                                $scope.listnotif.push({
                                    'isread': isread
                                });
                            }
                        });

                        if ($scope.listnotif.length === 0) {
                            $scope.countnotif = 0;
                        } else {
                            $scope.countnotif = $scope.listnotif.length;
                        }
                    } else {
                        $scope.listnotifUser = { name: $filter('translate')('failed_get_data') };
                        $scope.countnotif = 0;
                    }
                    $ionicLoading.hide();
                });
        }

        retrievegetaccount();

        function retrievegetaccount() {
            ProfileService.retrievegetaccount(
                function (response) {
                    if (response != false) {
                        var account = response.account;
                        var arrayLength = account.length;
                        for (var i = 0; i < arrayLength; i++) {
                            $scope.avatar = account[i].avatar;
                        }
                    } else {
                        $scope.dataaccount = { name: $filter('translate')('failed_get_data') };
                    }
                });

        }

        function logoutConfirm() {
            var confirmPopup = $ionicPopup.confirm({
                template: $filter('translate')('dialog_signout'),
                okText: $filter('translate')('yes'),
                cancelText: $filter('translate')('no'),
                okType: "button-stable"
            });

            confirmPopup.then(function (res) {
                if (res) {
                    LoginService.logoutUser();
                    $rootScope.buttonDisabled = false;
                    $ionicLoading.show({ template: $filter('translate')('logoutmessage') + "...", duration: 500 });
                    $state.go('login');
                }
            });
        }
    }

    function notification($scope, $stateParams, $ionicLoading, $location, $state, Notification, $ionicPopup, $filter, $window) {
        $scope.insertbookmarknotif = insertbookmarknotif;
        $scope.deletebookmarknotif = deletebookmarknotif;

        listnotifService();

        function listnotifService() {
            $ionicLoading.show({ template: $filter('translate')('loading') + "..." });
            Notification.listnotif(
                function (response) {
                    if (response != false) {
                        $scope.listnotifUser = [];
                        $scope.listnotifUser = response;

                    } else {
                        $scope.listnotifUser = { name: $filter('translate')('failed_get_data') };
                    }
                    $ionicLoading.hide();
                });
        };

        function insertbookmarknotif(idnotif) {
            Notification.insertBookmarkNotif(
                idnotif,
                function (response) {
                    if (response != false) {
                        $ionicLoading.show({
                            template: $filter('translate')('success_favorite'),
                            duration: 5000
                        });
                        listnotifService();
                    } else {
                        $ionicLoading.show({
                            template: $filter('translate')('failed_favorite'),
                            duration: 5000
                        });
                        listnotifService();
                    }
                    $ionicLoading.hide();
                });
        };

        function deletebookmarknotif(idnotifbookmark) {
            Notification.deleteBookmarkNotif(
                idnotifbookmark,
                function (response) {
                    if (response != false) {
                        $ionicLoading.show({
                            template: $filter('translate')('remove_favorite_success'),
                            duration: 5000
                        });
                        listnotifService();
                    } else {
                        $ionicLoading.show({
                            template: $filter('translate')('remove_favorite_failed'),
                            duration: 5000
                        });
                        listnotifService();
                    }
                    $ionicLoading.hide();
                });
        };

        var initial_state = false;
        $scope.show = initial_state;

        // toggle value
        $scope.showFooter = function () {
            $scope.show = !$scope.show;
        }

        $scope.delete = function (idnotif) {
            var p = [];
            var results = [];
            var a = 0;

            for (var i = 0; i < $scope.listnotifUser.length; i++) {
                var item = $scope.listnotifUser[i];
                if (item.checked) {
                    p.push(item)
                }
            }
            $scope.selectedItems = p;

            angular.forEach($scope.selectedItems, function (obj) {
                var b = a++;
                var data = $scope.selectedItems;
                var dat = data[b];
                var ll = dat.idnotif;

                results = dat.idnotif;
                $scope.idku = results;

                Notification.deleteNotif(results, function (response) {
                    if (response != false) {
                        $ionicLoading.show({
                            template: $filter('translate')('msg_deleted'),
                            duration: 5000
                        });
                        listnotifService();
                    } else {
                        $ionicLoading.show({
                            template: $filter('translate')('msg_delete_failed'),
                            duration: 5000
                        });
                        listnotifService();
                    }
                });
            })

        }

        $scope.readed = function () {
            var p = [];
            var results = [];
            var a = 0;

            for (var i = 0; i < $scope.listnotifUser.length; i++) {
                var item = $scope.listnotifUser[i];
                if (item.checked) {
                    p.push(item)
                }
            }
            $scope.selectedItems = p;

            angular.forEach($scope.selectedItems, function (obj) {
                var b = a++;
                var data = $scope.selectedItems;
                var dat = data[b];
                var ll = dat.idnotif;

                results = dat.idnotif;
                $scope.idku = results;

                Notification.updateNotif(results, function (response) {
                    if (response != false) {
                        $ionicLoading.show({
                            template: $filter('translate')('msg_marked'),
                            duration: 5000
                        });
                        listnotifService();
                    } else {
                        $ionicLoading.show({
                            template: $filter('translate')('msg_update_failed'),
                            duration: 5000
                        });
                        listnotifService();
                    }
                });
            })
        }
    }

    function notificationDetail($scope, $stateParams, $ionicLoading, $location, $state, Notification, $ionicPopup, $ionicHistory, $filter) {
        $scope.goBack = function () {
            $state.go('app.notification');
        };
        Notification.listnotif(function (response) {
            if (response != false) {
                $scope.results = [];
                $scope.notif = response;

                var a = 0;
                angular.forEach($scope.notif, function (obj) {
                    var b = a++;
                    var list = $scope.notif;
                    var data = list[b];
                    var ll = data.idnotif;

                    if (ll == $stateParams.idnotif) {
                        $scope.results.push(list[b]);
                    }
                })

            } else {
                $.data = { name: $filter('translate')('failed_get_data') };
            }

        });

        Notification.detailNotif(function (response) {
            if (response != false) {
                $scope.details = response.notif;
                $scope.bookmarked = $stateParams.bookmarked;
            } else {
                $.data = { name: $filter('translate')('failed_get_data') };
            }

        });
    }

    function editProfile($scope, $ionicLoading, $location, $state, EditProfileService, ProfileService,
        $cordovaCamera, $cordovaFile, $cordovaFileTransfer, $cordovaDevice, $ionicPopup, $cordovaActionSheet, $filter) {
        $scope.saveEditProfile = saveEditProfile;

        $scope.isRead = true;
        $scope.isEdit1 = true;
        $scope.ShowRead = function () {
            //If DIV is hidden it will be visible and vice versa.
            $scope.isRead = $scope.isRead ? false : true;
        }
        $scope.ShowEdit = function () {
            //If DIV is hidden it will be visible and vice versa.
            $scope.isEdit1 = $scope.isEdit1 ? false : true;
        }
        console.log($scope.isRead);
        // console.log($localStorage.currentUser.data[0]);
        dataProfile();

        function dataProfile() {
            $ionicLoading.show({ template: $filter('translate')('loading') + "..." });
            ProfileService.retrievegetaccount(
                function (response) {
                    if (response != false) {
                        $scope.dataaccount = response.account;
                    } else {
                        $scope.dataaccount = { name: $filter('translate')('failed_get_data') };
                    }

                    $ionicLoading.hide();
                });
        }

        $scope.image = null;

        function saveEditProfile(user) {
            $ionicLoading.show({ template: $filter('translate')('loading') + "..." });
            console.log(user);

            var filename = $scope.image; // File name only

            if (filename === null) {
                var avatarupdate = user.avatar;
                // user.avatar avatar lama
            } else {
                var url = encodeURI("http://innodev.vnetcloud.com/LiveInWeb/assets/img/upload_file_avatar.php");
                var targetPath = $scope.pathForImage($scope.image); // File for Upload

                var options = {
                    fileKey: "file",
                    fileName: filename,
                    chunkedMode: false,
                    mimeType: "multipart/form-data",
                    params: { 'fileName': filename }
                };

                $cordovaFileTransfer.upload(url, targetPath, options)
                    .then(function (result) {
                        // $scope.showAlert('Success', 'Image upload finished.');
                        console.log("Image upload finished");
                    });

                /*
                  alert("Upload File: " + targetPath);

                  function win(r) {
                    alert("Code = " + r.responseCode);
                    alert("Response = " + r.response);
                    alert("Sent = " + r.bytesSent);
                  }

                  function fail(error) {
                    alert("upload error source " + error.source);
                    alert("upload error target " + error.target);
                  }

                  var uri = encodeURI(url);

                  var options = new FileUploadOptions();
                  options.fileKey     = "file";
                  options.mimeType    = "text/plain";
                  options.fileName    = filename;
                  options.chunkedMode = false;
                  options.params      = { 'fileName': filename };

                  var headers = {
                    'from': 'ios-app'
                  };
                  options.headers = headers;
                  var ft = new FileTransfer();

                  ft.upload(targetPath, uri, win, fail, options).then(function (result) {
                    // $scope.showAlert('Success', 'Image upload finished.');
                    console.log("Image upload finished");
                    alert('bisa keupload coy')
                  });

              */

                var avatarupdate = "http://innodev.vnetcloud.com/LiveInWeb/assets/img/account/" + filename;
                // var avatarupdate = "http://192.168.0.13/jihan/uploads/" + filename;
            }

            EditProfileService.editprofile(
                user.idaccount,
                user.gender,
                user.phone,
                user.dateofbirth,
                user.fullname,
                user.address,
                avatarupdate,
                user.pscode,
                user.privilege,
                user.password,
                user.email,
                function (response) {
                    if (response != false) {
                        console.log(response);
                        var alertPopup = $ionicPopup.alert({
                            title: $filter('translate')('msg_update'),
                            template: $filter('translate')('msg_update_success'),
                            okText: $filter('translate')('okay'),
                            okType: "button-stable",
                            cssClass: "alertPopup"
                        });
                        dataProfile();
                    } else {
                        var alertPopup = $ionicPopup.alert({
                            title: $filter('translate')('msg_update'),
                            template: $filter('translate')('msg_update_failed'),
                            okText: $filter('translate')('okay'),
                            okType: "button-stable",
                            cssClass: "alertPopup"
                        });
                        dataProfile();
                    }
                    $ionicLoading.hide();
                });
        };

        $scope.showAlert = function (title, msg) {
            var alertPopup = $ionicPopup.alert({
                title: title,
                template: msg,
                okType: "button-stable",
                cssClass: "alertPopup"
            });
        };

        // The rest of the app comes in here
        // Present Actionsheet for switch beteen Camera / Library
          $scope.loadImage = function () {
            var callback = function(buttonIndex) {
              setTimeout(function() {
                alert('button index clicked: ' + buttonIndex);
              });
            };

            var options = {
              title: $filter('translate')('select_image_source'),
              buttonLabels: [$filter('translate')('load_from_library'), $filter('translate')('use_camera')],
              addCancelButtonWithLabel: $filter('translate')('cancel'),
              androidEnableCancelButton: true,
              winphoneEnableCancelButton: true,
              destructiveButtonLast: true
            };
             $cordovaActionSheet.show(options, callback).then(function (btnIndex) {
             var type = null;
             if (btnIndex === 1) {
             type = Camera.PictureSourceType.PHOTOLIBRARY;
             } else if (btnIndex === 2) {
             type = Camera.PictureSourceType.CAMERA;
             }
             if (type !== null) {
             $scope.selectPicture(type);
             }
             });
          };

        $scope.selectPicture = function (sourceType) {
            var options = {
                quality: 100,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: sourceType,
                saveToPhotoAlbum: false
            };

            $cordovaCamera.getPicture(options).then(function (imagePath) {
                // Grab the file name of the photo in the temporary directory
                var currentName = imagePath.replace(/^.*[\\\/]/, '');
                alert(currentName);
                //Create a new name for the photo
                var d = new Date(),
                    n = d.getTime(),
                    newFileName = "account-" + n + ".jpg";

                if ($cordovaDevice.getPlatform() == 'Android' && sourceType === Camera.PictureSourceType.PHOTOLIBRARY) {
                    window.FilePath.resolveNativePath(imagePath, function (entry) {
                        window.resolveLocalFileSystemURL(entry, success, fail);

                        function fail(e) {
                            console.error('Error: ', e);
                        }

                        function success(fileEntry) {
                            var namePath = fileEntry.nativeURL.substr(0, fileEntry.nativeURL.lastIndexOf('/') + 1);
                            // Only copy because of access rights
                            $cordovaFile.copyFile(namePath, fileEntry.name, cordova.file.dataDirectory, newFileName)
                                .then(function (success) {
                                    $scope.image = newFileName;

                                }, function (error) {
                                    $scope.showAlert('Error', error.exception);
                                });
                        };
                    });
                } else {
                    var namePath = imagePath.substr(0, imagePath.lastIndexOf('/') + 1);
                    // Move the file to permanent storage
                    $cordovaFile.moveFile(namePath, currentName, cordova.file.dataDirectory, newFileName)
                        .then(function (success) {
                            $scope.image = newFileName;
                        }, function (error) {
                            $scope.showAlert('Error', error.exception);
                        });
                }
            },
                function (err) {
                    // Not always an error, maybe cancel was pressed...
                })
        };

        $scope.pathForImage = function (image) {
            if (image === null) {
                return '';
            } else {
                return cordova.file.dataDirectory + image;
            }
        };
    }

    function history($scope, $localStorage) {
        $scope.idaccount = $localStorage.currentUser.data[0].idaccount;
    }

    function myhistory($scope, $stateParams, $localStorage, $ionicLoading, HistoryService, $filter) {
        $ionicLoading.show({ template: $filter('translate')('loading') + "...", duration: 1000 });
        $scope.idaccount = $localStorage.currentUser.data[0].idaccount;

        HistoryService.listHistory($stateParams.idaccount, function (response) {
            if (response != false) {
                $scope.data = response;
            } else {
                $scope.data = [{ name: $filter('translate')('no_user') }];
            }
            $ionicLoading.hide();
        });

    }
