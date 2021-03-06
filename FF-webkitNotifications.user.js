// ==UserScript==
//
// @name           FF-webkitNotifications
// @description    A shim implementing the webkitNotifications API for Firefox.
// @homepage       https://github.com/Elusive138/FF-webkitNotifications
// @namespace      http://elu138.com/
// @author         Bob, Elusive138 (http://github.com/elusive138/)
// @license        MIT License (http://opensource.org/licenses/mit-license.php)
//
// @include        *
//
// @version        1.0.0
//
// @grant          none
//
// @run-at         document-start
//
// ==/UserScript==

window.webkitNotifications = {};

window.webkitNotifications.PERMISSION_ALLOWED = 0;
window.webkitNotifications.PERMISSION_NOT_ALLOWED = 1;
window.webkitNotifications.PERMISSION_DENIED = 2;

// Returns an integer, either PERMISSION_ALLOWED, PERMISSION_NOT_ALLOWED, 
// or PERMISSION_DENIED, which indicates the permission level granted 
// to the origin of the script currently executing.
//
// * PERMISSION_ALLOWED (0) indicates that the user has granted permission 
//   to scripts with this origin to show notifications.
// * PERMISSION_NOT_ALLOWED (1) indicates that the user has not taken an 
//   action regarding notifications for scripts from this origin.
// * PERMISSION_DENIED (2) indicates that the user has explicitly blocked 
//   scripts with this origin from showing notifications.
window.webkitNotifications.checkPermission = function() {
    // Retrieve the permission from the native API and translate
    // into the webkitNotifications expected response.
    switch (window.Notification.permission) {
        case "default":
            return window.webkitNotifications.PERMISSION_NOT_ALLOWED;
        case "denied":
            return window.webkitNotifications.PERMISSION_DENIED;
        case "granted":
            return window.webkitNotifications.PERMISSION_ALLOWED;
        default:
            // The API is broken.
            throw "window.Notification.permission has an invalid value.";
    }
}

// Requests that the user agent ask the user for permission to show 
// notifications from scripts.  This method should only be called while 
// handling a user gesture; in other circumstances it will have no effect. 
// This method is asynchronous.  The function provided in callback will be 
// invoked when the user has responded to the permission request.  If the 
// current permission level is PERMISSION_DENIED, the user agent may take 
// no action in response to requestPermission.
window.webkitNotifications.requestPermission = function(callback) {
    // Fire off a permission request via the native API and call the callback
    // in its callback.
    setTimeout(function() {
        window.Notification.requestPermission(function() {
            if (callback)
                callback();
        });
    }, 0);
}

// Creates a new notification object with the provided content.  
//
// * iconUrl contains the URL of an image resource to be shown with the 
//   notification; 
// * title contains a string which is the primary text of the notification; 
// * body contains a string which is secondary text for the notification.  
//
// If the origin of the script which executes this method does not have 
// permission level PERMISSION_ALLOWED, this method will throw a security exception.
window.webkitNotifications.createNotification = function(iconUrl, title, body) {
    // A custom object is necessary, because the creation of a normal
    // Notification object automatically shows it whereas the webkitNotifications
    // object is supposed to be shown on a call to .show()
    var notificationObject = {}
    
    notificationObject._title = title;
    
    notificationObject._options = {
        body: body,
        icon: iconUrl
    }
    
    notificationObject.show = function() {
        notificationObject._notification = new window.Notification(notificationObject._title, notificationObject._options);  
        
        // Implementing events as simple callbacks for now. Not sure if they're
        // supposed to be 'proper' events?
        // TODO: use CustomEvents if necessary.
        notificationObject._notification.onclick = function() {
            if (notificationObject.onclick)
                notificationObject.onclick();
        };
        notificationObject._notification.onshow = function() {
            if (notificationObject.ondisplay)
                notificationObject.ondisplay();
        };
        notificationObject._notification.onerror = function() {
            if (notificationObject.onerror)
                notificationObject.onerror();
        };
        notificationObject._notification.onclose = function() {
            if (notificationObject.onclose)
                notificationObject.onclose();
        };
    }
    
    notificationObject.cancel = function() {
        if (notificationObject._notification)
            notificationObject._notification.close();
    };
    
    return notificationObject;
}