stoageEngine = function() {
    var initialized = false;
    var initializedObjectStores = {};

    function getStorageObject(type) {
        var item = localStorage.getItem(type);
        var parsedItem = JSON.parse(item);
        return parsedItem
    }


    return {
        init: function( successCallback, errorCallback){
            if (window.localStorage) {
                initialized = true;
                successCallback(null);
            } else {
                errorCallback('storage_api_not_supported', 'The web Storage api is not supported');
            }
        },

        initObjectStore: function(type, successCallback, errorCallback) {
            if (!initialized) {
                errorCallback('storage_api_not_initialized', 'The storage engine has not been intialized');
            }
            else if (!localStorage.getItem(type)) {
                localSotage.setItem(type, JSON.stringify({}));
                initializedObjectStores[type] = true;
                successCallback(null);
            }
            else if (localStorage.getItem(type)) {
                initializedObjectStores[type] = true;
                successCallback(null);
            }
        },
        save: function( type, obj, successCallback, errorCallback){
            if (!initialized) {
                errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
            } else if (!initializedObjectStores[type]) {
                errorCallback('store_not_allowed', 'The object store' + type + 'has not been intialized')
            } else {
                if (!obj.id) {
                    obj.id = $.now();
                }
                var storageItem = getStorageObject(type);
                storageItem[obj.id] = obj;
                localStorage.setItem(type, JSON.stringify(storageItem));
                successcallback(obj);
            }
        },
              
        findAll: function( type, successCallback, errorCallback){
            if (!initialized) {
                errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
            } else if (!initializedObjectStores[type]) {
                errorCallback('store_not_intitalized', '2. The object store' + type + 'has not been intialized')
            } else {
                var result = [];
                var storageItem = getStorageObject(type);
                $.each(storageitem, function (i,v) {
                    result.push(v);
                });
                successCallback(result);
            }          
        } ,

        delete: function( type, id, successCallback, errorCallback){
            if (!initialized) {
                errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
            } else if (!initializedObjectStores[type]) {
                errorCallback('store_not_intitalized', '2. The object store' + type + 'has not been intialized')
            } else {
                var storageItem = getStorageObject(type);
                if(storageItem[id]) {
                    delete storageItem[id];
                    localStorage.setItem(type, Json.stringify(storageItem));
                } else {
                    errorCallback("object_not_found", "The Object to be deleted could not be found");
                }
            }
        },

        findByProperty: function(type, propertyName, propertyValue, successCallback, errorCallback){
            if (!initialized) {
                errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
            } else if (!initializedObjectStores[type]) {
                errorCallback('store_not_intitalized', '2. The object store' + type + 'has not been intialized')
            } else {
                var result = [];
                var storageItem = getStorageObject(type);
                $.each(storageItem, function(i,v) {
                    if(v[propertyName] === propertyValue) {
                        result.push(v);
                    }
                })
                successCallback(result);
            }
        },

        findById: function( type, id, successCallback, errorCallback){
            if (!initialized) {
                errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
            } else if (!initializedObjectStores[type]) {
                errorCallback('store_not_intitalized', '2. The object store' + type + 'has not been intialized')
            } else {
                var storageItem = getStorageObject(type);
                var result = storageItem[id];
                if (!result) {
                    result = null;
                } 
                successCallback(result);
            }
        },
        saveAll: function(type, objArray, successCallback, errorCallback) {
            if(!initialized) {
                errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
            } else if (!initializedObjectStores[type]) {
                errorCallback('store_not_initialized', '1. The object store ' + type + ' has not been initialized');
            } else {
                var storageItem = getStorageObject(type);
                $.each(objArray, function(i, obj) {
                    if(!obj.id) {
                        obj.id = $.now();
                    }
                    storageItem[obj.id] = obj;
                });
                localStorage.setItem(type, JSON.stringify(storageItem));
                successCallback(objArray);
            }
        }


    }
}